import {
  createDirectus,
  createItem,
  readItems,
  rest,
  staticToken,
} from "@directus/sdk";
import { marked } from "marked";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { toRichText } from "../rich-text";
import type {
  Contact,
  Cta,
  Faq,
  Footer,
  FooterButton,
  FooterLinkGroup,
  FooterSocialLink,
  FooterSocialPlatform,
  Hero,
  Homepage,
  Media,
  NavBar,
  NavButton,
  NavLink,
  ProductIcon,
  ProductPage,
  ProductStep,
  ProductsPage,
  Project,
  QuotePage,
  QuoteRequestInput,
  Service,
  Testimonial,
  TestimonialSocial,
} from "../types";
import { PRODUCT_ICONS } from "../types";

// O provider hcms: o site lido do Directus partilhado em `hcms.paradis.host`
// (site `paradis`), com as mesmas funções e garantias do provider Payload.
//
// O mapeamento campo a campo está em `cms-phase-1-hcms-alignment/design.md`,
// com UMA correção, confirmada pelo render da home e pelo conteúdo já no hcms
// (`cms-phase-2-content-verification`): o bloco `#about-us`
// (`block_media_text`) é `services.title/subtitle/primaryCta` + o vídeo, e a
// grelha `#services` (`block_collection`) é `services.ourServicesCT`.
//
// **Duas decisões que vêm da fase 1:**
//   • As rotas do site são fixas e as páginas escolhem-se pela `key`. Os slugs
//     traduzidos do hcms não chegam às URLs.
//   • A composição da home é fixa em código. Os blocos procuram-se por coleção
//     e âncora, e os que o site não conhece são ignorados. `hide_block`
//     desliga a secção, como o `enabled` do Payload.
//
// **Erros, como no provider Payload:** falha de transporte, ou site/página/
// formulário em falta, lança. Um item inválido numa lista é descartado e
// registado, e o resto renderiza.
//
// **Tokens:** `TOKEN_SECRET_READ` só lê. `TOKEN_SECRET_FORM` só tem `create`
// em `form_submissions`, e só `createQuoteRequest` o usa.

const SITE_SLUG = "paradis";
const FORM_KEY = "quote_request";

type Language = "en-US" | "pt-AO";
const DEFAULT_LANGUAGE: Language = "en-US";
const LANGUAGES: Record<Locale, Language> = { en: "en-US", pt: "pt-AO" };

// As rotas fixas do site, pela `key` da página no hcms.
const ROUTES: Record<string, string> = { home: "/", contact: "/get-quote" };

// O Cloudflare à frente do hcms recusa clientes sem `User-Agent` reconhecível
// (erro 1010).
const USER_AGENT = "lp-paradis-site/1.0";

const ENV = ["CMS_URL", "TOKEN_SECRET_READ", "TOKEN_SECRET_FORM"] as const;

