## 1. Home: cartões de produto

- [x] 1.1 `Card`: `anchor.external`; `next/link` no caso interno, o `<a target="_blank">` atual no externo, `newTabHint` só no externo; reescrever o comentário #22
- [x] 1.2 `ProductsSection`: resolver o destino como o `ProductCard` (slug → `localizedHref("/products/<slug>")`, sem slug → `project.url` externo)
- [x] 1.3 `Card`: zoom da capa com `group/cover` (1,065, 0,5 s, `ease`) e sem zoom com movimento reduzido; tirar o comentário que dizia que a capa não reage

## 2. Listagem

- [x] 2.1 `ProductCard`: título em `text-4xl` em todas as larguras

## 3. Get-quote

- [x] 3.1 `GetQuote/index.tsx`: `successNote` dá lugar a `successTitle` (en/pt) no `FALLBACK` e nas labels passadas ao formulário
- [x] 3.2 `quote-request.ts`: o piso de `success` passa à frase curta (en/pt)
- [x] 3.3 `QuoteForm`: `<h2>` com `labels.successTitle`, `<p>` com `messages.success`
- [x] 3.4 `QuoteContactAside`: piso "Reach us directly"
- [x] 3.5 Fixture `fixtures/get-quote`: confirmar que o estado de sucesso mostra título e parágrafo sem repetição (a mensagem authorada da fixture passou à frase curta, e o título do aside a sentence case)

## 4. Detalhe

- [x] 4.1 `ProductDetail`: capa `md:h-190`, galeria `md:h-180` / `md:h-115`
- [x] 4.2 `ProductDetail`: `alt` da capa a partir de `coverImage.alt`
- [x] 4.3 `NextProductCard`: `p-10` e título `text-[56px]` em todas as larguras; confirmar a quebra a 390px (`break-words` se preciso)

## 5. Footer

- [x] 5.1 Piso do copyright em `en`: "Paradis Labs - All rights reserved."

## 6. Conteúdo (edição no hcms, não schema)

- [ ] 6.1 Pedir a um editor que reveja a mensagem `success` do formulário `quote_request` em en e pt, para não repetir o "Thanks" do título
- [ ] 6.2 Pedir a um editor que aponte a coluna "Products" do footer (`footer_columns`) para `/products/<slug>`: hoje leva a `kitenda.ao` e `fichasegura.ao`, e o site ao vivo só se deve visitar a partir do detalhe

## 7. Verificação

- [x] 7.1 Home: "Discover More" leva a `/en/products/<slug>` no mesmo separador; um projeto sem slug abre noutro separador; zoom na capa e nada com movimento reduzido
- [x] 7.2 Get-quote: ecrã de sucesso (fixture) em en e pt sem frase repetida
- [x] 7.3 Detalhe a 1440 e 390px: alturas da capa e da galeria, "Next product" sem overflow
- [x] 7.4 `npm run lint` (só os 5 erros que já existiam em `src/components/ui/`) e `npm run build`
