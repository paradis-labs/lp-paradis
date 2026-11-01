# product-detail-page Specification

## Purpose

A página `/[locale]/products/[slug]`, com o detalhe de um produto (`project`) do site. Cobre a rota e o comportamento de um slug desconhecido, as secções do artboard "v3 · Product detail — Kitenda" e a regra de que cada uma só renderiza com conteúdo, o cartão do produto seguinte, a cópia de UI localizada, os metadados de SEO, e a leitura cacheada e a sua invalidação.

_Introduzida por `v3-product-detail`, sincronizada antes de arquivar._

## Requirements

### Requirement: Uma página por produto
O site SHALL servir `/[locale]/products/[slug]` para cada projecto publicado do site, nos dois locales, prerenderizada. O `slug` SHALL ser o de `en-US`, igual nos dois idiomas, como nos serviços. Um slug sem projecto SHALL renderizar a página 404 através de `notFound()`, e o locale SHALL ser resolvido com `requireLocale()`.

Com Cache Components, a rota envia primeiro um shell estático, por isso um slug desconhecido é um *soft 404*: o estado HTTP fica 200, o corpo é a página 404 e o Next injeta `<meta name="robots" content="noindex">`. Um 404 verdadeiro exigiria verificar o slug no `proxy`, com uma ida ao CMS por pedido, e não é pedido aqui (ver `notFound` nas docs do Next 16).

#### Scenario: Produto existente
- **WHEN** é pedido `/pt/products/kitenda`
- **THEN** a resposta é 200 com o detalhe do Kitenda em português

#### Scenario: Slug desconhecido
- **WHEN** é pedido `/en/products/nao-existe`
- **THEN** o corpo é a página 404 e leva `<meta name="robots" content="noindex">`

### Requirement: As secções do artboard, cada uma só com conteúdo
A página SHALL seguir o artboard "v3 · Product detail — Kitenda", por esta ordem:
1. o `PageHeader`, com o breadcrumb "← Our Products / <título>" (o primeiro elemento é um link para `/products`, com uma seta para a esquerda), o título a 72 / 56 / 40px e o `summary` como lead na mesma coluna. O CTA "Visit <título>" para o `url` do projecto abre num novo separador e alinha com o fundo dessa coluna a partir de 1024px. Abaixo de 1024px, o CTA fica por baixo do lead;
2. a capa (`coverImage`) a toda a largura: 640px de altura, e 340px abaixo de 768px;
3. a ficha, com Category, Market, Platform e Live at (o `url` sem protocolo, como link), em 4 / 2 / 1 colunas;
4. o painel escuro, com "The Challenge" (`challenge`) e "The Solution" (`solution`). Em cada bloco, a pill fica por cima do texto grande. Por baixo da solução vêm as características (cartões com ícone);
5. a galeria: a primeira imagem a toda a largura (560px), e as seguintes em duas colunas (420px). Abaixo de 768px, uma coluna, com todas as imagens a 260px;
6. o testemunho ligado: um ícone de aspas, a citação e, por baixo e centrados, o avatar (ou as iniciais do autor), o autor e o handle;
7. "Next product": o projecto seguinte, num cartão largo, e um link "View all products" para `/products`.

Cada secção, e cada entrada da ficha, SHALL renderizar só quando tem conteúdo. Um projecto só com título, resumo, capa e URL SHALL mostrar o cabeçalho, a capa, a ficha com Live at, e "Next product".

#### Scenario: Kitenda completo
- **WHEN** o Kitenda tem categoria, mercado, plataforma, desafio, solução, três características, uma imagem na galeria e testemunho
- **THEN** a página mostra as sete secções

#### Scenario: Sem testemunho
- **WHEN** a Ficha Segura não tem testemunho
- **THEN** a secção do testemunho não renderiza e as outras não deixam espaço vazio no lugar dela

#### Scenario: Testemunho sem foto
- **WHEN** o testemunho do Kitenda não tem avatar e o autor é "Alfredo Vidinhas"
- **THEN** no lugar do avatar aparece um disco escuro de 56px com "AV", escondido dos leitores de ecrã

#### Scenario: Só um produto no site
- **WHEN** o site tem um único projecto
- **THEN** "Next product" não renderiza

### Requirement: Cópia de UI e textos do CMS
Os títulos de secção ("The Challenge", "The Solution", "Next product", "View all products", "View product", os rótulos da ficha, "Visit", "Our Products" no breadcrumb) SHALL ser cópia de UI localizada em `Record<Locale, …>`. Todo o conteúdo do produto SHALL vir do hcms.

#### Scenario: Locale português
- **WHEN** `/pt/products/kitenda` é servido
- **THEN** nenhum título de secção aparece em inglês

### Requirement: Metadados de SEO do produto
A rota SHALL exportar `generateMetadata` com `title` igual ao título do projecto e `description` igual ao `summary`.

#### Scenario: Título
- **WHEN** `/en/products/kitenda` é servido
- **THEN** o `<title>` é "Kitenda"

### Requirement: Leitura cacheada e invalidada
O detalhe SHALL vir de `getProduct(locale, slug)` em `@/content`, com `"use cache"`, `cacheLife` de 1 hora e as tags `cms:product`, `cms:product:<locale>`, `cms:collection:projects`, `cms:collection:testimonials` e `cms:collection:media`. As colecções `categories` e `projects_files` do hcms SHALL invalidar `cms:collection:projects`.

#### Scenario: Editar a galeria
- **WHEN** o hcms chama o endpoint de revalidação com `collection: "projects_files"`
- **THEN** a página do produto e a listagem são invalidadas

### Requirement: O produto seguinte
"Next product" SHALL mostrar um único projecto: o que vem a seguir ao actual na ordem da listagem `/products`. Depois do último, SHALL mostrar o primeiro. Esse projecto SHALL aparecer num cartão largo que é uma única âncora para `/[locale]/products/<slug>` (ou para o site externo, num novo separador, quando o projecto não tem slug). O cartão SHALL ter:
- a partir de 1024px, duas colunas (5fr / 7fr): à esquerda, a categoria, o título como `<h3>` a 56px em gradiente, a descrição, as tags como pills e um falso botão escuro "View product →"; à direita, a capa, com pelo menos 460px de altura e `data-cursor-text="Explore"`;
- abaixo de 1024px, uma só coluna, com a capa em cima e pelo menos 320px de altura.

No hover do cartão, o falso botão SHALL fazer a mesma animação de preenchimento e troca de texto dos CTAs, e a capa SHALL fazer zoom. Com movimento reduzido, não há zoom nem animação.

#### Scenario: Produto do meio
- **WHEN** a listagem tem Kitenda, Ficha Segura, Génesis e Tina, por esta ordem, e é pedido `/en/products/ficha-segura`
- **THEN** "Next product" mostra a Génesis e leva a `/en/products/<slug da Génesis>`

#### Scenario: Último produto
- **WHEN** é pedido `/en/products/tina`, o último da listagem
- **THEN** "Next product" mostra o Kitenda

#### Scenario: Nome acessível do cartão
- **WHEN** um leitor de ecrã encontra o cartão
- **THEN** o link é anunciado pelo título do produto, e o "View product" não é anunciado como um segundo botão