function env(name: (typeof ENV)[number]): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[content] o hcms exige ${name}`);
  }
  return value;
}

/** Chamado por `@/content` ao carregar o módulo: sem estas variáveis, o site não arranca. */
export function assertHcmsEnv() {
  for (const name of ENV) env(name);
}

const cmsUrl = () => env("CMS_URL").replace(/\/+$/, "");

function createClient(token: string) {
  return createDirectus(cmsUrl())
    .with(staticToken(token))
    .with(
      rest({
        onRequest: (options) => ({
          ...options,
          headers: {
            ...(options.headers as Record<string, string>),
            "User-Agent": USER_AGENT,
          },
        }),
      }),
    );
}

// Memoizados ao nível do módulo, como o `getPayloadInstance`.
let readClient: ReturnType<typeof createClient> | null = null;
let formClient: ReturnType<typeof createClient> | null = null;

// O schema do hcms não é tipado no SDK (o token não lê `directus_fields`): as
// respostas entram como `unknown` e são validadas com zod.
async function read(
  collection: string,
  query: Record<string, unknown>,
): Promise<unknown[]> {
  readClient ??= createClient(env("TOKEN_SECRET_READ"));
  const rows = await readClient.request(
    readItems(collection as never, query as never),
  );
  return Array.isArray(rows) ? rows : [];
}

const bySite = { site: { slug: { _eq: SITE_SLUG } } };
const published = { ...bySite, status: { _eq: "published" } };

// ── Diagnóstico ────────────────────────────────────────────────────────────

type Where = { slug: string; locale: Locale };

function reportDropped(
  where: Where,
  path: string,
  item: unknown,
  issues: z.core.$ZodIssue[],
) {
  const id =
    item && typeof item === "object" && "key" in item
      ? String((item as { key: unknown }).key)
      : undefined;
  console.error("[content] item inválido descartado", {
    ...where,
    path,
    id,
    fields: issues.map((issue) => issue.path.join(".")),
  });
}

// Os itens já mapeados para o domínio são validados um a um: o que falhar sai,
// registado, e não arrasta os outros.
function keepValid<S extends z.ZodType>(
  schema: S,
  items: unknown[],
  where: Where,
  path: string,
): z.infer<S>[] {
  return items.flatMap((item) => {
    const result = schema.safeParse(item);
    if (result.success) return [result.data];
    reportDropped(where, path, item, result.error.issues);
    return [];
  });
}

// Um registo de que a leitura inteira depende (o site, uma página, o
// formulário): inválido ou em falta, é erro.
function parseRequired<S extends z.ZodType>(
  schema: S,
  raw: unknown,
  where: Where,
  what: string,
): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `[content] hcms: ${what} (${where.locale}) em falta ou inválido: ${result.error.issues
        .map((issue) => issue.path.join(".") || "(raiz)")
        .join(", ")}`,
    );
  }
  return result.data;
}

// ── Traduções ──────────────────────────────────────────────────────────────

const translationRow = z.object({ languages_code: z.string() }).loose();
type TranslationRow = z.infer<typeof translationRow>;
const translations = z
  .array(z.unknown())
  .nullish()
  .transform((rows) =>
    (rows ?? []).flatMap((row) => {
      const parsed = translationRow.safeParse(row);
      return parsed.success ? [parsed.data] : [];
    }),
  );

type Translated = { translations: TranslationRow[] } | null | undefined;

// Os idiomas a tentar, por ordem: o pedido e depois o padrão. O fallback é
// campo a campo, como o contrato de `@/content` exige.
const chain = (language: Language): Language[] =>
  language === DEFAULT_LANGUAGE ? [language] : [language, DEFAULT_LANGUAGE];

const row = (record: Translated, language: Language) =>
  record?.translations.find((entry) => entry.languages_code === language);

const filled = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

function tr(record: Translated, field: string, language: Language) {
  for (const code of chain(language)) {
    const value = row(record, code)?.[field];
    if (filled(value)) return value;
  }
  return null;
}

// Uma lista traduzida (botões, highlights, mensagens): a do idioma pedido, ou
// a do padrão se estiver vazia.
function trList(record: Translated, field: string, language: Language) {
  for (const code of chain(language)) {
    const value = row(record, code)?.[field];
    if (Array.isArray(value) && value.length > 0) return value as unknown[];
  }
  return [];
}

// Um campo de um elemento de uma lista traduzida, com fallback pelo índice.
function trEntry(
  record: Translated,
  field: string,
  index: number,
  key: string,
  language: Language,
) {
  for (const code of chain(language)) {
    const list = row(record, code)?.[field];
    const entry = Array.isArray(list) ? list[index] : undefined;
    const value =
      entry && typeof entry === "object"
        ? (entry as Record<string, unknown>)[key]
        : undefined;
    if (filled(value)) return value;
  }
  return null;
}

// ── Peças partilhadas ──────────────────────────────────────────────────────

const id = z.union([z.string(), z.number()]).transform(String);

const FILE_FIELDS = [
  "id",
  "filename_download",
  "width",
  "height",
  "description",
  "title",
];
const fileFields = (path: string) =>
  FILE_FIELDS.map((field) => `${path}.${field}`);

// Um ficheiro do hcms. `/assets/<id>` é público, por isso o URL vai direto
// para o `next/image` (com o host em `images.remotePatterns`). Um campo vazio
// vale `null`, como no Payload. `optional()`: um bloco que não tem o campo (a
// `image` de um `block_form`) também vale `null`.
//
// O URL leva o nome do ficheiro (`/assets/<id>/<nome>.svg`, que o Directus
// aceita): o `next/image` só serve um SVG sem otimização quando o caminho
// acaba em `.svg`, e recusa-o no otimizador (400). Sem nome, os logos do hcms
// não renderizam.
const rawFile = z
  .unknown()
  .optional()
  .transform((value): Media | null => {
    const file = z
      .union([
        z
          .string()
          .min(1)
          .transform((fileId) => ({ id: fileId })),
        z.object({
          id: z.string().min(1),
          filename_download: z.string().nullish(),
          width: z.number().nullish(),
          height: z.number().nullish(),
          description: z.string().nullish(),
          title: z.string().nullish(),
        }),
      ])
      .safeParse(value);
    if (!file.success) return null;
    const data = file.data as {
      id: string;
      filename_download?: string | null;
      width?: number | null;
      height?: number | null;
      description?: string | null;
      title?: string | null;
    };
    const name = data.filename_download
      ? `/${encodeURIComponent(data.filename_download)}`
      : "";
    return {
      url: `${cmsUrl()}/assets/${data.id}${name}`,
      alt: data.description || data.title || null,
      width: data.width ?? null,
      height: data.height ?? null,
    };
  });

// Os URLs authorados no hcms trazem o locale (`/en/get-quote`), e os
// componentes prefixam o locale corrente. O prefixo sai aqui. Um caminho que
// seja o slug traduzido de uma página (`/pedir-orcamento`) passa à rota fixa
// dessa página: as rotas do site não seguem os slugs do hcms (fase 1).
type PageSlugs = Map<string, string>;

function siteUrl(url: string | null, slugs: PageSlugs): string | null {
  if (url == null) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/")) return trimmed;
  const path = trimmed.replace(/^\/(en|pt)(?=[/#?]|$)/, "") || "/";
  const match = /^\/([^/#?]+)(.*)$/.exec(path);
  const route = match ? slugs.get(match[1]) : undefined;
  return route
    ? `${route === "/" ? "" : route}${match?.[2] ?? ""}` || "/"
    : path;
}

function cta(
  record: Translated,
  index: number,
  language: Language,
  slugs: PageSlugs,
): Cta {
  return {
    label: trEntry(record, "buttons", index, "label", language),
    url: siteUrl(trEntry(record, "buttons", index, "url", language), slugs),
  };
}

// ── Site e páginas ─────────────────────────────────────────────────────────

const rawSocial = z.object({
  platform: z.string(),
  url: z.string(),
  state: z.string().nullish(),
});

const rawSite = z.object({
  name: z.string().nullish(),
  email: z.string().nullish(),
  logo: rawFile,
  logo_inverse: rawFile,
  social_links: z.array(z.unknown()).nullish(),
  translations,
});

async function readSite(where: Where) {
  const [site] = await read("sites", {
    fields: [
      "name",
      "email",
      "social_links",
      "translations.*",
      ...fileFields("logo"),
      ...fileFields("logo_inverse"),
    ],
    filter: { slug: { _eq: SITE_SLUG } },
    limit: 1,
  });
  return parseRequired(rawSite, site, where, `site "${SITE_SLUG}"`);
}

const rawBlock = z.object({
  collection: z.string(),
  anchor_id: z.string().nullish(),
  hide_block: z.boolean().nullish(),
  sort: z.number().nullish(),
  item: z
    .object({
      source: z.string().nullish(),
      image: rawFile,
      media: rawFile,
      translations,
    })
    .loose()
    .nullish(),
});

type Block = z.infer<typeof rawBlock>;

const rawPage = z.object({
  key: z.string(),
  translations,
  blocks: z.array(rawBlock).nullish(),
});

// Os blocos que o site lê, com o `item` de cada um expandido (M2A).
const BLOCK_FIELDS = [
  "blocks.collection",
  "blocks.anchor_id",
  "blocks.hide_block",
  "blocks.sort",
  "blocks.item:block_hero.translations.*",
  ...fileFields("blocks.item:block_hero.image"),
  "blocks.item:block_media_text.translations.*",
  ...fileFields("blocks.item:block_media_text.media"),
  "blocks.item:block_collection.source",
  "blocks.item:block_collection.translations.*",
  "blocks.item:block_form.translations.*",
  "blocks.item:block_contact.translations.*",
];

// Todas as páginas do site, com os slugs traduzidos (para `siteUrl`), e os
// blocos das que a leitura pede.
async function readPages(where: Where, withBlocks: string[]) {
  const rows = await read("pages", {
    fields: ["key", "translations.*", ...BLOCK_FIELDS],
    filter: bySite,
    limit: -1,
  });
  const pages = new Map<string, z.infer<typeof rawPage>>();
  const slugs: PageSlugs = new Map();
  for (const raw of rows) {
    const page = rawPage.safeParse(raw);
    if (!page.success) {
      reportDropped(where, "pages", raw, page.error.issues);
      continue;
    }
    pages.set(page.data.key, page.data);
    const route = ROUTES[page.data.key];
    if (!route) continue;
    for (const entry of page.data.translations) {
      if (filled(entry.slug)) slugs.set(entry.slug, route);
    }
  }
  for (const key of withBlocks) {
    if (!pages.has(key)) {
      throw new Error(
        `[content] hcms: página "${key}" (${where.locale}) em falta`,
      );
    }
  }
  return { pages, slugs };
}

// O bloco de que a secção precisa, por coleção e âncora. Ausente ou com
// `hide_block`, a secção fica desligada.
function findBlock(
  page: z.infer<typeof rawPage> | undefined,
  collection: string,
  anchor: string | null = null,
): { block: Block | undefined; enabled: boolean } {
  const block = page?.blocks?.find(
    (candidate) =>
      candidate.collection === collection &&
      (candidate.anchor_id ?? null) === anchor,
  );
  return { block, enabled: !!block?.item && !block.hide_block };
}

// ── Navegações ─────────────────────────────────────────────────────────────

const rawNavItem = z.object({
  id,
  parent: id.nullish(),
  sort: z.number().nullish(),
  type: z.string().nullish(),
  variant: z.string().nullish(),
  page: z.object({ key: z.string().nullish() }).nullish(),
  anchor: z.string().nullish(),
  url: z.string().nullish(),
  open_in_new_tab: z.boolean().nullish(),
  translations,
});

type NavItem = z.infer<typeof rawNavItem>;

const rawNavigation = z.object({
  key: z.string(),
  items: z.array(z.unknown()).nullish(),
});

async function readNavigations(keys: string[], where: Where) {
  const rows = await read("navigations", {
    fields: [
      "key",
      "items.id",
      "items.parent",
      "items.sort",
      "items.type",
      "items.variant",
      "items.page.key",
      "items.anchor",
      "items.url",
      "items.open_in_new_tab",
      "items.translations.languages_code",
      "items.translations.label",
    ],
    filter: { ...bySite, key: { _in: keys } },
    limit: -1,
  });
  const navigations = new Map<string, NavItem[]>();
  for (const raw of rows) {
    const navigation = rawNavigation.safeParse(raw);
    if (!navigation.success) continue;
    const items = (navigation.data.items ?? []).flatMap((item) => {
      const parsed = rawNavItem.safeParse(item);
      if (parsed.success) return [parsed.data];
      reportDropped(
        where,
        `navigations.${navigation.data.key}`,
        item,
        parsed.error.issues,
      );
      return [];
    });
    items.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    navigations.set(navigation.data.key, items);
  }
  // `items` traz a árvore achatada: os filhos aparecem também no topo.
  const topLevel = (key: string) =>
    (navigations.get(key) ?? []).filter((item) => item.parent == null);
  const children = (key: string, parent: NavItem) =>
    (navigations.get(key) ?? []).filter((item) => item.parent === parent.id);
  return { topLevel, children };
}

// O destino de um item: a rota fixa da página, a mesma rota com `#âncora`, ou
// o URL tal como está. Uma página sem rota conhecida descarta o item.
function navTarget(item: NavItem, where: Where): string | null {
  if (item.type === "url") return item.url ?? null;
  const route = ROUTES[item.page?.key ?? ""];
  if (!route) {
    console.error("[content] item de navegação sem rota descartado", {
      ...where,
      id: item.id,
      page: item.page?.key ?? null,
    });
    return null;
  }
  if (item.type === "anchor" && item.anchor) return `${route}#${item.anchor}`;
  return route;
}

