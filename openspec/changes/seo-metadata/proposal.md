## Why

O site quase não tem SEO. A `metadata` do layout é `{ title: "Paradis", description: "" }`, e não há:
- `og:image`;
- `metadataBase`;
- hreflang, canonical, sitemap nem robots.

Uma partilha no WhatsApp ou no LinkedIn mostra só o domínio.

O hcms já modela tudo isto no `sites`, e o seed preenche-o:
- `frontend_url`;
- `default_title`, `title_template` e `meta_description` (traduzidos);
- `og_image`, mais `og_image_alt` (traduzido).

O site ignora estes campos. O template vai carregar o `og_image` (change `paradis-v3-covers-tina` no `Template-multisite-tenant`).

## What Changes

- **Leitura nova `getSiteSeo(locale)`**, cacheada como as outras, com a tag `cms:seo` invalidada por `sites`.
- **Layout:** passa a usar `generateMetadata`:
  - `metadataBase` = `sites.frontend_url`;
  - `title` = `{ default: default_title, template: title_template }`;
  - `description` = `meta_description`;
  - `openGraph` com `siteName`, `locale` (`en_US`/`pt_AO`), `type: website` e a imagem de `sites.og_image` com o alt;
  - `twitter.card` `summary_large_image`.
- **Um OG para os dois idiomas:** o ficheiro não é traduzido; o alt é.
- **Por página:** `alternates` com `canonical` e `languages` (`en`, `pt`, `x-default` → `/en`) na home, em `/products`, em `/products/<slug>` e em `/get-quote`.
- **Produto:** a OG da página de um produto usa a capa do produto (`coverImage`), com o título e a descrição dele. Sem capa, herda a imagem do site. A página repete o `openGraph` do site, porque o Next.js substitui o objecto e não o funde.
- **`sitemap.ts` e `robots.ts`:**
  - o sitemap tem as páginas dos dois idiomas e os produtos de `getProductSlugs`, com `alternates`;
  - o robots permite tudo e aponta para o sitemap.
- **`cms:check`:** verifica que os campos SEO do `sites` existem e são legíveis.

## Capabilities

### New Capabilities
- `seo-metadata`: os metadados de pesquisa e partilha do site, lidos do `sites` do hcms.

### Modified Capabilities
- `cms-cache-revalidation`: uma alteração em `sites` passa também a invalidar `cms:seo`.

## Impact

- **Código:**
  - `src/content/types.ts` (`SiteSeo`);
  - `src/content/providers/hcms.ts` (campos SEO na leitura do site);
  - `src/content/index.ts`;
  - `src/content/cache-tags.ts`;
  - `src/app/(app)/[locale]/layout.tsx` e o `generateMetadata` das quatro páginas;
  - um helper de alternates;
  - `src/app/sitemap.ts`, `src/app/robots.ts`;
  - `cms/hcms/check-contract.ts`.
- **Schema hcms:** nenhuma mudança (os campos existem).
- **Env:** nenhuma nova. O domínio vem de `frontend_url`.
- **Fora do âmbito:**
  - OG por idioma ou desenhada por produto;
  - `pages.noindex` e `pages.og_image`;
  - dados estruturados (JSON-LD).
- **Depende de:** nada para o código. A imagem só aparece depois do `paradis-v3-covers-tina` em produção.
