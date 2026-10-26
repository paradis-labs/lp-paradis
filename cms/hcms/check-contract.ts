// Verifica que o hcms (`hcms.paradis.host`) tem a forma de que o site depende.
//
//   npm run cms:check
//
// **Só leitura**, com `TOKEN_SECRET_READ`. Confirma a FORMA — o site, os
// idiomas, as páginas e os seus blocos, as navegações, o formulário e que as
// coleções referidas pela home têm itens — e não o conteúdo, que é o trabalho
// de `cms-phase-2-content-verification`. O mapeamento que cada verificação
// protege está em `openspec/changes/cms-phase-1-hcms-alignment/design.md`.
//
// O hcms é partilhado por vários sites: tudo é filtrado pelo site `paradis`, e
// este script nunca escreve. Sai com código 1 se faltar alguma peça.
//
// Corre com o Node directamente (type stripping, Node ≥ 22.18), sem runner.

import { createReader, errorMessage, type Row, SITE_SLUG } from "./client.ts";

const LANGUAGES = ["en-US", "pt-AO"];

// Os blocos de que a composição do site precisa, por página. `anchor` nulo é
// um bloco sem âncora; `source` é o `source` de um `block_collection`.
type ExpectedBlock = {
  collection: string;
  anchor: string | null;
  source?: string;
};

const PAGES: Record<string, ExpectedBlock[]> = {
  home: [
    { collection: "block_hero", anchor: null },
    { collection: "block_collection", anchor: null, source: "offerings" },
    { collection: "block_media_text", anchor: "about-us" },
    { collection: "block_collection", anchor: "services", source: "offerings" },
    { collection: "block_collection", anchor: "products", source: "projects" },
    {
      collection: "block_collection",
      anchor: "testimonials",
      source: "testimonials",
    },
    { collection: "block_collection", anchor: "faqs", source: "faqs" },
  ],
  contact: [
    { collection: "block_form", anchor: null },
    { collection: "block_contact", anchor: null },
  ],
};

const NAVIGATIONS = [
  "header",
  "header_actions",
  "footer_columns",
  "footer_actions",
];
const FORM_KEY = "quote_request";
const FORM_FIELDS: Record<string, { choicesSource?: string }> = {
  name: {},
  email: {},
  interests: { choicesSource: "offerings" },
  message: {},
};
const SITE_COLLECTIONS = ["offerings", "projects", "testimonials", "faqs"];

const read = createReader("lp-paradis-cms-check/1.0");

const results: { ok: boolean; what: string; detail?: string }[] = [];
const pass = (what: string, detail?: string) =>
  results.push({ ok: true, what, detail });
const fail = (what: string, detail?: string) =>
  results.push({ ok: false, what, detail });

async function checkSite(): Promise<string | null> {
  const [site] = await read("sites", {
    fields: ["id", "status", "languages.languages_code"],
    filter: { slug: { _eq: SITE_SLUG } },
    limit: 1,
  });
  if (!site) {
    fail(`site "${SITE_SLUG}"`, "não existe ou não é visível ao token");
    return null;
  }
  pass(`site "${SITE_SLUG}"`, `status ${site.status}`);

  const codes = ((site.languages as Row[] | undefined) ?? []).map(
    (row) => row.languages_code,
  );
  for (const code of LANGUAGES) {
    if (codes.includes(code)) pass(`idioma ${code}`);
    else fail(`idioma ${code}`, "não está nos idiomas do site");
  }
  return site.id as string;
}