const VARIANTS: Record<string, NavButton["variant"]> = {
  button_primary: "primary",
  button_secondary: "outline",
};

// ── NavBar ─────────────────────────────────────────────────────────────────

const navLink = z.object({
  key: z.string(),
  label: z.string().min(1),
  url: z.string(),
  openInNewTab: z.boolean(),
});

const navButton = navLink.extend({
  variant: z.enum(["primary", "outline"]),
});

export async function getNavBar(locale: Locale): Promise<NavBar> {
  const where = { slug: "navbar", locale };
  const language = LANGUAGES[locale];
  const [site, navigations] = await Promise.all([
    readSite(where),
    readNavigations(["header", "header_actions"], where),
  ]);

  const toLink = (item: NavItem) => ({
    key: item.id,
    label: tr(item, "label", language),
    url: navTarget(item, where),
    openInNewTab: item.open_in_new_tab ?? false,
  });

  return {
    logo: {
      image: site.logo,
      imageLight: site.logo_inverse,
      // O logo leva à home. O hcms não tem dimensões do logo (SVG): a UI usa
      // os seus pisos.
      url: ROUTES.home,
      width: null,
      height: null,
    },
    links: keepValid(
      navLink,
      navigations.topLevel("header").map(toLink),
      where,
      "links",
    ) satisfies NavLink[],
    buttons: keepValid(
      navButton,
      navigations.topLevel("header_actions").map((item) => ({
        ...toLink(item),
        url: navTarget(item, where) ?? "",
        variant: VARIANTS[item.variant ?? ""] ?? "primary",
      })),
      where,
      "buttons",
    ) satisfies NavButton[],
    socialLinks: siteSocialLinks(site, where),
  };
}

