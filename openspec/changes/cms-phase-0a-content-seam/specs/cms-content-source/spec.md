## ADDED Requirements

### Requirement: Todo o acesso a conteúdo passa por um único módulo

Páginas, layouts, slots e Server Actions do site SHALL obter e gravar conteúdo exclusivamente através do módulo `src/content/` (import `@/content`). Nenhum ficheiro fora de `src/content/providers/`, `src/collections/`, `src/payload.config.ts` e do route group `(payload)` SHALL importar `payload`, `@payloadcms/*`, `@payload-config` ou `payload-types.ts`.

A regra SHALL ser imposta pelo lint e não apenas por convenção.

#### Scenario: Import proibido num componente

- **WHEN** um componente em `src/components/` importa `payload-types.ts` ou `@payloadcms/richtext-lexical/react`
- **THEN** `npm run lint` falha

#### Scenario: Consumidores usam o módulo

- **WHEN** se procura `payload-functions` ou `getPayloadInstance` fora de `src/content/providers/`
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

Uma media no domínio SHALL ter `url`, `alt`, `width` e `height`, com `url` já resolvida para o caminho servido pelo site (`/cdn/<chave>`). Os componentes SHALL NOT construir URLs de media.

#### Scenario: Imagem do hero

- **WHEN** o hero é renderizado com uma imagem
- **THEN** o `src` da imagem começa por `/cdn/`

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
