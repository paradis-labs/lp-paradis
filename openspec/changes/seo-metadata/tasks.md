## 1. Conteúdo

- [x] 1.1 `types.ts`: `SiteSeo` (design, D1)
- [x] 1.2 `providers/hcms.ts`:
  - `frontend_url` e `fileFields("og_image")` no `readSite`;
  - zod com `z.url()` tolerante (inválido → `null` + `[content]`);
  - `getSiteSeo` com fallback `en-US` campo a campo
- [x] 1.3 `cache-tags.ts`: leitura `seo` em `ContentRead` e `READ_COLLECTIONS` (`["media"]`); `sites` → também `readTag("seo")`
- [x] 1.4 `index.ts`: `getSiteSeo` com `"use cache"`, `cacheTag` e `cacheLife` como as outras leituras
- [x] 1.5 `cms/hcms/check-contract.ts`: os campos SEO do `sites` e das traduções

## 2. Metadados

- [x] 2.1 `src/lib/page-metadata.ts`: `pageMetadata(seo, locale, path, overrides?)` com `alternates`, `openGraph` (`url`, `siteName`, `type`, `locale` `en_US`/`pt_AO` e `images`) e `twitter.card` (design, D4 e D7)
- [x] 2.2 Layout: `metadata` estática → `generateMetadata` com `metadataBase`, `title` `{ default, template }`, `description`, e `pageMetadata(seo, locale, "")` como base
- [x] 2.3 Home (`(pages)/page.tsx`): `generateMetadata` só com `pageMetadata(…, "")`, sem `title`
- [x] 2.4 `/products` e `/get-quote`: juntar `pageMetadata` ao `title` e à `description` que já têm
- [x] 2.5 `/products/[slug]`: `pageMetadata` com `overrides.image` = `coverImage` e título/descrição do produto no `openGraph` (design, D5)
- [x] 2.6 `ProductDetail.shareImage`: a variante 1200×630 JPEG da capa, montada no provider (`shareVariant`), e usada pelo `/products/[slug]` em vez da `coverImage` (design, D5)

## 3. Sitemap e robots

- [x] 3.1 `src/app/sitemap.ts`: home, `/products`, `/get-quote` e os produtos nos dois idiomas, com `alternates.languages`; vazio sem `baseUrl`
- [x] 3.2 `src/app/robots.ts`: `allow: "/"` e o URL do sitemap
- [x] 3.3 Confirmar que o `proxy.ts` não prefixa `/sitemap.xml` nem `/robots.txt`

## 4. Verificação

- [x] 4.1 `npm run lint`, `npm run build` (sem erros de Cache Components) e `npm run cms:check`
- [x] 4.2 `curl` ao HTML de `/en`, `/pt`, `/pt/products/kitenda`, `/en/products/tina` e `/en/get-quote`: `<title>`, `description`, `og:*`, `canonical` e `hreflang` como nos cenários da spec
- [x] 4.3 `/sitemap.xml` e `/robots.txt`; o URL do `og:image` responde 200 sem token
- [ ] 4.4 Depois do deploy e do `paradis-v3-covers-tina` em produção: Facebook Sharing Debugger e LinkedIn Post Inspector para `/en` e um produto