// ── Footer ─────────────────────────────────────────────────────────────────

const PLATFORM_NAMES: Record<FooterSocialPlatform, string> = {
  dribbble: "Dribbble",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  github: "GitHub",
  twitter: "X",
  facebook: "Facebook",
  youtube: "YouTube",
  discord: "Discord",
  whatsapp: "WhatsApp",
  other: "",
};

const PLATFORMS = Object.keys(PLATFORM_NAMES) as FooterSocialPlatform[];

const toPlatform = (value: string): FooterSocialPlatform =>
  (PLATFORMS as string[]).includes(value)
    ? (value as FooterSocialPlatform)
    : "other";

// O hcms não tem `label` nas redes (lacuna da fase 1): o nome acessível deriva
// da plataforma.
function socialLabel(
  siteName: string,
  platform: FooterSocialPlatform,
  locale: Locale,
) {
  const name = PLATFORM_NAMES[platform];
  if (!name) return siteName;
  return locale === "pt" ? `${siteName} no ${name}` : `${siteName} on ${name}`;
}

const footerLink = z.object({
  key: z.string(),
  name: z.string().min(1),
  href: z.string(),
  isExternal: z.boolean(),
});

const footerLinkGroup = z.object({
  key: z.string(),
  title: z.string().min(1),
  links: z.array(footerLink),
});

const footerSocial = z.object({
  key: z.string(),
  platform: z.enum(PLATFORMS as [FooterSocialPlatform]),
  url: z.string().min(1),
  label: z.string().min(1),
});

// As redes do item `sites`, partilhadas pelo footer e pelo menu mobile do
// navbar. Uma só função, para as duas leituras não poderem divergir na ordem
// nem no que descartam — `footer-direct-contact-band` promete ao editor a
// ordem authorada nos dois sítios.
function siteSocialLinks(
  site: Awaited<ReturnType<typeof readSite>>,
  where: Where,
): FooterSocialLink[] {
  const siteName = site.name ?? "Paradis";
  return keepValid(
    footerSocial,
    (site.social_links ?? []).flatMap((raw, index) => {
      const social = rawSocial.safeParse(raw);
      if (!social.success || (social.data.state ?? "live") !== "live")
        return [];
      const platform = toPlatform(social.data.platform);
      return [
        {
          key: `${index}:${social.data.url}`,
          platform,
          url: social.data.url,
          label: socialLabel(siteName, platform, where.locale),
        },
      ];
    }),
    where,
    "socialLinks",
  );
}

