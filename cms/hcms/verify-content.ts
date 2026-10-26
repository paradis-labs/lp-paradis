// Verifica que o CONTEÚDO do hcms está pronto para servir o site: completo,
// traduzido e equivalente ao que o Payload serve hoje.
//
//   npm run cms:verify
//   npm run cms:verify > cms/hcms/reports/AAAA-MM-DD.txt   # guardar o relatório
//
// Três partes no relatório:
//   1. textos de exemplo — qualquer campo traduzido com `[EXEMPLO]` (sempre
//      bloqueante, nunca aceitável como exceção);
//   2. traduções em falta — preenchido num idioma e vazio no outro;
//   3. diferenças face ao Payload — campo a campo e por locale, depois de
//      normalizar espaços, rich text e o prefixo de locale dos URLs. As listas
//      são emparelhadas por identidade (slug ou título), e a ordem é reportada
//      à parte, sem contar como falha.
//
// **Só leitura nos dois CMS.** O hcms é lido com `TOKEN_SECRET_READ` (via
// `client.ts`, que só expõe `readItems`); o Payload com a Local API, só com
// `find`/`findGlobal` e `fallbackLocale: false` — com fallback, um campo `pt`
// em falta no Payload seria comparado em inglês e esconderia a tradução em
// falta. As diferenças intencionais vivem em `accepted-differences.json`.
//
// Corre com `payload run` (Local API no mesmo processo, `.env` carregado). O
// `payload run` sai com 0 depois de importar o script, por isso o código de
// saída é fixado aqui com `process.exit`.
//
// O mapeamento campo a campo segue `openspec/changes/cms-phase-1-hcms-alignment`
// com UMA correção, confirmada pelo render da home e pelos textos já no hcms:
// o bloco `#about-us` (`block_media_text`) é `services.title/subtitle/primaryCta`
// e a grelha `#services` (`block_collection`) é `services.ourServicesCT`.

import { readFileSync } from "node:fs";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { marked } from "marked";
import { getPayload } from "payload";
import { createReader, errorMessage, type Row, SITE_SLUG } from "./client.ts";

type Lang = "en-US" | "pt-AO";
const LANGS: { lang: Lang; locale: "en" | "pt" }[] = [
  { lang: "en-US", locale: "en" },
  { lang: "pt-AO", locale: "pt" },
];

const MARKER = "[EXEMPLO]";

// As rotas do site são fixas e a página é escolhida pela `key` (fase 1).
const ROUTES: Record<string, string> = { home: "/", contact: "/get-quote" };

// ── Modelo ─────────────────────────────────────────────────────────────────

type Value = string | null;

type Field = {
  // O nome do campo no domínio (`@/content`).
  name: string;
  // O caminho no hcms, só para o relatório.
  hcms: string;
  // `media` compara só a presença: os ficheiros vivem em sítios diferentes.
  kind: "text" | "rich" | "url" | "media";
  // `false` quando o valor do hcms não vem das traduções (ficheiros, flags,
  // destinos de navegação): compara-se uma vez e não há tradução em falta.
  translated?: boolean;
  // `true` quando o Payload tem um só valor para os dois idiomas (campo não
  // localizado, como os títulos das secções da home): só o `en-US` se compara.
  payloadOnce?: boolean;
};

type Item = {
  key: string;
  // O registo no hcms, para o relatório (`home → block_hero`).
  label: string;
  values: Record<Lang, Record<string, Value>>;
  // Campos do mapeamento que não existem nos registos do hcms.
  absent: string[];
};

type Section = {
  id: string;
  list: boolean;
  fields: Field[];
  payload: Item[];
  hcms: Item[];
  // A coleção do hcms por trás de uma lista, para distinguir "0 visíveis".
  collection?: string;
};

// ── Normalizadores ─────────────────────────────────────────────────────────

// Aspas tipográficas contam como as retas: o Payload tem `Let’s`, o hcms
// `Let's`, e o conteúdo é o mesmo.
function normalizeText(value: Value): Value {
  const text = value
    ?.replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return text ? text : null;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// O HTML do Lexical e o do WYSIWYG diferem na marcação, não no conteúdo: fica
// o texto, com uma linha por parágrafo.
function normalizeRich(value: Value): Value {
  if (!value) return null;
  const text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|div|blockquote|tr)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name] ?? match)
    .split("\n")
    .map(normalizeText)
    .filter(Boolean)
    .join("\n");
  return text || null;
}

