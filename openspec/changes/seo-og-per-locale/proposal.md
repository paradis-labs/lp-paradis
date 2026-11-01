## Why

A `seo-metadata` usa o `sites.og_image`, um só ficheiro para os dois idiomas, por isso uma partilha de `/pt` mostra a imagem com o texto em inglês. O template passa a ter uma imagem por idioma em `sites_translations.og_image`, com a Paradis em EN e PT (change `paradis-og-per-locale` no `Template-multisite-tenant`).

## What Changes

- **Provider:** o `readSite` pede também o ficheiro da tradução (`translations.og_image.*`).
- **`getSiteSeo(locale)`:** a `image` passa a ser escolhida por esta ordem:
  1. a imagem da tradução do idioma pedido;
  2. a da tradução `en-US`, pelo fallback campo a campo que o provider já faz;
  3. o `sites.og_image`.
  
  O `alt` continua a ser o `og_image_alt` do idioma.
- **Páginas de produto:** não mudam. A imagem de partilha delas é a capa do produto (`shareImage`).
- **`cms:check`:** verifica também `sites.translations.og_image`.
- **Cache:** nenhuma mudança. `sites_translations` já invalida `cms:seo`, porque conta como `sites`.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `seo-metadata`: a imagem de partilha do site passa a ser a do idioma, e o `sites.og_image` passa a ser a imagem por omissão.

## Impact

- **Código:** `src/content/providers/hcms.ts` (`readSite`, `getSiteSeo` e um `trFile` ao lado do `tr`) e `cms/hcms/check-contract.ts`.
- **Tipos:** nenhuma mudança. `SiteSeo.image` continua a ser `Media | null`.
- **Depende de** `paradis-og-per-locale` estar em produção.
  - Antes disso, o campo pedido não existe, e o Directus recusa a leitura do `sites` inteiro (navbar, footer e SEO).
  - O deploy só avança depois de o `npm run cms:check` passar contra produção.
- **Depende também** da `seo-metadata`, que esta change estende.