export async function getFooter(locale: Locale): Promise<Footer> {
  const where = { slug: "footer", locale };
  const language = LANGUAGES[locale];
  const [site, navigations, { pages }] = await Promise.all([
    readSite(where),
    readNavigations(["footer_columns", "footer_actions"], where),
    readPages(where, ["contact"]),
  ]);

  // A faixa de contacto do footer vem do `block_contact` da página `contact`.
  const contact = findBlock(pages.get("contact"), "block_contact").block?.item;

  const linkGroups = keepValid(
    footerLinkGroup,
    navigations.topLevel("footer_columns").map((group, index) => ({
      key: group.id,
      title: tr(group, "label", language),
      links: keepValid(
        footerLink,
        navigations.children("footer_columns", group).map((link) => ({
          key: link.id,
          name: tr(link, "label", language),
          href: navTarget(link, where),
          isExternal: link.open_in_new_tab ?? false,
        })),
        where,
        `linkGroups.${index}.links`,
      ),
    })),
    where,
    "linkGroups",
  ) satisfies FooterLinkGroup[];

  // O CTA: os botões primário e secundário de `footer_actions`. Se estiverem
  // dentro de um grupo, o grupo dá o título; soltos no topo, não há título.
  const ctaGroup = navigations
    .topLevel("footer_actions")
    .find((item) => item.type === "group");
  const ctaItems = ctaGroup
    ? navigations.children("footer_actions", ctaGroup)
    : navigations.topLevel("footer_actions");
  const ctaButton = (variant: string): FooterButton => {
    const item = ctaItems.find((child) => child.variant === variant);
    return {
      label: item ? tr(item, "label", language) : null,
      href: item ? navTarget(item, where) : null,
    };
  };

  const socialLinks = siteSocialLinks(site, where);

  return {
    logo: site.logo_inverse,
    tagline: tr(site, "tagline", language),
    directContact: {
      reachHeading: tr(contact, "title", language),
      emailHeading: tr(contact, "email_label", language),
      socialHeading: tr(contact, "social_label", language),
    },
    linkGroups,
    cta: {
      heading: ctaGroup ? tr(ctaGroup, "label", language) : null,
      primaryButton: ctaButton("button_primary"),
      outlineButton: ctaButton("button_secondary"),
    },
    copyrightText: tr(site, "copyright_text", language),
    socialLinks,
  };
}

// ── Contacto ───────────────────────────────────────────────────────────────

export async function getContact(locale: Locale): Promise<Contact | null> {
  const site = await readSite({ slug: "contact", locale });
  return { email: site.email?.trim() ? site.email : null };
}

// ── Coleções ───────────────────────────────────────────────────────────────

const rawRecord = z.object({ id, translations }).loose();
type RawRecord = z.infer<typeof rawRecord>;

// As coleções do site, publicadas, pela ordem do editor (`sort`).
async function readCollection(
  collection: string,
  fields: string[],
  where: Where,
): Promise<RawRecord[]> {
  const rows = await read(collection, {
    fields: ["id", "translations.*", ...fields],
    filter: published,
    sort: ["sort"],
    limit: -1,
  });
  return rows.flatMap((raw) => {
    const record = rawRecord.safeParse(raw);
    if (record.success) return [record.data];
    reportDropped(where, collection, raw, record.error.issues);
    return [];
  });
}

const service = z.object({
  key: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().nullable(),
});

// O slug do serviço é o de `en-US` em todos os locales: é o que coincide com o
// do Payload, e o formulário e a grelha dependem dele.
function toService(record: RawRecord, language: Language) {
  return {
    key: record.id,
    title: tr(record, "title", language),
    slug: tr(record, "slug", DEFAULT_LANGUAGE),
    shortDescription: tr(record, "summary", language),
  };
}

async function readServices(where: Where): Promise<Service[]> {
  const language = LANGUAGES[where.locale];
  const records = await readCollection("offerings", [], where);
  return keepValid(
    service,
    records.map((record) => toService(record, language)),
    where,
    "services.items",
  );
}

const project = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  coverImage: z.custom<Media | null>(),
  url: z.string().min(1),
  linkLabel: z.string().nullable(),
  slug: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
});

const testimonial = z.object({
  key: z.string(),
  authorName: z.string().min(1),
  tag: z.string(),
  social: z.enum([
    "instagram",
    "linkedin",
    "twitter",
    "facebook",
    "youtube",
    "github",
    "whatsapp",
    "discord",
    "other",
  ]),
  avatar: z.custom<Media | null>(),
  quote: z.string().min(1),
  date: z.string(),
});

const faq = z.object({
  key: z.string(),
  question: z.string().min(1),
  answer: z.string(),
});

const hero = z.object({
  headline: z.string(),
  subheadline: z.string().nullable(),
  description: z.string(),
  primaryCta: z.custom<Cta>(),
  secondaryCta: z.custom<Cta>(),
  backgroundImage: z.custom<Media | null>(),
});

const asString = (value: unknown) => (typeof value === "string" ? value : null);

const SOCIALS = testimonial.shape.social.options;

// Uma plataforma que o card não conhece vale `other`, em vez de descartar o
// testemunho.
const toTestimonialSocial = (value: unknown): TestimonialSocial =>
  (SOCIALS as readonly unknown[]).includes(value)
    ? (value as TestimonialSocial)
    : "other";

// ── Homepage ───────────────────────────────────────────────────────────────

// Os campos dos `projects` que o site lê, partilhados pela homepage e pela
// listagem de produtos.
const PROJECT_FIELDS = [
  "url",
  "tags",
  "category.translations.*",
  ...fileFields("image"),
];

