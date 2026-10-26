// Revalidação total da cache de conteúdo de um site em execução.
//
//   npm run cms:revalidate -- https://paradis.host
//
// Chama `POST /api/cms/revalidate` uma vez por coleção do hcms que o site
// conhece (`HCMS_COLLECTIONS`), com `CMS_REVALIDATE_SECRET`. Usado no runbook
// de cutover (`cms/CUTOVER.md`): depois de um rollback, e quando o Flow do hcms
// não estiver ativo. Sai com código 1 se algum pedido falhar.
//
// Corre com o Node diretamente (type stripping), como `cms/hcms/check-contract.ts`.

import { HCMS_COLLECTIONS } from "../src/content/cache-tags.ts";

const site = process.argv[2]?.replace(/\/+$/, "");
const secret = process.env.CMS_REVALIDATE_SECRET?.trim();
if (!site || !secret) {
  console.error(
    "uso: CMS_REVALIDATE_SECRET=… npm run cms:revalidate -- <url do site>",
  );
  process.exit(1);
}

let failed = 0;
for (const collection of HCMS_COLLECTIONS) {
  try {
    const response = await fetch(`${site}/api/cms/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ collection }),
    });
    const body = await response.text();
    if (!response.ok) failed++;
    console.log(
      `${response.ok ? "✓" : "✗"} ${collection} — ${response.status} ${body}`,
    );
  } catch (error) {
    failed++;
    console.log(
      `✗ ${collection} — ${error instanceof Error ? error.message : error}`,
    );
  }
}
console.log(
  failed
    ? `\n✗ ${failed}/${HCMS_COLLECTIONS.length} falharam`
    : `\n✓ ${HCMS_COLLECTIONS.length} coleções revalidadas`,
);
process.exit(failed ? 1 : 0);