// `/en/get-quote` (hcms) ↔ `/get-quote` (Payload); `#services` ↔ `/#services`.
function normalizeUrl(value: Value): Value {
  let url = value?.trim();
  if (!url) return null;
  url = url.replace(/^\/(en|pt)(?=[/#?]|$)/, "");
  if (url === "") url = "/";
  if (url.startsWith("#") && url.length > 1) url = `/${url}`;
  // A barra final, mas não a da raiz (`/` ou `/#services`).
  url = url.replace(/(.)\/(?=$|[#?])/, "$1");
  return url;
}

function normalize(field: Field, value: Value): Value {
  switch (field.kind) {
    case "rich":
      return normalizeRich(value);
    case "url":
      return normalizeUrl(value);
    case "media":
      return value ? "(ficheiro)" : null;
    default:
      return normalizeText(value);
  }
}

const keyOf = (value: unknown, fallback: string) =>
  normalizeText(typeof value === "string" ? value : null)?.toLowerCase() ??
  fallback;

// ── Leitura solta ──────────────────────────────────────────────────────────

function at(source: unknown, path: string): unknown {
  let current = source;
  for (const part of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function asValue(value: unknown): Value {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["filename", "url", "id"]) {
      if (object[key] != null) return String(object[key]);
    }
  }
  return null;
}

const asRows = (value: unknown): Row[] =>
  Array.isArray(value)
    ? value.filter((row): row is Row => !!row && typeof row === "object")
    : [];

// ── hcms ───────────────────────────────────────────────────────────────────

const read = createReader("lp-paradis-cms-verify/1.0");

// Os registos lidos, com o rótulo de cada um: a varredura de `[EXEMPLO]` passa
// por todos.
const scanned: { label: string; record: Row }[] = [];

function track(label: string, record: Row | undefined) {
  if (record) scanned.push({ label, record });
  return record;
}

const translation = (record: Row | undefined, lang: Lang) =>
  asRows(record?.translations).find((row) => row.languages_code === lang);

type Getter = (lang: Lang) => unknown;

// Um item do hcms. Um nome em `spec` é um campo da tradução; uma função lê o
// que for preciso (botões, highlights, campos do registo).
function hcmsItem(
  key: string,
  label: string,
  record: Row | undefined,
  spec: Record<string, string | Getter>,
): Item {
  const rows = asRows(record?.translations);
  const absent = Object.entries(spec)
    .filter(
      ([, source]) =>
        typeof source === "string" &&
        rows.length > 0 &&
        !rows.some((row) => source in row),
    )
    .map(([, source]) => source as string);

  const values = {} as Item["values"];
  for (const { lang } of LANGS) {
    values[lang] = {};
    for (const [name, source] of Object.entries(spec)) {
      values[lang][name] = asValue(
        typeof source === "string"
          ? translation(record, lang)?.[source]
          : source(lang),
      );
    }
  }
  return { key, label, values, absent };
}

const enText = (record: Row | undefined, field: string) =>
  translation(record, "en-US")?.[field];

async function readHcms() {
  const [site] = await read("sites", {
    fields: ["*", "translations.*"],
    filter: { slug: { _eq: SITE_SLUG } },
    limit: 1,
  });
  if (!site) throw new Error(`site "${SITE_SLUG}" não visível ao token`);
  track(`sites[${SITE_SLUG}]`, site);
  const siteFilter = { site: { _eq: site.id } };

  const pages = await read("pages", {
    fields: ["id", "key", "translations.*"],
    filter: { ...siteFilter, key: { _in: Object.keys(ROUTES) } },
    limit: -1,
  });
  const pageKey = new Map(pages.map((page) => [page.id, String(page.key)]));
  const contactPage = track(
    "pages[contact]",
    pages.find((page) => page.key === "contact"),
  );

  const pageBlocks = await read("page_blocks", {
    fields: ["collection", "item", "anchor_id", "pages_id"],
    filter: { pages_id: { _in: pages.map((page) => page.id) } },
    limit: -1,
  });

  // Só os blocos do mapeamento, por página, coleção e âncora.
  async function block(page: string, collection: string, anchor?: string) {
    const ref = pageBlocks.find(
      (row) =>
        pageKey.get(row.pages_id) === page &&
        row.collection === collection &&
        (row.anchor_id ?? null) === (anchor ?? null),
    );
    const label = `${page} → ${collection}${anchor ? ` #${anchor}` : ""}`;
    if (!ref) return { label, record: undefined };
    const [record] = await read(collection, {
      fields: ["*", "translations.*"],
      filter: { id: { _eq: ref.item } },
      limit: 1,
    });
    return { label, record: track(label, record) };
  }

  const blocks = {
    hero: await block("home", "block_hero"),
    about: await block("home", "block_media_text", "about-us"),
    services: await block("home", "block_collection", "services"),
    products: await block("home", "block_collection", "products"),
    testimonials: await block("home", "block_collection", "testimonials"),
    faqs: await block("home", "block_collection", "faqs"),
    form: await block("contact", "block_form"),
    contact: await block("contact", "block_contact"),
  };

  const navigationRows = await read("navigations", {
    fields: ["key", "items.*", "items.translations.*"],
    filter: siteFilter,
    limit: -1,
  });
  // `items` traz a árvore achatada: os filhos também aparecem no topo.
  const navigations = new Map(
    navigationRows.map((navigation) => {
      const items = asRows(navigation.items).sort(
        (a, b) => Number(a.sort) - Number(b.sort),
      );
      for (const item of items) {
        track(
          `navigations[${navigation.key}] → "${enText(item, "label") ?? item.id}"`,
          item,
        );
      }
      return [String(navigation.key), items] as const;
    }),
  );

  const [form] = await read("forms", {
    fields: ["id", "translations.*", "fields.name", "fields.translations.*"],
    filter: { ...siteFilter, key: { _eq: "quote_request" } },
    limit: 1,
  });
  track("forms[quote_request]", form);
  for (const field of asRows(form?.fields)) {
    track(`forms[quote_request].fields[${field.name}]`, field);
  }

  // Sem `sort` na query: o campo pode não existir em todas as coleções (os
  // testemunhos e as FAQs ainda não são visíveis), e um `sort` desconhecido é
  // erro do Directus. A ordem faz-se aqui.
  async function collection(name: string, labelKey: (row: Row) => unknown) {
    const rows = await read(name, {
      fields: ["*", "translations.*"],
      filter: { ...siteFilter, status: { _eq: "published" } },
      limit: -1,
    });
    rows.sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0));
    for (const row of rows) track(`${name}[${labelKey(row) ?? row.id}]`, row);
    return rows;
  }

  return {
    site,
    pageKey,
    contactPage,
    blocks,
    navigations,
    form,
    offerings: await collection(
      "offerings",
      (row) => enText(row, "slug") ?? row.key,
    ),
    projects: await collection("projects", (row) => enText(row, "slug")),
    testimonials: await collection("testimonials", (row) => row.author_name),
    faqs: await collection("faqs", (row) => enText(row, "question")),
  };
}

type Hcms = Awaited<ReturnType<typeof readHcms>>;

// ── Payload ────────────────────────────────────────────────────────────────

async function readPayload() {
  // Fora de produção, o adaptador de Postgres faz `push` do schema ao ligar
  // (DDL na base do Payload). `PAYLOAD_MIGRATING` desliga-o, e é o único efeito
  // desta variável: o script não pode escrever, nem no schema.
  process.env.PAYLOAD_MIGRATING = "true";
  const payload = await getPayload({ config });
  const byLang = {} as Record<Lang, Record<string, unknown>>;
  for (const { lang, locale } of LANGS) {
    const options = { depth: 2, locale, fallbackLocale: false } as const;
    const [menu, footer, homepage, quote, contact] = await Promise.all([
      payload.findGlobal({ slug: "menu", ...options }),
      payload.findGlobal({ slug: "footer", ...options }),
      payload.findGlobal({ slug: "homepage", ...options }),
      payload.findGlobal({ slug: "get-quote-page", ...options }),
      payload.find({ collection: "contact", limit: 1, ...options }),
    ]);
    byLang[lang] = { menu, footer, homepage, quote, contact: contact.docs[0] };
  }
  return byLang;
}

type Payload = Awaited<ReturnType<typeof readPayload>>;

// Um valor escalar do Payload, por idioma.
function payloadItem(
  data: Payload,
  spec: Record<string, (root: Record<string, unknown>) => unknown>,
): Item {
  const values = {} as Item["values"];
  for (const { lang } of LANGS) {
    values[lang] = {};
    for (const [name, get] of Object.entries(spec)) {
      values[lang][name] = asValue(get(data[lang]));
    }
  }
  return { key: "—", label: "payload", values, absent: [] };
}

// Uma lista do Payload. As linhas `en` e `pt` são o mesmo registo (mesmo id);
// a identidade para emparelhar com o hcms vem da linha `en`.
function payloadList(
  data: Payload,
  path: string,
  key: (row: Row, index: number) => string,
  spec: Record<string, (row: Row) => unknown>,
): Item[] {
  const en = asRows(at(data["en-US"], path));
  const pt = asRows(at(data["pt-AO"], path));
  return en.map((row, index) => {
    const twin = pt.find((other) => other.id === row.id) ?? pt[index];
    const values = { "en-US": {}, "pt-AO": {} } as Item["values"];
    for (const [name, get] of Object.entries(spec)) {
      values["en-US"][name] = asValue(get(row));
      values["pt-AO"][name] = twin ? asValue(get(twin)) : null;
    }
    return { key: key(row, index), label: "payload", values, absent: [] };
  });
}

const lexicalToHtml = (value: unknown) =>
  value && typeof value === "object" && "root" in value
    ? convertLexicalToHTML({
        disableContainer: true,
        data: value as Parameters<typeof convertLexicalToHTML>[0]["data"],
      })
    : null;

// ── Secções: o mapeamento domínio → Payload ↔ hcms ─────────────────────────

const VARIANTS: Record<string, string> = {
  button_primary: "primary",
  button_secondary: "outline",
};

function buildSections(p: Payload, h: Hcms): Section[] {
  const { site, blocks, navigations } = h;

  // O destino de um item de navegação, como o provider da fase 3 o resolverá.
  const target = (item: Row): Value => {
    if (item.type === "url") return asValue(item.url);
    const route = ROUTES[h.pageKey.get(item.page) ?? ""] ?? `?${item.page}`;
    return item.type === "anchor" ? `${route}#${item.anchor}` : route;
  };
  const topLevel = (key: string) =>
    (navigations.get(key) ?? []).filter((item) => item.parent == null);
  const children = (key: string, parent: Row) =>
    (navigations.get(key) ?? []).filter((item) => item.parent === parent.id);
  const button =
    (record: Row | undefined, index: number, field: string) => (lang: Lang) =>
      at(asRows(translation(record, lang)?.buttons)[index], field);

  const navItem = (key: string) => (item: Row) =>
    hcmsItem(
      keyOf(enText(item, "label"), String(item.id)),
      `navigations[${key}] → "${enText(item, "label") ?? item.id}"`,
      item,
      {
        label: "label",
        url: () => target(item),
        openInNewTab: () => item.open_in_new_tab,
        variant: () => VARIANTS[String(item.variant)] ?? item.variant,
      },
    );

  // Os botões podem estar dentro de um grupo (que dá o título) ou soltos.
  const ctaGroup = topLevel("footer_actions").find(
    (item) => item.type === "group",
  );
  const ctaItems = ctaGroup
    ? children("footer_actions", ctaGroup)
    : topLevel("footer_actions");
  const ctaButton = (variant: string) =>
    ctaItems.find((item) => item.variant === variant);
  const primary = ctaButton("button_primary");
  const outline = ctaButton("button_secondary");

  const highlight = (index: number) => (lang: Lang) =>
    at(
      asRows(translation(blocks.form.record, lang)?.highlights)[index],
      "text",
    );

  const formField = (name: string) =>
    asRows(h.form?.fields).find((field) => field.name === name);
  const fieldLabel = (name: string) => (lang: Lang) =>
    translation(formField(name), lang)?.label;
  const fieldMessage = (name: string, code: string) => (lang: Lang) =>
    asRows(translation(formField(name), lang)?.messages).find(
      (message) => message.code === code,
    )?.text;

  const offering = (row: Row) =>
    hcmsItem(
      keyOf(enText(row, "slug") ?? row.key, String(row.id)),
      `offerings[${enText(row, "slug") ?? row.key}]`,
      row,
      { title: "title", shortDescription: "summary" },
    );
  const service = (row: Row) => keyOf(row.slug, String(row.id));

  return [
    // ── NavBar ──
    {
      id: "navbar.logo",
      list: false,
      fields: [
        { name: "image", hcms: "logo", kind: "media", translated: false },
        {
          name: "imageLight",
          hcms: "logo_inverse",
          kind: "media",
          translated: false,
        },
      ],
      payload: [
        payloadItem(p, {
          image: (root) => at(root, "menu.logo.image"),
          imageLight: (root) => at(root, "menu.logo.imageLight"),
        }),
      ],
      hcms: [
        hcmsItem("—", `sites[${SITE_SLUG}]`, site, {
          image: () => site.logo,
          imageLight: () => site.logo_inverse,
        }),
      ],
    },
    {
      id: "navbar.links",
      list: true,
      fields: [
        { name: "label", hcms: "label", kind: "text" },
        {
          name: "url",
          hcms: "type/page/anchor/url",
          kind: "url",
          translated: false,
        },
        {
          name: "openInNewTab",
          hcms: "open_in_new_tab",
          kind: "text",
          translated: false,
        },
      ],
      payload: payloadList(
        p,
        "menu.links",
        (row, index) => keyOf(row.label, `#${index}`),
        {
          label: (row) => row.label,
          url: (row) => row.url,
          openInNewTab: (row) => row.openInNewTab ?? false,
        },
      ),
      hcms: topLevel("header").map(navItem("header")),
    },
    {
      id: "navbar.buttons",
      list: true,
      fields: [
        { name: "label", hcms: "label", kind: "text" },
        {
          name: "url",
          hcms: "type/page/anchor/url",
          kind: "url",
          translated: false,
        },
        { name: "variant", hcms: "variant", kind: "text", translated: false },
        {
          name: "openInNewTab",
          hcms: "open_in_new_tab",
          kind: "text",
          translated: false,
        },
      ],
      payload: payloadList(
        p,
        "menu.buttons",
        (row, index) => keyOf(row.label, `#${index}`),
        {
          label: (row) => row.label,
          url: (row) => row.url,
          variant: (row) => row.variant ?? "primary",
          openInNewTab: (row) => row.openInNewTab ?? false,
        },
      ),
      hcms: topLevel("header_actions").map(navItem("header_actions")),
    },

    // ── Footer ──
    {
      id: "footer",
      list: false,
      fields: [
        {
          name: "logo",
          hcms: "logo_inverse",
          kind: "media",
          translated: false,
        },
        { name: "tagline", hcms: "tagline", kind: "text" },
        { name: "copyrightText", hcms: "copyright_text", kind: "text" },
        { name: "email", hcms: "email", kind: "text", translated: false },
      ],
      payload: [
        payloadItem(p, {
          logo: (root) => at(root, "footer.logo"),
          tagline: (root) => at(root, "footer.tagline"),
          copyrightText: (root) => at(root, "footer.copyrightText"),
          email: (root) => at(root, "contact.email"),
        }),
      ],
      hcms: [
        hcmsItem("—", `sites[${SITE_SLUG}]`, site, {
          logo: () => site.logo_inverse,
          tagline: "tagline",
          copyrightText: "copyright_text",
          email: () => site.email,
        }),
      ],
    },
    {
      id: "footer.directContact",
      list: false,
      fields: [
        { name: "reachHeading", hcms: "title", kind: "text" },
        { name: "emailHeading", hcms: "email_label", kind: "text" },
        { name: "socialHeading", hcms: "social_label", kind: "text" },
      ],
      payload: [
        payloadItem(p, {
          reachHeading: (root) => at(root, "footer.directContact.reachHeading"),
          emailHeading: (root) => at(root, "footer.directContact.emailHeading"),
          socialHeading: (root) =>
            at(root, "footer.directContact.socialHeading"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.contact.label, blocks.contact.record, {
          reachHeading: "title",
          emailHeading: "email_label",
          socialHeading: "social_label",
        }),
      ],
    },
    {
      id: "footer.linkGroups",
      list: true,
      fields: [{ name: "title", hcms: "label", kind: "text" }],
      payload: payloadList(
        p,
        "footer.linkGroups",
        (row, index) => keyOf(row.title, `#${index}`),
        { title: (row) => row.title },
      ),
      hcms: topLevel("footer_columns").map((group) =>
        hcmsItem(
          keyOf(enText(group, "label"), String(group.id)),
          `navigations[footer_columns] → "${enText(group, "label")}"`,
          group,
          { title: "label" },
        ),
      ),
    },
    {
      id: "footer.links",
      list: true,
      fields: [
        { name: "name", hcms: "label", kind: "text" },
        {
          name: "href",
          hcms: "type/page/anchor/url",
          kind: "url",
          translated: false,
        },
        {
          name: "isExternal",
          hcms: "open_in_new_tab",
          kind: "text",
          translated: false,
        },
      ],
      payload: asRows(at(p["en-US"], "footer.linkGroups")).flatMap(
        (group, groupIndex) => {
          const ptGroup = asRows(at(p["pt-AO"], "footer.linkGroups")).find(
            (other) => other.id === group.id,
          );
          const ptLinks = asRows(ptGroup?.links);
          return asRows(group.links).map((link, index) => {
            const twin = ptLinks.find((other) => other.id === link.id);
            const values = (row: Row | undefined) => ({
              name: asValue(row?.name),
              href: asValue(row?.href),
              isExternal: row ? asValue(row.isExternal ?? false) : null,
            });
            return {
              key: `${keyOf(group.title, `#${groupIndex}`)} › ${keyOf(link.name, `#${index}`)}`,
              label: "payload",
              values: { "en-US": values(link), "pt-AO": values(twin) },
              absent: [],
            };
          });
        },
      ),
      hcms: topLevel("footer_columns").flatMap((group) =>
        children("footer_columns", group).map((link) =>
          hcmsItem(
            `${keyOf(enText(group, "label"), String(group.id))} › ${keyOf(enText(link, "label"), String(link.id))}`,
            `navigations[footer_columns] → "${enText(link, "label") ?? link.id}"`,
            link,
            {
              name: "label",
              href: () => target(link),
              isExternal: () => link.open_in_new_tab,
            },
          ),
        ),
      ),
    },
    {
      id: "footer.cta",
      list: false,
      fields: [
        { name: "heading", hcms: "grupo.label", kind: "text" },
        {
          name: "primaryButton.label",
          hcms: "button_primary.label",
          kind: "text",
        },
        {
          name: "primaryButton.href",
          hcms: "button_primary → destino",
          kind: "url",
          translated: false,
        },
        {
          name: "outlineButton.label",
          hcms: "button_secondary.label",
          kind: "text",
        },
        {
          name: "outlineButton.href",
          hcms: "button_secondary → destino",
          kind: "url",
          translated: false,
        },
      ],
      payload: [
        payloadItem(p, {
          heading: (root) => at(root, "footer.cta.heading"),
          "primaryButton.label": (root) =>
            at(root, "footer.cta.primaryButton.label"),
          "primaryButton.href": (root) =>
            at(root, "footer.cta.primaryButton.href"),
          "outlineButton.label": (root) =>
            at(root, "footer.cta.outlineButton.label"),
          "outlineButton.href": (root) =>
            at(root, "footer.cta.outlineButton.href"),
        }),
      ],
      hcms: [
        hcmsItem("—", "navigations[footer_actions]", ctaGroup, {
          heading: "label",
          "primaryButton.label": (lang) => translation(primary, lang)?.label,
          "primaryButton.href": () => (primary ? target(primary) : null),
          "outlineButton.label": (lang) => translation(outline, lang)?.label,
          "outlineButton.href": () => (outline ? target(outline) : null),
        }),
      ],
    },
    {
      // O hcms não tem `label` nas redes (lacuna conhecida da fase 1).
      id: "footer.socialLinks",
      list: true,
      fields: [{ name: "url", hcms: "url", kind: "url", translated: false }],
      payload: payloadList(
        p,
        "footer.socialLinks",
        (row, index) => keyOf(row.platform, `#${index}`),
        { url: (row) => row.url },
      ),
      hcms: asRows(site.social_links)
        .filter((social) => social.state === "live")
        .map((social, index) =>
          hcmsItem(
            keyOf(social.platform, `#${index}`),
            `sites[${SITE_SLUG}].social_links`,
            undefined,
            { url: () => social.url },
          ),
        ),
    },

    // ── Homepage ──
    {
      id: "homepage.hero",
      list: false,
      fields: [
        { name: "headline", hcms: "title", kind: "text" },
        { name: "subheadline", hcms: "eyebrow", kind: "text" },
        { name: "description", hcms: "lead", kind: "text" },
        { name: "primaryCta.label", hcms: "buttons[0].label", kind: "text" },
        { name: "primaryCta.url", hcms: "buttons[0].url", kind: "url" },
        { name: "secondaryCta.label", hcms: "buttons[1].label", kind: "text" },
        { name: "secondaryCta.url", hcms: "buttons[1].url", kind: "url" },
        {
          name: "backgroundImage",
          hcms: "image",
          kind: "media",
          translated: false,
        },
      ],
      payload: [
        payloadItem(p, {
          headline: (root) => at(root, "homepage.hero.item.headline"),
          subheadline: (root) => at(root, "homepage.hero.item.subheadline"),
          description: (root) => at(root, "homepage.hero.item.description"),
          "primaryCta.label": (root) =>
            at(root, "homepage.hero.item.primaryCta.label"),
          "primaryCta.url": (root) =>
            at(root, "homepage.hero.item.primaryCta.url"),
          "secondaryCta.label": (root) =>
            at(root, "homepage.hero.item.secondaryCta.label"),
          "secondaryCta.url": (root) =>
            at(root, "homepage.hero.item.secondaryCta.url"),
          backgroundImage: (root) =>
            at(root, "homepage.hero.item.backgroundImage"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.hero.label, blocks.hero.record, {
          headline: "title",
          subheadline: "eyebrow",
          description: "lead",
          "primaryCta.label": button(blocks.hero.record, 0, "label"),
          "primaryCta.url": button(blocks.hero.record, 0, "url"),
          "secondaryCta.label": button(blocks.hero.record, 1, "label"),
          "secondaryCta.url": button(blocks.hero.record, 1, "url"),
          backgroundImage: () => blocks.hero.record?.image,
        }),
      ],
    },
    {
      // O bloco "about" (`#about-us`): título, texto e CTA da secção de
      // serviços, e o vídeo de fundo.
      id: "homepage.services",
      list: false,
      fields: [
        { name: "title", hcms: "title", kind: "text", payloadOnce: true },
        { name: "subtitle", hcms: "lead", kind: "text", payloadOnce: true },
        { name: "primaryCta.label", hcms: "buttons[0].label", kind: "text" },
        { name: "primaryCta.url", hcms: "buttons[0].url", kind: "url" },
        {
          name: "ourServicesCT.backgroundVideo",
          hcms: "media",
          kind: "media",
          translated: false,
        },
      ],
      payload: [
        payloadItem(p, {
          title: (root) => at(root, "homepage.services.title"),
          subtitle: (root) => at(root, "homepage.services.subtitle"),
          "primaryCta.label": (root) =>
            at(root, "homepage.services.primaryCta.label"),
          "primaryCta.url": (root) =>
            at(root, "homepage.services.primaryCta.url"),
          "ourServicesCT.backgroundVideo": (root) =>
            at(root, "homepage.services.ourServicesCT.backgroundVideo"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.about.label, blocks.about.record, {
          title: "title",
          subtitle: "lead",
          "primaryCta.label": button(blocks.about.record, 0, "label"),
          "primaryCta.url": button(blocks.about.record, 0, "url"),
          "ourServicesCT.backgroundVideo": () => blocks.about.record?.media,
        }),
      ],
    },
    {
      // A grelha de serviços (`#services`).
      id: "homepage.services.ourServicesCT",
      list: false,
      fields: [
        { name: "title", hcms: "title", kind: "text" },
        { name: "description", hcms: "lead", kind: "text" },
      ],
      payload: [
        payloadItem(p, {
          title: (root) => at(root, "homepage.services.ourServicesCT.title"),
          description: (root) =>
            at(root, "homepage.services.ourServicesCT.description"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.services.label, blocks.services.record, {
          title: "title",
          description: "lead",
        }),
      ],
    },
    {
      id: "homepage.services.items",
      list: true,
      collection: "offerings",
      fields: [
        { name: "title", hcms: "title", kind: "text" },
        { name: "shortDescription", hcms: "summary", kind: "text" },
      ],
      payload: payloadList(p, "homepage.services.items", service, {
        title: (row) => row.title,
        shortDescription: (row) => row.shortDescription,
      }),
      hcms: h.offerings.map(offering),
    },
    {
      id: "homepage.projects",
      list: false,
      fields: [
        { name: "title", hcms: "title", kind: "text", payloadOnce: true },
        { name: "subtitle", hcms: "lead", kind: "text", payloadOnce: true },
        { name: "primaryCta.label", hcms: "buttons[0].label", kind: "text" },
        { name: "primaryCta.url", hcms: "buttons[0].url", kind: "url" },
      ],
      payload: [
        payloadItem(p, {
          title: (root) => at(root, "homepage.projects.title"),
          subtitle: (root) => at(root, "homepage.projects.subtitle"),
          "primaryCta.label": (root) =>
            at(root, "homepage.projects.primaryCta.label"),
          "primaryCta.url": (root) =>
            at(root, "homepage.projects.primaryCta.url"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.products.label, blocks.products.record, {
          title: "title",
          subtitle: "lead",
          "primaryCta.label": button(blocks.products.record, 0, "label"),
          "primaryCta.url": button(blocks.products.record, 0, "url"),
        }),
      ],
    },
    {
      id: "homepage.projects.items",
      list: true,
      collection: "projects",
      fields: [
        { name: "title", hcms: "title", kind: "text" },
        { name: "description", hcms: "summary", kind: "text" },
        { name: "url", hcms: "url", kind: "url", translated: false },
        { name: "coverImage", hcms: "image", kind: "media", translated: false },
      ],
      payload: payloadList(p, "homepage.projects.items", service, {
        title: (row) => row.title,
        description: (row) => row.description,
        url: (row) => row.url,
        coverImage: (row) => row.coverImage,
      }),
      hcms: h.projects.map((row) =>
        hcmsItem(
          keyOf(enText(row, "slug"), String(row.id)),
          `projects[${enText(row, "slug")}]`,
          row,
          {
            title: "title",
            description: "summary",
            url: () => row.url,
            coverImage: () => row.image,
          },
        ),
      ),
    },
    {
      id: "homepage.testimonials",
      list: false,
      fields: [
        { name: "title", hcms: "title", kind: "text", payloadOnce: true },
        { name: "subtitle", hcms: "lead", kind: "text", payloadOnce: true },
      ],
      payload: [
        payloadItem(p, {
          title: (root) => at(root, "homepage.testimonials.title"),
          subtitle: (root) => at(root, "homepage.testimonials.subtitle"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.testimonials.label, blocks.testimonials.record, {
          title: "title",
          subtitle: "lead",
        }),
      ],
    },
    {
      id: "homepage.testimonials.items",
      list: true,
      collection: "testimonials",
      fields: [
        {
          name: "authorName",
          hcms: "author_name",
          kind: "text",
          translated: false,
        },
        { name: "tag", hcms: "author_role", kind: "text" },
        { name: "quote", hcms: "quote", kind: "text" },
        { name: "avatar", hcms: "avatar", kind: "media", translated: false },
      ],
      payload: payloadList(
        p,
        "homepage.testimonials.items",
        (row) => keyOf(row.authorName, String(row.id)),
        {
          authorName: (row) => row.authorName,
          tag: (row) => row.tag,
          quote: (row) => row.quote,
          avatar: (row) => row.avatar,
        },
      ),
      hcms: h.testimonials.map((row) =>
        hcmsItem(
          keyOf(row.author_name, String(row.id)),
          `testimonials[${row.author_name ?? row.id}]`,
          row,
          {
            authorName: () => row.author_name,
            tag: "author_role",
            quote: "quote",
            avatar: () => row.avatar,
          },
        ),
      ),
    },
    {
      id: "homepage.faqs",
      list: false,
      fields: [
        { name: "title", hcms: "title", kind: "text", payloadOnce: true },
        { name: "subtitle", hcms: "lead", kind: "text", payloadOnce: true },
      ],
      payload: [
        payloadItem(p, {
          title: (root) => at(root, "homepage.faqs.title"),
          subtitle: (root) => at(root, "homepage.faqs.subtitle"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.faqs.label, blocks.faqs.record, {
          title: "title",
          subtitle: "lead",
        }),
      ],
    },
    {
      // Campos do hcms POR CONFIRMAR (tarefa 3.1), como os testemunhos.
      id: "homepage.faqs.items",
      list: true,
      collection: "faqs",
      fields: [
        { name: "question", hcms: "question", kind: "text" },
        { name: "answer", hcms: "answer", kind: "rich" },
      ],
      payload: payloadList(
        p,
        "homepage.faqs.items",
        (row) => keyOf(row.question, String(row.id)),
        {
          question: (row) => row.question,
          answer: (row) => lexicalToHtml(row.answer),
        },
      ),
      hcms: h.faqs.map((row) =>
        hcmsItem(
          keyOf(enText(row, "question"), String(row.id)),
          `faqs[${enText(row, "question") ?? row.id}]`,
          row,
          {
            question: "question",
            // Markdown no hcms: comparado como HTML, como o site o mostra.
            answer: (lang) => {
              const answer = translation(row, lang)?.answer;
              return typeof answer === "string"
                ? marked.parse(answer, { async: false, gfm: true })
                : null;
            },
          },
        ),
      ),
    },

    // ── Página de orçamento ──
    {
      id: "quotePage.seo",
      list: false,
      fields: [
        { name: "metaTitle", hcms: "seo_title", kind: "text" },
        { name: "metaDescription", hcms: "seo_description", kind: "text" },
      ],
      payload: [
        payloadItem(p, {
          metaTitle: (root) => at(root, "quote.seo.metaTitle"),
          metaDescription: (root) => at(root, "quote.seo.metaDescription"),
        }),
      ],
      hcms: [
        hcmsItem("—", "pages[contact]", h.contactPage, {
          metaTitle: "seo_title",
          metaDescription: "seo_description",
        }),
      ],
    },
    {
      id: "quotePage.hero",
      list: false,
      fields: [
        { name: "headline", hcms: "title", kind: "text" },
        { name: "intro", hcms: "lead", kind: "text" },
        {
          name: "availability.label",
          hcms: "highlights[0].text",
          kind: "text",
        },
        {
          name: "availability.location",
          hcms: "highlights[1].text",
          kind: "text",
        },
      ],
      payload: [
        payloadItem(p, {
          headline: (root) => at(root, "quote.hero.headline"),
          intro: (root) => at(root, "quote.hero.intro"),
          "availability.label": (root) => at(root, "quote.availability.label"),
          "availability.location": (root) =>
            at(root, "quote.availability.location"),
        }),
      ],
      hcms: [
        hcmsItem("—", blocks.form.label, blocks.form.record, {
          headline: "title",
          intro: "lead",
          "availability.label": highlight(0),
          "availability.location": highlight(1),
        }),
      ],
    },
    {
      id: "quotePage.form",
      list: false,
      fields: [
        { name: "eyebrow", hcms: "title", kind: "text" },
        { name: "nameLabel", hcms: "fields[name].label", kind: "text" },
        { name: "emailLabel", hcms: "fields[email].label", kind: "text" },
        {
          name: "interestsLabel",
          hcms: "fields[interests].label",
          kind: "text",
        },
        { name: "messageLabel", hcms: "fields[message].label", kind: "text" },
        { name: "submitLabel", hcms: "submit_label", kind: "text" },
        { name: "privacyNote", hcms: "privacy_note", kind: "text" },
        { name: "messages.success", hcms: "success_message", kind: "text" },
        { name: "messages.error", hcms: "error_message", kind: "text" },
        {
          name: "messages.nameRequired",
          hcms: "fields[name].messages[required]",
          kind: "text",
        },
        {
          name: "messages.emailRequired",
          hcms: "fields[email].messages[required]",
          kind: "text",
        },
        {
          name: "messages.emailInvalid",
          hcms: "fields[email].messages[invalid]",
          kind: "text",
        },
        {
          name: "messages.messageRequired",
          hcms: "fields[message].messages[required]",
          kind: "text",
        },
        {
          name: "messages.tooLong",
          hcms: "fields[message].messages[too_long]",
          kind: "text",
        },
      ],
      payload: [
        payloadItem(p, {
          eyebrow: (root) => at(root, "quote.form.eyebrow"),
          nameLabel: (root) => at(root, "quote.form.nameLabel"),
          emailLabel: (root) => at(root, "quote.form.emailLabel"),
          interestsLabel: (root) => at(root, "quote.form.interestsLabel"),
          messageLabel: (root) => at(root, "quote.form.messageLabel"),
          submitLabel: (root) => at(root, "quote.form.submitLabel"),
          privacyNote: (root) => at(root, "quote.form.privacyNote"),
          "messages.success": (root) => at(root, "quote.form.messages.success"),
          "messages.error": (root) => at(root, "quote.form.messages.error"),
          "messages.nameRequired": (root) =>
            at(root, "quote.form.messages.nameRequired"),
          "messages.emailRequired": (root) =>
            at(root, "quote.form.messages.emailRequired"),
          "messages.emailInvalid": (root) =>
            at(root, "quote.form.messages.emailInvalid"),
          "messages.messageRequired": (root) =>
            at(root, "quote.form.messages.messageRequired"),
          "messages.tooLong": (root) => at(root, "quote.form.messages.tooLong"),
        }),
      ],
      hcms: [
        hcmsItem("—", "forms[quote_request]", h.form, {
          eyebrow: "title",
          nameLabel: fieldLabel("name"),
          emailLabel: fieldLabel("email"),
          interestsLabel: fieldLabel("interests"),
          messageLabel: fieldLabel("message"),
          submitLabel: "submit_label",
          privacyNote: "privacy_note",
          "messages.success": "success_message",
          "messages.error": "error_message",
          "messages.nameRequired": fieldMessage("name", "required"),
          "messages.emailRequired": fieldMessage("email", "required"),
          "messages.emailInvalid": fieldMessage("email", "invalid"),
          "messages.messageRequired": fieldMessage("message", "required"),
          "messages.tooLong": fieldMessage("message", "too_long"),
        }),
      ],
    },
    {
      // Os interesses do formulário são as `offerings` (`choices_source`).
      id: "quotePage.form.interests",
      list: true,
      collection: "offerings",
      fields: [{ name: "title", hcms: "title", kind: "text" }],
      payload: payloadList(p, "quote.form.interests", service, {
        title: (row) => row.title,
      }),
      hcms: h.offerings.map(offering),
    },
  ];
}

// ── Exceções aceites ───────────────────────────────────────────────────────

type Accepted = {
  differences: { field: string; locale?: Lang; reason: string }[];
  pairs: { list: string; payload: string; hcms: string; reason: string }[];
};

function loadAccepted(problems: string[]): Accepted {
  const raw = JSON.parse(
    readFileSync(
      new URL("./accepted-differences.json", import.meta.url),
      "utf8",
    ),
  ) as Partial<Accepted>;
  const accepted: Accepted = { differences: [], pairs: [] };
  for (const entry of raw.differences ?? []) {
    if (!entry?.field || !entry.reason?.trim())
      problems.push(
        `diferença sem "field" ou "reason": ${JSON.stringify(entry)}`,
      );
    else if (entry.locale && !LANGS.some(({ lang }) => lang === entry.locale))
      problems.push(`locale desconhecido em ${entry.field}: ${entry.locale}`);
    else accepted.differences.push(entry);
  }
  for (const entry of raw.pairs ?? []) {
    if (!entry?.list || !entry.payload || !entry.hcms || !entry.reason?.trim())
      problems.push(
        `par sem "list", "payload", "hcms" ou "reason": ${JSON.stringify(entry)}`,
      );
    else accepted.pairs.push(entry);
  }
  return accepted;
}

// ── Relatório ──────────────────────────────────────────────────────────────

type Difference = {
  field: string;
  lang?: Lang;
  where: string;
  payload?: Value;
  hcms?: Value;
  note?: string;
};

const show = (value: Value | undefined) =>
  value == null ? "(vazio)" : JSON.stringify(value);

function scanExamples(): string[] {
  const found: string[] = [];
  const walk = (label: string, lang: string, path: string, value: unknown) => {
    if (typeof value === "string") {
      if (value.includes(MARKER))
        found.push(`${label}.${path} (${lang}) — ${show(value)}`);
    } else if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        walk(label, lang, `${path}[${index}]`, entry);
      });
    } else if (value && typeof value === "object") {
      for (const [key, entry] of Object.entries(value))
        walk(label, lang, `${path}.${key}`, entry);
    }
  };
  for (const { label, record } of scanned) {
    for (const row of asRows(record.translations)) {
      for (const [key, value] of Object.entries(row)) {
        if (key === "id" || key === "languages_code" || key.endsWith("_id"))
          continue;
        walk(label, String(row.languages_code), key, value);
      }
    }
  }
  return [...new Set(found)];
}

function missingTranslations(sections: Section[]): string[] {
  const found = new Set<string>();
  for (const section of sections) {
    for (const item of section.hcms) {
      for (const field of section.fields) {
        if (field.translated === false) continue;
        const en = normalize(field, item.values["en-US"][field.name]);
        const pt = normalize(field, item.values["pt-AO"][field.name]);
        if (!en === !pt) continue;
        found.add(
          `${item.label}.${field.hcms} — preenchido em ${en ? "en-US" : "pt-AO"}, vazio em ${en ? "pt-AO" : "en-US"}`,
        );
      }
    }
  }
  return [...found];
}

function compare(
  sections: Section[],
  accepted: Accepted,
): {
  differences: Difference[];
  additions: Difference[];
  absent: string[];
  order: string[];
} {
  const differences: Difference[] = [];
  const additions: Difference[] = [];
  const absent = new Set<string>();
  const order: string[] = [];

  for (const section of sections) {
    for (const item of section.hcms)
      for (const name of item.absent)
        absent.add(`${item.label}.${name} (domínio: ${section.id})`);

    if (
      section.list &&
      section.hcms.length === 0 &&
      section.payload.length > 0
    ) {
      differences.push({
        field: section.id,
        where: section.collection ?? section.id,
        note: `0 itens visíveis ao token de leitura no hcms (o Payload tem ${section.payload.length})`,
      });
      continue;
    }

    const manual = new Map(
      accepted.pairs
        .filter((pair) => pair.list === section.id)
        .map((pair) => [pair.payload, pair.hcms]),
    );
    const hcmsByKey = new Map(section.hcms.map((item) => [item.key, item]));
    const paired: [Item, Item][] = [];
    const used = new Set<string>();

    for (const item of section.payload) {
      const twin = hcmsByKey.get(manual.get(item.key) ?? item.key);
      if (twin && !used.has(twin.key)) {
        used.add(twin.key);
        paired.push([item, twin]);
      } else if (section.list) {
        differences.push({
          field: `${section.id}[${item.key}]`,
          where: section.collection ?? section.id,
          note: "só no Payload (sem par no hcms)",
        });
      }
    }
    for (const item of section.hcms) {
      if (section.list && !used.has(item.key))
        differences.push({
          field: `${section.id}[${item.key}]`,
          where: item.label,
          note: "só no hcms (sem par no Payload)",
        });
    }

    for (const [payloadItem, hcmsItem] of paired) {
      const prefix = section.list
        ? `${section.id}[${payloadItem.key}]`
        : section.id;
      for (const field of section.fields) {
        for (const { lang } of LANGS) {
          const once = field.translated === false || field.payloadOnce;
          if (once && lang !== "en-US") continue;
          const payloadValue = payloadItem.values[lang][field.name];
          const hcmsValue = hcmsItem.values[lang][field.name];
          const payloadNormal = normalize(field, payloadValue);
          const hcmsNormal = normalize(field, hcmsValue);
          if (payloadNormal === hcmsNormal) continue;
          const difference = {
            field: `${prefix}.${field.name}`,
            lang: once ? undefined : lang,
            where: `${hcmsItem.label}.${field.hcms}`,
            payload: payloadValue,
            hcms: hcmsValue,
          };
          // O hcms preenche o que o Payload nunca teve: o valor vazio, ou — em
          // `pt-AO` — o texto inglês copiado. Não é conteúdo perdido, e é para
          // isto não dar falso alarme que o Payload se lê sem fallback. Um
          // `[EXEMPLO]` nunca entra aqui.
          // Só em texto: um URL igual nos dois idiomas não é falta de tradução.
          const untranslated =
            lang === "pt-AO" &&
            (field.kind === "text" || field.kind === "rich") &&
            payloadNormal ===
              normalize(field, payloadItem.values["en-US"][field.name]);
          if (
            hcmsNormal &&
            !hcmsValue?.includes(MARKER) &&
            (!payloadNormal || untranslated)
          )
            additions.push(difference);
          else differences.push(difference);
        }
      }
    }

    if (section.list) {
      const reversed = new Map([...manual].map(([p, h]) => [h, p]));
      const payloadOrder = paired.map(([item]) => item.key);
      const hcmsOrder = section.hcms
        .map((item) => reversed.get(item.key) ?? item.key)
        .filter((key) => payloadOrder.includes(key));
      if (payloadOrder.join("\n") !== hcmsOrder.join("\n"))
        order.push(
          `${section.id} — Payload: ${payloadOrder.join(", ")} · hcms: ${hcmsOrder.join(", ")}`,
        );
    }
  }

  return { differences, additions, absent: [...absent], order };
}

async function main() {
  const startedAt = new Date().toISOString();
  const problems: string[] = [];
  const accepted = loadAccepted(problems);

  const [h, p] = await Promise.all([readHcms(), readPayload()]);
  const sections = buildSections(p, h);

  const examples = scanExamples();
  const missing = missingTranslations(sections);
  const { differences, additions, absent, order } = compare(sections, accepted);

  // Aplicar as exceções. Uma exceção sobre um texto de exemplo é inválida: o
  // `[EXEMPLO]` nunca é aceitável em produção.
  const used = new Set<(typeof accepted.differences)[number]>();
  const failing: Difference[] = [];
  const acceptedHits: { difference: Difference; reason: string }[] = [];
  for (const difference of differences) {
    const entry = accepted.differences.find(
      (candidate) =>
        candidate.field === difference.field &&
        (!candidate.locale || candidate.locale === difference.lang),
    );
    if (!entry) {
      failing.push(difference);
      continue;
    }
    used.add(entry);
    if (difference.hcms?.includes(MARKER)) {
      problems.push(
        `${entry.field}${entry.locale ? ` (${entry.locale})` : ""}: não se aceita uma diferença sobre um texto ${MARKER}`,
      );
      failing.push(difference);
    } else acceptedHits.push({ difference, reason: entry.reason });
  }
  const unused = accepted.differences.filter((entry) => !used.has(entry));

  const lines: string[] = [];
  const out = (line = "") => lines.push(line);
  const header = (title: string, count: number) => {
    out();
    out(`## ${title} — ${count}`);
  };

  out(`# Verificação de conteúdo hcms × Payload — ${startedAt}`);
  out(`hcms: ${new URL(process.env.CMS_URL ?? "").host} · site "${SITE_SLUG}"`);

  header(`1. Textos de exemplo (${MARKER})`, examples.length);
  for (const line of examples) out(`✗ ${line}`);

  header("2. Traduções em falta (en-US × pt-AO)", missing.length);
  for (const line of missing) out(`✗ ${line}`);

  header("3. Diferenças face ao Payload", failing.length);
  for (const difference of failing) {
    const lang = difference.lang ? ` (${difference.lang})` : "";
    out(`✗ ${difference.field}${lang} ↔ ${difference.where}`);
    if (difference.note) out(`    ${difference.note}`);
    else {
      out(`    payload: ${show(difference.payload)}`);
      out(`    hcms:    ${show(difference.hcms)}`);
    }
  }

  if (absent.length) {
    header("Campos do mapeamento que não existem no hcms", absent.length);
    for (const line of absent) out(`✗ ${line}`);
  }
  if (problems.length) {
    header("Exceções inválidas", problems.length);
    for (const line of problems) out(`✗ ${line}`);
  }
  if (acceptedHits.length) {
    header(
      "Diferenças aceites (accepted-differences.json)",
      acceptedHits.length,
    );
    for (const { difference, reason } of acceptedHits)
      out(
        `≈ ${difference.field}${difference.lang ? ` (${difference.lang})` : ""} — ${reason}`,
      );
  }
  if (additions.length) {
    header(
      "O hcms acrescenta o que o Payload não tinha (não conta como falha)",
      additions.length,
    );
    for (const addition of additions)
      out(
        `+ ${addition.field}${addition.lang ? ` (${addition.lang})` : ""} — ${show(addition.hcms)}${addition.payload ? ` (Payload: ${show(addition.payload)})` : ""}`,
      );
  }
  if (order.length) {
    header("Ordem diferente (não conta como falha)", order.length);
    for (const line of order) out(`ℹ ${line}`);
  }
  if (unused.length) {
    header("Exceções sem diferença correspondente (remover?)", unused.length);
    for (const entry of unused)
      out(`ℹ ${entry.field}${entry.locale ? ` (${entry.locale})` : ""}`);
  }

  const failures =
    examples.length +
    missing.length +
    failing.length +
    absent.length +
    problems.length;
  out();
  out(
    `${failures === 0 ? "✓" : "✗"} ${examples.length} textos de exemplo · ${missing.length} traduções em falta · ${failing.length} diferenças (${acceptedHits.length} aceites) · ${absent.length} campos em falta · ${problems.length} exceções inválidas`,
  );

  console.log(lines.join("\n"));
  process.exit(failures ? 1 : 0);
}

try {
  await main();
} catch (error) {
  console.error(`✗ erro a ler os CMS: ${errorMessage(error)}`);
  process.exit(1);
}
