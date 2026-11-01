# cms-content-source Specification

## Purpose

O módulo de conteúdo (`src/content/`, import `@/content`) como única fronteira entre o site e o CMS — os tipos de domínio independentes do schema do hcms, a validação da resposta crua na fronteira com descarte registado de itens inválidos, o rich text sanitizado, a media com URL resolvida, o fallback campo a campo para o locale padrão e a paralelização de pedidos independentes.

_Introduzida por `cms-phase-0a-content-seam` e alterada por `cms-phase-3-directus-provider` e `cms-phase-5-remove-payload`, sincronizada antes de arquivar._

## Requirements

### Requirement: Todo o acesso a conteúdo passa por um único módulo

Páginas, layouts, slots e Server Actions do site SHALL obter e gravar conteúdo exclusivamente através do módulo `src/content/` (import `@/content`). Nenhum ficheiro fora de `src/content/providers/` SHALL importar `@directus/sdk`.

A regra SHALL ser imposta pelo lint e não apenas por convenção.

#### Scenario: Import proibido num componente

- **WHEN** um componente em `src/components/` importa `@directus/sdk`
- **THEN** `npm run lint` falha

#### Scenario: Consumidores usam o módulo

- **WHEN** se procura `@directus/sdk` fora de `src/content/providers/`
- **THEN** não há nenhuma ocorrência

### Requirement: O site depende de tipos de domínio próprios

O módulo SHALL expor tipos de domínio em `src/content/types.ts`, desenhados a partir do que a UI consome e independentes da forma do schema do CMS. Identificadores, relações por id e formatos de rich text de um CMS SHALL NOT aparecer nesses tipos.

Um campo SHALL ser opcional (`T | null`) apenas quando o editor o pode deixar vazio e a UI tem piso declarado para isso. Listas SHALL ser sempre arrays, vazios quando não há itens.

#### Scenario: Lista vazia

- **WHEN** a homepage não tem projetos selecionados
- **THEN** `homepage.projects.items` é `[]` e não `null` nem `undefined`

#### Scenario: Relação chega populada

- **WHEN** um componente lê os serviços de interesse da global `get-quote`
- **THEN** recebe objetos de serviço, e o tipo não admite um id numérico no lugar

### Requirement: A resposta do CMS é validada na fronteira e os erros não são engolidos

O provider SHALL validar a resposta crua do CMS antes de a mapear para tipos de domínio, e SHALL NOT usar casts sem validação.

Uma falha de transporte ou uma global inteira inválida SHALL propagar-se como erro. Um item inválido dentro de uma lista SHALL ser descartado e registado com o slug, o locale, o identificador do item e o campo em falta, e os restantes itens SHALL ser entregues.

#### Scenario: Base de dados indisponível

- **WHEN** o CMS não responde ao pedido da homepage
- **THEN** a rota renderiza o error boundary do Next e não uma página vazia com status 200

#### Scenario: Projeto sem URL

- **WHEN** um dos projetos da homepage não tem `url`
- **THEN** esse projeto não é renderizado, um erro estruturado é registado no servidor e os restantes projetos aparecem

### Requirement: Rich text chega como HTML sanitizado

Campos de rich text SHALL chegar ao domínio como HTML sanitizado por uma allowlist (parágrafos, ênfase, listas, links e quebras de linha), com um tipo distinto de `string` que só o módulo de conteúdo produz. Os componentes SHALL NOT importar renderers de rich text de um CMS.

Links dentro de rich text que apontem para fora do site SHALL ter `rel="noopener noreferrer"`.

#### Scenario: Resposta de FAQ

- **WHEN** a secção de FAQ renderiza uma resposta com um parágrafo, uma lista e um link
- **THEN** o HTML resultante contém esses elementos e é visualmente equivalente ao de antes da migração

#### Scenario: Marcação não permitida

- **WHEN** o conteúdo de rich text contém um `<script>` ou um atributo `onclick`
- **THEN** nenhum dos dois chega ao HTML da página

### Requirement: Media chega com URL resolvida

Uma media no domínio SHALL ter `url`, `alt`, `width` e `height`, com `url` já resolvida pelo provider para o `/assets/<id>` do hcms. Os componentes SHALL NOT construir URLs de media.

#### Scenario: Imagem do hero

- **WHEN** o hero é renderizado
- **THEN** o `src` da imagem resolve para o `/assets/<id>` do hcms, através do `next/image`

### Requirement: Campo localizado vazio recai no locale padrão

Quando um campo localizado está vazio no locale pedido, o módulo SHALL entregar o valor do locale padrão (`en`). Esta garantia SHALL ser do módulo e não do CMS, para que todos os providers a cumpram.

#### Scenario: Tradução em falta

- **WHEN** o título da secção de serviços está preenchido em `en` e vazio em `pt`, e um visitante abre `/pt`
- **THEN** o título aparece com o valor em inglês

### Requirement: Pedidos independentes correm em paralelo

Quando uma rota precisa de mais de um conteúdo sem dependência entre eles, os pedidos SHALL ser iniciados em paralelo e não em série.

#### Scenario: Layout e página

- **WHEN** `/en` é servido
- **THEN** o pedido do navbar e o da homepage não esperam um pelo outro

### Requirement: O provider hcms cumpre o mesmo contrato

O provider hcms SHALL implementar todas as funções do módulo com as mesmas garantias do provider Payload: validação na fronteira, propagação de erros de transporte, descarte registado de itens inválidos, rich text sanitizado e fallback para o idioma padrão campo a campo. SHALL ler com um token só de leitura e SHALL escrever submissões com um token que só tem `create` em `form_submissions`.

#### Scenario: Tradução parcial

- **WHEN** a tradução `pt-AO` de uma oferta tem o título preenchido e o resumo vazio, e um visitante abre `/pt`
- **THEN** o título aparece em português e o resumo em inglês

#### Scenario: Link de navegação para uma secção

- **WHEN** a navegação `header` tem um item do tipo `anchor` para `services` na página `home`, e o visitante está em `/pt/get-quote`
- **THEN** o link aponta para `/pt#services`