async function checkPages(siteId: string) {
  for (const [key, expected] of Object.entries(PAGES)) {
    const [page] = await read("pages", {
      fields: ["id", "status"],
      filter: { site: { _eq: siteId }, key: { _eq: key } },
      limit: 1,
    });
    if (!page) {
      fail(`página "${key}"`, "não existe");
      continue;
    }
    pass(`página "${key}"`, `status ${page.status}`);

    const blocks = await read("page_blocks", {
      fields: ["collection", "item", "anchor_id", "hide_block"],
      filter: { pages_id: { _eq: page.id } },
      sort: ["sort"],
      limit: -1,
    });

    for (const block of expected) {
      const label = `${key} → ${block.collection}${block.anchor ? ` #${block.anchor}` : ""}${block.source ? ` (${block.source})` : ""}`;
      const candidates = blocks.filter(
        (row) =>
          row.collection === block.collection &&
          (row.anchor_id ?? null) === block.anchor,
      );

      // Um `block_collection` só conta se a sua fonte for a esperada: o
      // marquee de serviços e a grelha partilham coleção e diferem na âncora,
      // mas um bloco de projectos com a âncora errada não pode passar.
      let match = candidates[0];
      if (block.source) {
        match = undefined as unknown as Row;
        for (const candidate of candidates) {
          const [item] = await read(block.collection, {
            fields: ["source"],
            filter: { id: { _eq: candidate.item } },
            limit: 1,
          });
          if (item?.source === block.source) {
            match = candidate;
            break;
          }
        }
      }

      if (!match) fail(label, "bloco em falta");
      else pass(label, match.hide_block ? "escondido (hide_block)" : undefined);
    }
  }
}

async function checkNavigations(siteId: string) {
  const navigations = await read("navigations", {
    fields: ["key", "items.id"],
    filter: { site: { _eq: siteId } },
    limit: -1,
  });
  for (const key of NAVIGATIONS) {
    const navigation = navigations.find((row) => row.key === key);
    const count = (navigation?.items as Row[] | undefined)?.length ?? 0;
    if (!navigation) fail(`navegação "${key}"`, "não existe");
    else if (count === 0) fail(`navegação "${key}"`, "sem itens");
    else pass(`navegação "${key}"`, `${count} itens`);
  }
}

async function checkForm(siteId: string) {
  const [form] = await read("forms", {
    fields: ["id", "is_active", "fields.name", "fields.choices_source"],
    filter: { site: { _eq: siteId }, key: { _eq: FORM_KEY } },
    limit: 1,
  });
  if (!form) {
    fail(`formulário "${FORM_KEY}"`, "não existe");
    return;
  }
  pass(`formulário "${FORM_KEY}"`, form.is_active ? "activo" : "INACTIVO");

  const fields = (form.fields as Row[] | undefined) ?? [];
  for (const [name, spec] of Object.entries(FORM_FIELDS)) {
    const field = fields.find((row) => row.name === name);
    const label = `formulário → campo "${name}"`;
    if (!field) fail(label, "não existe");
    else if (spec.choicesSource && field.choices_source !== spec.choicesSource)
      fail(
        label,
        `choices_source é "${field.choices_source}", esperado "${spec.choicesSource}"`,
      );
    else pass(label);
  }
}

async function checkCollections(siteId: string) {
  for (const collection of SITE_COLLECTIONS) {
    const rows = await read(collection, {
      fields: ["id"],
      filter: { site: { _eq: siteId }, status: { _eq: "published" } },
      limit: -1,
    });
    if (rows.length === 0)
      fail(
        `${collection}`,
        "0 itens publicados do site visíveis ao token de leitura",
      );
    else pass(`${collection}`, `${rows.length} itens publicados`);
  }
}

async function main() {
  const siteId = await checkSite();
  if (siteId) {
    await checkPages(siteId);
    await checkNavigations(siteId);
    await checkForm(siteId);
    await checkCollections(siteId);
  }

  for (const { ok, what, detail } of results) {
    console.log(`${ok ? "✓" : "✗"} ${what}${detail ? ` — ${detail}` : ""}`);
  }
  const failed = results.filter((result) => !result.ok).length;
  console.log(
    `\n${results.length - failed}/${results.length} verificações passaram${failed ? `, ${failed} falharam` : ""}.`,
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(`✗ erro a falar com o hcms: ${errorMessage(error)}`);
  process.exit(1);
});
