## ADDED Requirements

### Requirement: Imagem de partilha do idioma
A imagem de partilha do site (`SiteSeo.image`) SHALL ser escolhida por esta ordem:
1. o `og_image` da tradução do `sites` no idioma pedido;
2. o da tradução `en-US`;
3. o `sites.og_image`.

O `alt` SHALL ser o `og_image_alt` do idioma, com o mesmo fallback, e, sem ele, a descrição do ficheiro.

As páginas que usam a imagem do site (todas menos as de produto com capa) SHALL mostrar a do seu idioma.

#### Scenario: Partilha em português
- **WHEN** se lê o HTML de `/pt` com a tradução `pt-AO` do site ligada ao OG PT
- **THEN** `og:image` é o URL do OG PT, com `og:image:width` 1200, e `/en` continua com o OG EN

#### Scenario: Idioma sem imagem própria
- **WHEN** a tradução `pt-AO` não tem `og_image` e a `en-US` tem
- **THEN** `/pt` mostra a imagem da `en-US`

#### Scenario: Sem imagens traduzidas
- **WHEN** nenhuma tradução tem `og_image`
- **THEN** as páginas mostram o `sites.og_image`, como antes desta mudança

#### Scenario: Produto com capa
- **WHEN** se lê o HTML de `/pt/products/kitenda`
- **THEN** `og:image` continua a ser a variante 1200×630 da capa do Kitenda

#### Scenario: Campo verificado
- **WHEN** o token de leitura não vê `sites.translations.og_image`
- **THEN** o `npm run cms:check` falha e indica o campo
