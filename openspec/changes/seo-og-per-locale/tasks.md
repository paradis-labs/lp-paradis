## 1. Conteúdo

- [x] 1.1 Confirmar que a `paradis-og-per-locale` está em produção: o token de leitura vê `sites.translations.og_image`, com o OG PT na `pt-AO`
- [x] 1.2 `providers/hcms.ts`: `...fileFields("translations.og_image")` no `readSite` (design, D1)
- [x] 1.3 `providers/hcms.ts`: `trFile` ao lado do `tr`, e `getSiteSeo` com `trFile(site, "og_image", language) ?? site.og_image` (design, D2)
- [x] 1.4 `cms/hcms/check-contract.ts`: `translations.og_image` nos `SITE_FIELDS`

## 2. Verificação

- [x] 2.1 `npm run lint`, `npx tsc --noEmit`, `npm run cms:check` contra produção e `npm run build`
- [x] 2.2 `curl` ao HTML de `/en`, `/pt`, `/pt/get-quote` e `/pt/products/kitenda`: o `og:image` do idioma nas três primeiras, e a capa do produto na última
- [ ] 2.3 Depois do deploy: Facebook Sharing Debugger para `/pt` e `/en`