// E os da página de detalhe (`seed-paradis-v3` no template). Só a leitura do
// detalhe os pede: o Directus responde 403 ao pedido inteiro quando um campo
// não existe, e as outras leituras não precisam deles.
const PRODUCT_FIELDS = [
  ...PROJECT_FIELDS,
  "gallery.sort",
  ...fileFields("gallery.directus_files_id"),
  "testimonial.id",
  "testimonial.author_name",
  "testimonial.platform",
  "testimonial.date",
  "testimonial.date_updated",
  "testimonial.date_created",
  "testimonial.translations.*",
  ...fileFields("testimonial.avatar"),
];

// O mapeamento de um projecto para o domínio, partilhado pelas duas leituras
// para elas não poderem divergir no que mostram nem no que descartam.
function toProjects(
  records: Awaited<ReturnType<typeof readCollection>>,
  where: Where,
  path: string,
): Project[] {
  const language = LANGUAGES[where.locale];
  return keepValid(
    project,
    records.map((record) => ({
      key: record.id,
      title: tr(record, "title", language),
      description: tr(record, "summary", language),
      coverImage: rawFile.parse(record.image),
      url: asString(record.url),
      linkLabel: tr(record, "link_label", language),
      // O slug é o de `en-US` nos dois idiomas, como nos serviços: a rota
      // `/products/<slug>` é a mesma em `/en` e em `/pt`.
      slug: tr(record, "slug", DEFAULT_LANGUAGE),
      category: tr(record.category as Translated, "name", language),
      tags: Array.isArray(record.tags)
        ? record.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
    })),
    where,
    path,
  );
}

export async function getHomepage(locale: Locale): Promise<Homepage> {
  const where = { slug: "homepage", locale };
  const language = LANGUAGES[locale];
  const [{ pages, slugs }, services, projects, testimonials, faqs] =
    await Promise.all([
      readPages(where, ["home"]),
      readServices(where),
      readCollection("projects", PROJECT_FIELDS, where),
      readCollection(
        "testimonials",
        [
          "author_name",
          "platform",
          "date",
          "date_updated",
          ...fileFields("avatar"),
        ],
        where,
      ),
      readCollection("faqs", [], where),
    ]);
  const home = pages.get("home");

  const heroBlock = findBlock(home, "block_hero");
  const about = findBlock(home, "block_media_text", "about-us");
  const grid = findBlock(home, "block_collection", "services");
  const products = findBlock(home, "block_collection", "products");
  const testimonialsBlock = findBlock(home, "block_collection", "testimonials");
  const faqsBlock = findBlock(home, "block_collection", "faqs");

  // O hero é um único item: inválido, a secção fica sem item e não renderiza.
  const heroRecord = heroBlock.block?.item;
  const heroItem = heroRecord
    ? keepValid(
        hero,
        [
          {
            headline: tr(heroRecord, "title", language),
            subheadline: tr(heroRecord, "eyebrow", language),
            description: tr(heroRecord, "lead", language),
            primaryCta: cta(heroRecord, 0, language, slugs),
            secondaryCta: cta(heroRecord, 1, language, slugs),
            backgroundImage: heroRecord.image,
          },
        ],
        where,
        "hero.item",
      )
    : [];

  const aboutItem = about.block?.item;
  const gridItem = grid.block?.item;
  const productsItem = products.block?.item;

  return {
    hero: {
      enabled: heroBlock.enabled,
      item: (heroItem[0] as Hero | undefined) ?? null,
    },
    services: {
      enabled: grid.enabled,
      title: tr(aboutItem, "title", language),
      subtitle: tr(aboutItem, "lead", language),
      ourServicesCT: {
        title: tr(gridItem, "title", language),
        description: tr(gridItem, "lead", language),
        backgroundVideo: aboutItem?.media ?? null,
      },
      primaryCta: cta(aboutItem, 0, language, slugs),
      items: services,
    },
    projects: {
      enabled: products.enabled,
      title: tr(productsItem, "title", language),
      subtitle: tr(productsItem, "lead", language),
      primaryCta: cta(productsItem, 0, language, slugs),
      items: toProjects(projects, where, "projects.items"),
    },
    testimonials: {
      enabled: testimonialsBlock.enabled,
      title: tr(testimonialsBlock.block?.item, "title", language),
      subtitle: tr(testimonialsBlock.block?.item, "lead", language),
      items: keepValid(
        testimonial,
        testimonials.map((record) => toTestimonial(record, language)),
        where,
        "testimonials.items",
      ) satisfies Testimonial[],
    },
    faqs: {
      enabled: faqsBlock.enabled,
      title: tr(faqsBlock.block?.item, "title", language),
      subtitle: tr(faqsBlock.block?.item, "lead", language),
      items: keepValid(
        faq,
        faqs.map((record) => ({
          key: record.id,
          question: tr(record, "question", language),
          answer: tr(record, "answer", language),
        })),
        where,
        "faqs.items",
      ).map(
        // As respostas são Markdown no hcms. O HTML gerado passa pela mesma
        // allowlist que o do Lexical: HTML cru dentro do Markdown não escapa.
        (item): Faq => ({
          ...item,
          answer: toRichText(
            marked.parse(item.answer, { async: false, gfm: true }).trim(),
          ),
        }),
      ),
    },
  };
}

// Um testemunho do hcms no domínio, partilhado pela homepage e pelo detalhe de
// produto.
function toTestimonial(record: RawRecord, language: Language) {
  return {
    key: record.id,
    authorName: asString(record.author_name),
    tag: tr(record, "author_role", language) ?? "",
    social: toTestimonialSocial(record.platform),
    avatar: rawFile.parse(record.avatar),
    quote: tr(record, "quote", language),
    // A data do testemunho, se o editor a deu; senão a da última edição, como
    // no Payload.
    date: asString(record.date ?? record.date_updated ?? record.date_created),
  };
}

