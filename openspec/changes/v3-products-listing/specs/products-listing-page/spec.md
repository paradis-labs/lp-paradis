## ADDED Requirements

### Requirement: A rota /products existe nos dois locales

O site SHALL servir `/[locale]/products` para `en` e `pt`, prerenderizada, com a navbar, o footer de base (com a faixa "Ready to build?") e o switch de idioma a levar à mesma rota no outro locale. Como as outras entradas, a página SHALL resolver o locale com `requireLocale()`.

#### Scenario: Trocar de idioma

- **WHEN** o visitante em `/en/products` usa o switch de idioma
- **THEN** chega a `/pt/products`

#### Scenario: Locale inválido

- **WHEN** é pedido `/xx/products`
- **THEN** a resposta é 404

### Requirement: O cabeçalho vem do bloco #products da home

O `PageHeader` da página SHALL mostrar o eyebrow, o título e o lead do bloco `block_collection` com âncora `products` da página `home` do hcms, com o fallback por campo para `en-US` que o provider já aplica. Cada um tem um piso em código (`Record<Locale, …>`): "Our Products", "Digital Products Built to Solve Real Problems" e o lead do mockup, mais as versões PT.

#### Scenario: Bloco authorado

- **WHEN** o bloco `#products` tem título "Digital Products Built to Solve Real Problems" em `en`
- **THEN** o H1 de `/en/products` é esse título

#### Scenario: Bloco desligado na home

- **WHEN** o bloco `#products` tem `hide_block` ligado
- **THEN** `/products` continua a renderizar com os textos do bloco, porque `hide_block` só controla a secção da home

### Requirement: Cartões de produto da listagem

A página SHALL mostrar os `projects` do site pela ordem authorada, numa grelha de duas colunas (uma abaixo de 900px), com os valores visuais do artboard. Cada cartão SHALL ser uma única âncora para o `url` do projeto, aberta num novo separador com `rel="noopener noreferrer"`, e SHALL conter:

- o número de ordem com dois dígitos (`01`, `02`, …);
- o título como `<h2>`;
- a capa (`coverImage`, por `next/image` com `sizes`), com zoom de 1,065 no hover em 0,5 s e `data-cursor-text="Explore"`; sem capa, uma área neutra com o título;
- a descrição.

O contorno do cartão SHALL passar a `#d4d7da` no hover. Com movimento reduzido, sem zoom nem transição. Os cartões SHALL revelar uma vez ao scroll, com stagger de 0,12 s, pela primitiva de `v3-home-reskin`.

O cartão SHALL NOT mostrar a categoria nem as tags do mockup enquanto o domínio `Project` não as tiver.

#### Scenario: Dois projetos

- **WHEN** o hcms devolve Kitenda e Ficha Segura, por esta ordem
- **THEN** a página mostra dois cartões numerados 01 e 02 que abrem os respetivos sites num novo separador

#### Scenario: Nome acessível do cartão

- **WHEN** um leitor de ecrã encontra um cartão
- **THEN** o link é anunciado pelo título do produto e indica que abre num novo separador

#### Scenario: Projeto inválido

- **WHEN** um projeto do hcms não tem `url`
- **THEN** o provider descarta-o (`[content] item inválido descartado`) e a numeração dos restantes é contínua

### Requirement: Listagem vazia

Sem nenhum projeto válido, a página SHALL renderizar o cabeçalho e uma linha de estado vazio (cópia de UI localizada) no lugar da grelha, e SHALL NOT devolver 404 nem erro.

#### Scenario: Nenhum projeto

- **WHEN** o hcms não devolve projetos
- **THEN** `/en/products` responde 200 com o cabeçalho e a mensagem de estado vazio

### Requirement: Metadados de SEO

A rota SHALL exportar `generateMetadata` com `title` igual ao título do bloco e `description` igual ao lead. Um campo vazio SHALL cair na `metadata` estática do layout.

#### Scenario: Título authorado

- **WHEN** o bloco tem título e lead em `pt`
- **THEN** o `<title>` e a meta description de `/pt/products` são esses valores

### Requirement: Leitura cacheada e invalidada pelas coleções certas

O conteúdo da página SHALL vir de uma leitura `getProductsPage(locale)` de `@/content`, com `"use cache"`, `cacheLife` de 1 hora e as tags `cms:products-page`, `cms:products-page:<locale>`, `cms:collection:projects` e `cms:collection:media`. O endpoint de revalidação SHALL invalidar `cms:products-page` quando mudam `pages`, `page_blocks` ou qualquer `block_*`, e `cms:collection:projects` quando mudam `projects`.

#### Scenario: Editar um projeto

- **WHEN** o hcms chama `POST /api/cms/revalidate` com `collection: "projects"`
- **THEN** a próxima visita a `/en/products` mostra o projeto editado

#### Scenario: Editar o bloco da home

- **WHEN** o hcms chama o endpoint com `collection: "block_collection"`
- **THEN** a leitura `products-page` é invalidada, tal como a `homepage`

### Requirement: A navbar marca Products como corrente

Em `/products`, o link do navbar cujo destino é `/products` SHALL ter `aria-current="page"` e o estilo de link corrente, na barra e no menu mobile.

#### Scenario: Link authorado para /products

- **WHEN** o item "Products" da navegação `header` aponta para `/products` e o visitante está em `/en/products`
- **THEN** esse link tem `aria-current="page"`
