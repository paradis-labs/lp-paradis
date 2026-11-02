## Context

- **Referência:** o artboard "v3 · Product detail — Kitenda" do canvas "Paradis Landing Page" (`project/Product.dc.html`). Os valores abaixo saíram do estilo inline desse artboard e das media queries `.pd-*` dele (≤1023px e ≤767px, que correspondem ao `lg` e ao `md` do Tailwind).
- **Estado actual:** `src/components/ProductDetail/index.tsx` (change `v3-product-detail`). A galeria e os breakpoints da ficha já estão como no design. O resto tem os desvios da proposta.
- **Porquê "Next product":** o design só tinha dois produtos, por isso `more` (os cartões sem o actual) era um só, e daí o título no singular. O hcms tem 4 ou mais.

## Goals / Non-Goals

**Goals:**
- O detalhe de produto igual ao artboard, em desktop e a 390px.
- Manter a degradação por secção da `v3-product-detail`.

**Non-Goals:**
- Um campo `pricing` no hcms (ver D5).
- Mudar a listagem `/products` ou o `ProductCard`.
- Mudar o aspecto dos cabeçalhos de Products e Get Quote.

## Decisions

### D1. O lead vai para a coluna do H1 dentro do `PageHeader`
No design, o H1 e o lead formam uma coluna (`max-width` 820px, `gap` 16px), e as ações alinham com o fundo dessa coluna (`align-items: flex-end`). O `PageHeader` passa a ter esta estrutura:

```
[breadcrumb | eyebrow]
┌ coluna (H1 + lead) ───┐  ┌ children ┐
└───────────────────────┘  └──────────┘
```

Sem `children` (Products e Get Quote), a coluna é a única coisa na linha, e o resultado visual é o mesmo de hoje. O `-mt-3` do lead sai: o `gap` de 16px da coluna substitui-o. O `titleSize` e a variante `xl` saem, porque o único utilizador era o detalhe de produto e o design usa 72px como os outros.

*Alternativa:* passar o lead como `children` só no detalhe. Rejeitada, porque duplicava o lead bicolor (`splitLead`) fora do `PageHeader`.

### D2. `ProductPage.others` passa a `next: Project | null`
O provider já tem `projects` na ordem da listagem e o `index` do actual. O seguinte é `projects[(index + 1) % projects.length]`, e é `null` quando só há um projecto. A regra fica no provider, que já sabe a ordem, e a UI só recebe o projecto a mostrar. A leitura e as cache tags não mudam.

### D3. Um componente `NextProductCard`, separado do `ProductCard`
O cartão do design é outro layout: horizontal, título de 56px em gradiente, CTA falso e sem número. Pôr tudo isto atrás de props no `ProductCard` misturava dois cartões num só. O `NextProductCard` reaproveita a decisão interno/externo do `ProductCard` (slug → `Link`, sem slug → `<a target="_blank">`). Se a duplicação ficar grande, essa decisão pode ir para um helper.

### D4. O "View product" é um falso botão animado pelo cartão
Não pode haver um `<a>` dentro de um `<a>`. Por isso, o "View product" é um `<span aria-hidden="true">` com o aspecto do `Button` escuro (preenchimento, troca de texto e seta). As animações do `Button` usam `group-hover`, por isso o cartão é o `group`. Se o `Button` não puder renderizar um `span` sem `href` (o `asChild` desliga o `swap`), o falso botão replica as mesmas classes. A verificar na implementação. O nome acessível do link é o título do produto (`aria-label`).

### D5. A ficha fica com "Market"
O design mostra "Pricing: Free · Donation-supported", mas o hcms não tem esse campo. Em `hcms.paradis.host`, o `market` dos dois projectos é "Angola" (confirmado a 2026-10-31), por isso mostrá-lo com o rótulo "Pricing" seria errado. A ficha continua com Category · Market · Platform · Live at. Seguir o design precisa de um campo `pricing` nos `projects`, criado no `Template-multisite-tenant`, e fica para uma change futura.

### D6. Iniciais no testemunho sem foto
As iniciais são as primeiras letras das duas primeiras palavras do `authorName`, em maiúsculas ("Alfredo Vidinhas" → "AV"), num disco `#212528` de 56px com `aria-hidden`, porque o nome já está escrito ao lado. Com foto, a foto também tem 56px.

## Risks / Trade-offs

- [A ficha não segue o design numa entrada] → "Market" fica no lugar de "Pricing" até haver o campo (D5).
- [Mudar a estrutura do `PageHeader` pode desalinhar Products e Get Quote] → comparar as duas páginas antes e depois, em desktop e a 390px.
- [Base do spec] → o `product-detail-page` só existe no delta da `v3-product-detail`. Arquivar essa change primeiro, ou o arquivo desta não encontra os requisitos MODIFIED.
