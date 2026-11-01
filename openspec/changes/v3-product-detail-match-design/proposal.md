## Why

A página `/[locale]/products/[slug]` (change `v3-product-detail`) não está como o artboard "v3 · Product detail — Kitenda" do canvas (`project/Product.dc.html`). O fim da página é diferente: o design tem "Next product", com um único cartão largo, e o site mostra "More Products" numa grelha. Também há desvios no cabeçalho, na ficha, no painel escuro e no testemunho. A tarefa 4.2 dessa change ("Comparar com o artboard") ficou por fazer, e esta change fecha-a.

## What Changes

- **Cabeçalho:**
  - o breadcrumb ganha a seta "←" antes de "Our Products" e o separador em `#c4c8cb`;
  - o H1 passa a 72 / 56 / 40px (`line-height` 1,05), o mesmo tamanho dos outros cabeçalhos. O tamanho `xl` (88px) sai do `PageHeader`;
  - o lead fica na coluna do H1, e o CTA "Visit" alinha com o fundo dessa coluna.
- **Ficha:** não muda. O design mostra "Pricing", mas o hcms não tem esse campo, e o `market` guarda o mercado ("Angola"). A ficha continua com Category · Market · Platform · Live at até o template ter um campo `pricing` (design D5).
- **Painel escuro:**
  - a pill fica por cima do texto grande, e não ao lado, com 28px entre os dois;
  - há 120px entre "The Challenge" e "The Solution", e os cartões de características ficam a 56px do texto da solução;
  - a máscara da grelha passa a uma elipse de 60% × 40%;
  - em mobile, o painel tem margem de 8px e padding de 56 / 20px.
- **Testemunho:**
  - há um ícone de aspas por cima da citação;
  - a autoria fica empilhada e centrada: o avatar de 56px (ou as iniciais num disco escuro quando não há foto), o nome a 16px e a tag a 14px;
  - a citação fica a 24px em mobile.
- **BREAKING (comportamento): "More Products" passa a "Next product".**
  - Mostra um só produto: o seguinte na ordem da listagem, e o primeiro depois do último.
  - É um cartão largo e horizontal (5fr / 7fr): à esquerda, a categoria, o título de 56px em gradiente, a descrição, as tags e "View product →"; à direita, a capa. Abaixo de 1024px, o cartão empilha e a capa fica em cima.
  - No cabeçalho da secção, o H2 "Next product" e um link de texto "View all products →", em vez do eyebrow, do subtítulo e do botão outline.
- **Pormenores de mobile:** a capa passa a 340px e as imagens da galeria a 260px.

## Capabilities

### New Capabilities
<!-- nenhuma -->

### Modified Capabilities
- `product-detail-page`: o conteúdo das secções muda ("Next product" no lugar de "More Products", o layout do cabeçalho e do testemunho), e a cópia de UI muda com elas. O spec base vive no delta de `v3-product-detail`, que ainda não foi arquivada.

## Impact

- **Código:**
  - `src/components/ProductDetail/index.tsx`;
  - `src/components/PageHeader/index.tsx` (o lead vai para a coluna do H1, e o `titleSize="xl"` sai);
  - um cartão novo "next product" (a listagem continua com o `ProductCard`);
  - `src/content/types.ts` e `providers/hcms.ts` (`ProductPage.others` → `next`).
- **Sem mudanças no hcms.** O "Pricing" do design fica pendente de um campo `pricing` no `Template-multisite-tenant`.
- **Ordem:** `v3-product-detail` tem de ser arquivada antes desta, porque o `product-detail-page` só existe em `openspec/specs/` depois disso.
- **Products e Get Quote:** não usam ações no `PageHeader`, por isso o novo layout do cabeçalho não as afeta.
