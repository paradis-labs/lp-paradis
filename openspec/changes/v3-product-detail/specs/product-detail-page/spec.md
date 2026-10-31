## ADDED Requirements

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
1. o `PageHeader`, com o breadcrumb "Our Products / <título>" (o primeiro elemento é um link para `/products`), o título, o `summary` como lead e o CTA "Visit <título>" para o `url` do projecto, num novo separador;
2. a capa (`coverImage`) a toda a largura;
3. a ficha, com Category, Market, Platform e Live at (o `url` sem protocolo, como link);
4. o painel escuro, com "The Challenge" (`challenge`) e "The Solution" (`solution`) e, por baixo da solução, as características (cartões com ícone, `product-feature-cards` no change `v3-scroll-lit-text`);
5. a galeria: a primeira imagem a toda a largura, e as seguintes em duas colunas;
6. o testemunho ligado, com a citação, o autor e o handle;
7. "More Products": os outros projectos, com o mesmo cartão da listagem.

Cada secção, e cada entrada da ficha, SHALL renderizar só quando tem conteúdo. Um projecto só com título, resumo, capa e URL SHALL mostrar o cabeçalho, a capa, a ficha com Live at, e "More Products".

#### Scenario: Kitenda completo
- **WHEN** o Kitenda tem categoria, mercado, plataforma, desafio, solução, três características, uma imagem na galeria e testemunho
- **THEN** a página mostra as sete secções

#### Scenario: Sem testemunho
- **WHEN** a Ficha Segura não tem testemunho
- **THEN** a secção do testemunho não renderiza e as outras não deixam espaço vazio no lugar dela

#### Scenario: Só um produto no site
- **WHEN** o site tem um único projecto
- **THEN** "More Products" não renderiza

### Requirement: Cópia de UI e textos do CMS
Os títulos de secção ("The Challenge", "The Solution", "More Products", "Keep exploring what we build.", os rótulos da ficha, "Visit", "Our Products" no breadcrumb) SHALL ser cópia de UI localizada em `Record<Locale, …>`. Todo o conteúdo do produto SHALL vir do hcms.

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
