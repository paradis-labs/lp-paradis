## Context

Hoje:
- **Layout:** `metadata` estática (`title: "Paradis"`, `description: ""`).
- **Páginas:** três têm `generateMetadata`, só com `title` e `description`:
  - `/products` (bloco `#products`);
  - `/products/[slug]` (produto);
  - `/get-quote` (`pages_translations.seo_*` do `contact`).
- **Home:** não tem `generateMetadata`.

O `sites` do hcms tem `frontend_url`, `og_image` e as traduções `default_title`, `title_template`, `meta_description` e `og_image_alt`. O seed do template preenche todos, menos o `og_image` (`paradis-v3-covers-tina`). O `readSite` do provider só pede `name`, `email`, `social_links`, `translations.*` e os logos.

Restrições:
- **Cache Components:** a `metadata` que lê dados tem de ser `generateMetadata` sobre leituras cacheadas, ou o build pede `<Suspense>`.
- **Fusão do Next.js:** é superficial. Um `openGraph` numa página substitui o do layout por inteiro.
- **Tokens:** só leitura. Nada se escreve no hcms.

## Goals / Non-Goals

**Goals:**
- metadados de pesquisa e de partilha vindos do hcms;
- hreflang/canonical correctos nos dois idiomas;
- sitemap e robots;
- OG por produto com a capa.

**Non-Goals:**
- OG por idioma;
- `pages.og_image`, `pages.noindex` e `seo_*` da home;
- JSON-LD;
- imagens geradas com `ImageResponse`;
- uma env `SITE_URL`.

## Decisions

### D1. Uma leitura `getSiteSeo(locale)` própria
- **Decisão:** `readSite` passa a pedir também `frontend_url` e `og_image` (`fileFields`), e o provider expõe `getSiteSeo`. Devolve `SiteSeo = { baseUrl: URL | null, defaultTitle, titleTemplate, description, image: Media | null, imageAlt }`, com `string | null` onde o editor pode deixar vazio.
- **Cache:** `index.ts` cacheia com `cacheTag(readTag("seo"), readLocaleTag("seo", locale), collectionTag("media"))`, e `sites` passa a mapear também para `readTag("seo")`.
- **Porquê uma leitura própria:** o layout já chama `getNavBar`, mas a navbar não tem nada a ver com SEO. Juntá-las faria cada mudança de navegação invalidar os metadados, e vice-versa.
- **Alternativa:** pendurar os campos no `getFooter`. Recusada pelo acoplamento, e porque o `@footer` é um slot paralelo.

### D2. `frontend_url` como `metadataBase`, sem env
- O valor está no hcms e o seed já o preenche (`https://paradis.host`). Não há outra fonte a manter sincronizada.
- **Validação:** o provider valida-o com `z.url()`.
- **Vazio ou inválido:** fica `null`. O provider regista `[content]`, e o site omite `metadataBase` e `alternates`. O sitemap fica vazio, porque exige URLs absolutos. O `og:image` não depende disto, porque o URL do hcms já é absoluto.
- **Alternativa:** env `SITE_URL`. Recusada: dois sítios para o mesmo valor, e o hcms é multi-site.

### D3. Título com o template do hcms
- **Formato:** o `title_template` do hcms usa `%s`, o mesmo marcador do Next.js, e passa sem conversão.
- **Piso:** `title.default` = `default_title` ?? "Paradis" (o valor de hoje). Os `title` das páginas já existentes passam a sair com o template ("Kitenda — Paradis").
- **Home:** fica com `title.default`. Um `title` em `generateMetadata` da home seria repetido com o template.

### D4. Um helper `pageMetadata` para `alternates` e `openGraph`
- **Assinatura:** `src/lib/page-metadata.ts`, `pageMetadata(seo, locale, path, overrides?)`.
- **Devolve:**
  - `alternates`: `canonical` = `/${locale}${path}`; `languages` = `{ en, pt, "x-default": /en${path} }`;
  - `openGraph`, com `url`, `siteName`, `type`, `locale` e `images`.
- **Imagens:** as do site, a não ser que `overrides.image` venha preenchido.
- **Porquê:** cada página repete o `openGraph` (fusão superficial), e um esquecimento perderia a imagem em silêncio. Com o helper, há um só sítio que sabe montar o objecto.
- **Path das páginas:** o path de cada página é literal no `generateMetadata` dela (`""`, `/products`, `/products/${slug}`, `/get-quote`), o mesmo que o `href` dos links.
- **Locale do OG:** `en` → `en_US`, `pt` → `pt_AO`, ao lado do mapeamento `en`↔`en-US` / `pt`↔`pt-AO` do provider.

### D5. Imagem do produto: a variante 1200×630 da capa
- **Com capa:** o provider expõe `ProductDetail.shareImage`, a capa pedida ao Directus como `?width=1200&height=630&fit=cover&format=jpg&quality=80`, com 1200×630 e o alt da capa. O `openGraph` do produto usa-a, com `title` e `description` do produto.
- **Porquê (decisão do utilizador, 2026-11-01):** a capa original é um PNG 3200×2400 com 1,5 a 3 MB. O WhatsApp não mostra pré-visualizações tão pesadas, e as redes cortam o 4:3 para 1.91:1 de qualquer forma. A variante pesa 40–70 KB e é pública como o original.
- **No provider, não na página:** a página não sabe que o CMS é o Directus. A transformação é um detalhe do `/assets` do hcms, como o nome do ficheiro no URL.
- **Alternativa recusada:** a capa original (funciona no Facebook e no LinkedIn, falha no WhatsApp).
- **Sem capa:** usa-se a imagem do site.

### D6. `sitemap.ts` e `robots.ts` na raiz de `src/app`
- **Localização:** ficam fora de `[locale]`, para servir `/sitemap.xml` e `/robots.txt` sem prefixo.
- **Proxy:** o `src/proxy.ts` já exclui ficheiros com extensão.
- **Dados:** o `sitemap` lê `getSiteSeo("en")` (pelo `baseUrl`) e `getProductSlugs()`, ambos cacheados. Cada entrada tem `alternates.languages`.
- **Fixtures:** como as fixtures não estão no sitemap e dão 404 fora do desenvolvimento, não precisam de `noindex`.

### D7. Sem `twitter.images`
O X lê as `og:*` quando faltam as `twitter:*`. Basta `twitter: { card: "summary_large_image" }`.

## Risks / Trade-offs

- **[Risco] O `og_image` em produção só existe depois do `paradis-v3-covers-tina`.** Até lá, as páginas sem capa saem sem `og:image`. → É o mesmo que hoje. O código não depende da ordem.
- **[Risco] Ficheiros privados no hcms.** Um ficheiro da Paradis não legível sem token daria um `og:image` partido nos crawlers. → O `check-access` do template testa `/assets` sem token. Na verificação, também se pede o URL com `curl` sem cabeçalhos.
- **[Trade-off] Títulos das páginas mudam** ("Products" → "Products — Paradis"). É o objectivo, mas altera o que hoje aparece nos separadores.
- **[Risco] Cache do Facebook e do LinkedIn.** Depois do deploy, as partilhas antigas continuam sem imagem até se pedir um re-scrape (Sharing Debugger, Post Inspector).

## Open Questions

- Na D2, com `frontend_url` vazio, o sitemap fica vazio ou falha o build? A proposta é ficar vazio e registar o erro, como os outros campos opcionais.
