import type { Access } from "payload";

// As regras de acesso do conteúdo de marketing, com o congelamento do cutover.
//
// **`PAYLOAD_READ_ONLY=true` congela o conteúdo** (fase 4 de
// `migrate-cms-to-directus`): `create`/`update`/`delete` passam a ser recusados
// no `/admin` e na API, e as edições fazem-se só no hcms. É configuração, sem
// deploy: muda-se a variável e reinicia-se. Desligado, a escrita é a mesma de
// antes (o default do Payload, utilizador autenticado).
//
// `quote-requests` fica de fora de propósito: o formulário grava pela Local API
// com `overrideAccess: true`, e um editor tem de continuar a ver os leads.
// Estas regras saem na fase 5, com `src/collections/`.

export const isPayloadFrozen = () =>
  process.env.PAYLOAD_READ_ONLY?.trim() === "true";

const write: Access = ({ req }) => !isPayloadFrozen() && Boolean(req.user);

/** Coleções de conteúdo: leitura pública, escrita congelável. */
export const contentCollectionAccess = {
  read: () => true,
  create: write,
  update: write,
  delete: write,
};

/** Globals de conteúdo: leitura pública, gravação congelável. */
export const contentGlobalAccess = {
  read: () => true,
  update: write,
};
