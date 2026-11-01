## ADDED Requirements

### Requirement: Metadados do site vindos do hcms
O layout `[locale]` SHALL gerar os metadados a partir do `sites` `paradis` no idioma pedido, com fallback campo a campo para `en-US`:
- `metadataBase` = `frontend_url`;
- `title.default` = `default_title`;
- `title.template` = `title_template`;
- `description` = `meta_description`.

Um campo vazio SHALL ser omitido, e não substituído por texto inventado. O `title` mantém o piso "Paradis", que é o de hoje.

#### Scenario: Título de uma página
- **WHEN** se abre `/en/get-quote` e o `seo_title` da página é "Get Quote" com `title_template` "%s — Paradis"
- **THEN** o `<title>` é "Get Quote — Paradis"

#### Scenario: Descrição em português
- **WHEN** se abre `/pt`
- **THEN** a `meta description` é o `meta_description` `pt-AO` do site

#### Scenario: Sem frontend_url
- **WHEN** o `frontend_url` está vazio
- **THEN** a página renderiza sem `canonical` nem `alternates`, e o provider regista `[content]` com o campo em falta

### Requirement: Imagem de partilha
Todas as páginas SHALL ter `og:image` e `twitter:card` `summary_large_image`. A imagem de cada página SHALL ser:
- **página de produto com capa:** a variante 1200×630 em JPEG da capa (`shareImage`), com largura, altura e o alt da capa;
- **qualquer outra página:** o `sites.og_image`, com o `og_image_alt` do idioma.

O URL SHALL ser absoluto (o `${CMS_URL}/assets/…` da `Media`).

O `openGraph` SHALL ter também `siteName`, `type` `website` e `locale` (`en_US` ou `pt_AO`). A página de produto SHALL repetir estes campos, porque o Next.js substitui o `openGraph` do layout.

#### Scenario: Home
- **WHEN** se lê o HTML de `/en`
- **THEN** há `og:image` com o URL do `sites.og_image`, `og:image:width` 1200, `og:image:alt`, `og:site_name` e `og:locale` `en_US`

#### Scenario: Produto
- **WHEN** se lê o HTML de `/pt/products/kitenda`
- **THEN** `og:image` é a capa do Kitenda a 1200×630 em JPEG (`og:image:width` 1200), `og:title` é "Kitenda", `og:locale` é `pt_AO` e `og:site_name` continua presente

#### Scenario: Site sem og_image
- **WHEN** o `sites.og_image` está vazio
- **THEN** as páginas sem capa não têm `og:image`, e o build não falha

### Requirement: Idiomas alternativos e canonical
A home, `/products`, `/products/<slug>` e `/get-quote` SHALL declarar:
- `alternates.canonical`, com o caminho do próprio idioma;
- `alternates.languages`, com `en`, `pt` e `x-default` (este aponta para o caminho `en`).

#### Scenario: hreflang de um produto
- **WHEN** se lê o HTML de `/pt/products/tina`
- **THEN** há `<link rel="canonical">` para `<frontend_url>/pt/products/tina`, e `hreflang` `en`, `pt` e `x-default` para as duas versões

### Requirement: Sitemap e robots
- **`/sitemap.xml`:** SHALL listar, em cada idioma, a home, `/products`, `/get-quote` e cada produto de `getProductSlugs`, com os `alternates` de idioma.
- **`/robots.txt`:** SHALL permitir tudo e apontar para o sitemap.
- **Fixtures:** as rotas de fixtures SHALL NOT aparecer no sitemap.

#### Scenario: Produto novo no sitemap
- **WHEN** um projecto é publicado no hcms e a cache é revalidada
- **THEN** `/sitemap.xml` passa a ter `/en/products/<slug>` e `/pt/products/<slug>`

### Requirement: Contrato SEO verificado
O `npm run cms:check` SHALL falhar se o token de leitura não vir algum destes campos:
- no `sites`: `frontend_url` e `og_image`;
- nas traduções: `default_title`, `title_template`, `meta_description` e `og_image_alt`.

#### Scenario: Campo removido
- **WHEN** o `title_template` deixa de ser legível pelo token de leitura
- **THEN** o `cms:check` termina com falha e indica o campo
