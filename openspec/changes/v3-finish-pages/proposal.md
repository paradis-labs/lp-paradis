## Why

Depois de `v3-finish-shared`, o que separa o site do canvas do v3 (artifact "Paradis Landing Page") são lacunas presas a uma página. A mais visível: os cartões de produto da home abrem o site externo, quando o canvas e a decisão de 2026-11-01 pedem que o site ao vivo só se visite a partir do detalhe. Somam-se o ecrã de sucesso do get-quote, que repete uma frase e não tem o título do design, e as alturas da capa e da galeria do detalhe, que ficaram abaixo do artboard.

## What Changes

- **Home, produtos:**
  - Cada cartão leva a `/products/<slug>` pelo link "Discover More", no mesmo separador, com o mesmo fallback do cartão da listagem: sem slug, o site externo num novo separador.
  - A capa ganha o zoom do canvas: escala 1,065 em 0,5 s com o rato sobre a capa, e sem zoom com movimento reduzido.
- **Listagem:** o título do cartão fica em 36px em todas as larguras (hoje 30px abaixo de 768px).
- **Get-quote, sucesso:**
  - Título fixo do design: "Thanks — your enquiry is in." / "Obrigado — o seu pedido chegou.".
  - Por baixo, um só parágrafo: a mensagem `success` do hcms, ou o piso "We'll reply within one business day.". Acaba a frase repetida.
- **Get-quote, aside:** o piso do título passa a "Reach us directly", em sentence case como no canvas.
- **Detalhe:**
  - Capa com 760px a partir de 768px (hoje 640px).
  - Galeria com 720px no primeiro plano e 460px nos outros (hoje 560/420px).
  - A capa usa o `alt` do media em vez de `alt=""`.
- **"Next product":** o título fica em 56px e o padding em 40px em todas as larguras, como no artboard (hoje 40px e 24px abaixo de 768px).
- **Footer:** o piso do copyright em inglês passa a "Paradis Labs - All rights reserved." (hoje "Paradis.Labs").
- **Fora do âmbito:**
  - Campos novos no hcms (ícones dos passos, nome curto do "Visit", poster do vídeo, textos do cartão do formulário): ficam para `v3-cms-gaps`.
  - Os desvios assumidos ao canvas.
  - A ordem do "Next product", que continua a ser a da lista.

## Capabilities

### New Capabilities
- `v3-page-finish`: os acertos por página ao canvas do v3: destino e hover dos cartões da home, título do cartão da listagem, ecrã de sucesso e aside do get-quote, medidas do detalhe e do "Next product", e o piso do copyright.

### Modified Capabilities
(nenhuma: os specs da listagem, do detalhe e do get-quote do v3 ainda vivem nas suas changes por arquivar, e o `get-quote-page` de `openspec/specs/` não cobre o ecrã de sucesso)

## Impact

- **Código:**
  - `src/components/Card/` e `ProductsSection/` (home)
  - `ProductCard/`
  - `GetQuote/` (`index.tsx`, `QuoteForm.tsx`, `QuoteContactAside.tsx`) e `src/lib/quote-request.ts` (piso da mensagem de sucesso)
  - `ProductDetail/` e `NextProductCard/`
  - `Footer/`
- **Conteúdo:** se a mensagem `success` do hcms ainda tiver o texto antigo ("Thanks — we've got your brief…"), o "Thanks" aparece no título e no parágrafo. Um editor encurta-a para a segunda frase. É edição de conteúdo, não de schema.
- **Sem impacto** no cache, nos tipos de conteúdo ou no hcms.
- **Depende de** `v3-finish-shared` (token `cover-ground`, `gutter`, glifos).