// ── Página de produtos ─────────────────────────────────────────────────────

// A listagem `/products`. O cabeçalho reutiliza o bloco `#products` da página
// `home`: o texto do mockup é exactamente o da secção, e uma página própria no
// hcms obrigaria a mexer no seed do template para uma página só com cabeçalho.
// Consequência deliberada: editar o título da secção muda o H1 de `/products`,
// e o `hide_block` da secção não esconde a página.
export async function getProductsPage(locale: Locale): Promise<ProductsPage> {
  const where = { slug: "products-page", locale };
  const language = LANGUAGES[locale];
  const [{ pages }, projects] = await Promise.all([
    readPages(where, ["home"]),
    readCollection("projects", PROJECT_FIELDS, where),
  ]);
  const block = findBlock(pages.get("home"), "block_collection", "products")
    .block?.item;

  return {
    eyebrow: tr(block, "eyebrow", language),
    title: tr(block, "title", language),
    lead: tr(block, "lead", language),
    items: toProjects(projects, where, "items"),
  };
}

// ── Detalhe de produto ─────────────────────────────────────────────────────

// Um ícone que o site não conhece fica `null`: o cartão renderiza sem ele.
function productIcon(value: unknown): ProductIcon | null {
  return PRODUCT_ICONS.find((icon) => icon === value) ?? null;
}

const productStep = z.object({
  icon: z.enum(PRODUCT_ICONS).nullable(),
  title: z.string().min(1),
  body: z.string().nullable(),
});

// O detalhe de `/products/<slug>` e os outros projectos, para "More Products".
// Uma só leitura dos projectos (são poucos) serve as duas coisas. `null` quando
// nenhum projecto publicado tem aquele slug: a rota responde 404.
export async function getProduct(
  locale: Locale,
  slug: string,
): Promise<ProductPage | null> {
  const where = { slug: `product:${slug}`, locale };
  const language = LANGUAGES[locale];
  const records = await readCollection("projects", PRODUCT_FIELDS, where);
  const projects = toProjects(records, where, "projects");
  const index = projects.findIndex((candidate) => candidate.slug === slug);
  if (index === -1) return null;

  const record = records.find(
    (candidate) => candidate.id === projects[index].key,
  );
  if (!record) return null;

  const testimonialRecord = rawRecord.safeParse(record.testimonial);
  const testimonials = testimonialRecord.success
    ? keepValid(
        testimonial,
        [toTestimonial(testimonialRecord.data, language)],
        where,
        "testimonial",
      )
    : [];

  const gallery = (Array.isArray(record.gallery) ? record.gallery : [])
    .map((entry) =>
      rawFile.parse(
        (entry as { directus_files_id?: unknown })?.directus_files_id,
      ),
    )
    .filter((media): media is Media => media !== null);

  return {
    product: {
      ...projects[index],
      market: tr(record, "market", language),
      platform: tr(record, "platform", language),
      challenge: tr(record, "challenge", language),
      solution: tr(record, "solution", language),
      steps: keepValid(
        productStep,
        trList(record, "steps", language).map((step) => ({
          icon: productIcon((step as { icon?: unknown })?.icon),
          title: asString((step as { title?: unknown })?.title),
          body: (step as { body?: unknown })?.body
            ? asString((step as { body?: unknown }).body)
            : null,
        })),
        where,
        "steps",
      ) satisfies ProductStep[],
      gallery,
      testimonial: (testimonials[0] as Testimonial | undefined) ?? null,
    },
    others: projects.filter((_, position) => position !== index),
  };
}

// ── Página de orçamento ────────────────────────────────────────────────────

const rawFormField = z.object({ name: z.string(), translations });

const rawForm = z.object({
  id,
  site: id,
  is_active: z.boolean().nullish(),
  translations,
  fields: z.array(rawFormField).nullish(),
});

async function readForm(where: Where, withFields: boolean) {
  const [form] = await read("forms", {
    fields: [
      "id",
      "site",
      "is_active",
      ...(withFields
        ? ["translations.*", "fields.name", "fields.translations.*"]
        : []),
    ],
    filter: { ...bySite, key: { _eq: FORM_KEY } },
    limit: 1,
  });
  return form === undefined
    ? null
    : parseRequired(rawForm, form, where, `formulário "${FORM_KEY}"`);
}

export async function getQuotePage(locale: Locale): Promise<QuotePage> {
  const where = { slug: "quote-page", locale };
  const language = LANGUAGES[locale];
  const [{ pages }, form, interests] = await Promise.all([
    readPages(where, ["contact"]),
    readForm(where, true),
    readServices(where),
  ]);
  if (!form) {
    throw new Error(
      `[content] hcms: formulário "${FORM_KEY}" (${locale}) em falta`,
    );
  }
  const contact = pages.get("contact");
  const formBlock = findBlock(contact, "block_form");
  const block = formBlock.block?.item;

  const field = (name: string) =>
    form.fields?.find((candidate) => candidate.name === name);

  // As mensagens de validação vivem por campo, numa lista `{ code, text }`.
  const message = (name: string, code: string) => {
    for (const entry of [language, DEFAULT_LANGUAGE] as const) {
      const list = row(field(name), entry)?.messages;
      const found = Array.isArray(list)
        ? (list as { code?: unknown; text?: unknown }[]).find(
            (candidate) => candidate?.code === code,
          )
        : undefined;
      if (filled(found?.text)) return found.text;
    }
    return null;
  };

  const highlights = trList(block, "highlights", language);

  return {
    seo: {
      metaTitle: tr(contact, "seo_title", language),
      metaDescription: tr(contact, "seo_description", language),
    },
    hero: {
      headline: tr(block, "title", language),
      intro: tr(block, "lead", language),
    },
    availability: {
      enabled: highlights.length > 0,
      label: trEntry(block, "highlights", 0, "text", language),
      location: trEntry(block, "highlights", 1, "text", language),
    },
    form: {
      enabled: form.is_active !== false && formBlock.enabled,
      eyebrow: tr(form, "title", language),
      nameLabel: tr(field("name"), "label", language),
      emailLabel: tr(field("email"), "label", language),
      interestsLabel: tr(field("interests"), "label", language),
      interests,
      company: field("company")
        ? { label: tr(field("company"), "label", language) }
        : null,
      messageLabel: tr(field("message"), "label", language),
      submitLabel: tr(form, "submit_label", language),
      privacyNote: tr(form, "privacy_note", language),
      messages: {
        success: tr(form, "success_message", language),
        error: tr(form, "error_message", language),
        nameRequired: message("name", "required"),
        emailRequired: message("email", "required"),
        emailInvalid: message("email", "invalid"),
        messageRequired: message("message", "required"),
        tooLong: message("message", "too_long") ?? message("name", "too_long"),
      },
    },
  };
}

// A válvula da Server Action, lida sem traduções. Sem formulário no hcms não
// há onde gravar: fechado.
export async function isQuoteFormEnabled(): Promise<boolean> {
  const form = await readForm({ slug: "quote-page", locale: "en" }, false);
  return !!form && form.is_active !== false;
}

// ── Submissões ─────────────────────────────────────────────────────────────

// Os interesses chegam como slugs `en-US` e são resolvidos contra as
// `offerings` do site. O que não corresponder fica de fora.
export async function findServicesBySlugs(
  slugs: string[],
  limit: number,
): Promise<Service[]> {
  if (slugs.length === 0) return [];
  const where = { slug: "services", locale: "en" as Locale };
  const records = await read("offerings", {
    fields: [
      "id",
      "translations.languages_code",
      "translations.slug",
      "translations.title",
    ],
    filter: {
      ...published,
      translations: {
        _some: {
          languages_code: { _eq: DEFAULT_LANGUAGE },
          slug: { _in: slugs },
        },
      },
    },
    limit,
  });
  return keepValid(
    z.object({ key: z.string(), slug: z.string().min(1), title: z.string() }),
    records.flatMap((raw) => {
      const record = rawRecord.safeParse(raw);
      if (!record.success) return [];
      const slug = tr(record.data, "slug", DEFAULT_LANGUAGE);
      return [
        {
          key: record.data.id,
          slug,
          title: tr(record.data, "title", DEFAULT_LANGUAGE) ?? slug,
        },
      ];
    }),
    where,
    "offerings",
  ).map((service) => ({ ...service, shortDescription: null }));
}

// A submissão é um `form_submissions` do formulário `quote_request`, gravado
// com o token de formulário (só `create`, sem leitura). O contrato é o do
// template do hcms (`Template-multisite-tenant/docs/api/forms.md`), confirmado
// com um envio de teste:
//   • só seis campos de topo são permitidos (`form`, `site`, `languages_code`,
//     `data`, `consent`, `consent_at`); qualquer outro dá 403;
//   • `form` é o `id` do formulário, nunca a `key`;
//   • `site` vai explícito: o guard do hcms em produção recusa a submissão sem
//     ele (`FORM_NOT_ACCEPTING_SUBMISSIONS`), apesar de a versão atual do
//     template o tirar do formulário;
//   • os valores vão em `data`, pelos `form_fields.name`;
//   • `fields: ["id"]`, porque o token não lê o que cria (responde 204).
// `consent` não vai: o formulário tem `consent_required: false`, e a página de
// orçamento não tem caixa de consentimento.
export async function createQuoteRequest(
  input: QuoteRequestInput,
): Promise<void> {
  // Com campos: é a lista de `form_fields` que diz se a empresa vai. Uma
  // chave em `data` sem campo correspondente tem comportamento não confirmado
  // no hcms, e esta é a única escrita pública do site — não se arrisca.
  const form = await readForm({ slug: "quote-request", locale: "en" }, true);
  if (!form)
    throw new Error(`[content] hcms: formulário "${FORM_KEY}" em falta`);
  const acceptsCompany = Boolean(
    form.fields?.some((candidate) => candidate.name === "company"),
  );

  formClient ??= createClient(env("TOKEN_SECRET_FORM"));
  await formClient.request(
    createItem(
      "form_submissions" as never,
      {
        form: form.id,
        site: form.site,
        languages_code:
          LANGUAGES[input.submittedLocale as Locale] ?? DEFAULT_LANGUAGE,
        data: {
          name: input.name,
          email: input.email,
          interests: input.services.map((entry) => entry.slug),
          message: input.message,
          ...(acceptsCompany && input.company
            ? { company: input.company }
            : {}),
        },
      } as never,
      { fields: ["id"] } as never,
    ),
  );
}
