## Context

- **Referência:** o canvas "Paradis Landing Page" (artifact `DQQj4ga6FourZQZHYjbqm3`), artboards `MainV3`, `Products`, `GetQuote` e `Product`, e a comparação de 2026-11-01 com o código.
- **Decisões do utilizador que esta change aplica:**
  - Um produto tem um só URL ao vivo, visitado só no detalhe. Os cartões fora do detalhe levam a `/products/<slug>`.
  - Os desvios assumidos ao canvas mantêm-se.
- **Estado atual:**
  - **Home:** o `Card` recebe `anchor: { label, href, newTabHint }` e renderiza sempre `<a target="_blank">` com o `project.url`. O comentário (#22) explica porquê: o destino era externo. O zoom foi tirado de propósito ("no v3 da home ela não reage ao hover"). O canvas atual tem `[data-cursor-text="Discover"]:hover .home-prod-img{transform:scale(1.065)}`.
  - **Listagem:** o `ProductCard` já faz a regra slug → `Link` interno, sem slug → `<a>` externo, com `localizedHref`.
  - **Get-quote:** o `QuoteForm` mostra `messages.success` (hcms ou o piso "Thanks — we've got your brief. We'll reply within one business day.") no `<h2>`, e `labels.successNote` ("We'll reply within one business day.") no parágrafo. A frase repete-se.
  - **Detalhe:** capa `h-85 md:h-160`, galeria `md:h-140` e `md:h-105`, `alt=""` na capa.
  - **"Next product":** `p-6 md:p-10` e `text-[40px] md:text-[56px]`.

## Goals / Non-Goals

**Goals:**
- Fechar as lacunas de página que restam depois de `v3-finish-shared`, sem tocar no hcms.

**Non-Goals:**
- Campos novos no hcms (`v3-cms-gaps`).
- Tornar o cartão inteiro da home clicável. No canvas, só o "Discover More" é link, e a capa é decoração com cursor.
- Mudar a validação ou as mensagens de erro do get-quote.

## Decisions

### D1. O `Card` da home recebe o destino já resolvido
O `anchor` ganha `external: boolean`. O `ProductsSection` resolve o destino com a mesma regra do `ProductCard`: `localizedHref(\`/products/${slug}\`, locale)` quando há slug, e `project.url` com `external: true` quando não há. O `Card` renderiza `next/link` no caso interno e o `<a target="_blank">` atual no externo, e o `newTabHint` só entra no externo.
- *Alternativa:* passar o `Project` ao `Card`. Rejeitada: o `Card` é apresentacional e não conhece o domínio. A regra vive em quem chama, como hoje vivem o rótulo e o cursor.
- O comentário #22 passa a explicar os dois casos.

### D2. O zoom da home é por `group` na capa
A capa ganha `group/cover`, e a imagem `transition-transform duration-500 ease-[ease] group-hover/cover:scale-[1.065] motion-reduce:transition-none motion-reduce:group-hover/cover:scale-100`. O gatilho é a capa e não o cartão inteiro, como no canvas (`[data-cursor-text]:hover`). O `overflow-hidden` que a capa já tem recorta o zoom.

### D3. Título de sucesso como cópia de UI, parágrafo do hcms
- O `FALLBACK` do `GetQuote` troca `successNote` por `successTitle` ("Thanks — your enquiry is in." / "Obrigado — o seu pedido chegou."). É cópia de UI, como "Send another", e fica em `Record<Locale, …>`.
- O piso de `QUOTE_MESSAGE_FALLBACK.success` passa à frase curta ("We'll reply within one business day." / "Respondemos dentro de um dia útil."). O `QuoteForm` mostra `labels.successTitle` no `<h2>` e `messages.success` no `<p>`.
- *Alternativa:* um campo de título no hcms. Rejeitada aqui: é um campo novo de schema, e fica para `v3-cms-gaps`.
- *Alternativa:* ignorar a mensagem do hcms e fixar o parágrafo. Rejeitada: a mensagem `success` é authorada no hcms, e perdê-la tirava ao editor uma palavra que hoje tem.
- *Consequência:* se o hcms tiver o texto antigo ("Thanks — we've got your brief…"), o "Thanks" aparece no título e no parágrafo. Resolve-se encurtando o texto no hcms, uma tarefa de conteúdo.

### D4. Medidas por classes, sem tokens novos
- Capa `md:h-190`; galeria `md:h-180` e `md:h-115`.
- Título do cartão da listagem `text-4xl` (36px) sem variante.
- "Next product": `p-10` e `text-[56px]` sem variante. A 390px, com 8px de margem da página, 20px de `gutter` e 40px de padding, sobram cerca de 260px para o título. "Génesis Sport Club" quebra em três linhas e "Kitenda" cabe numa. Verifica-se que nenhuma palavra sozinha passa a largura. Se passar, `break-words` no `<h3>`.
- O `alt` da capa passa a `product.coverImage.alt ?? ""`.

### D5. Pisos de cópia
"Reach Us Directly" → "Reach us directly" (`QuoteContactAside`), e "Paradis.Labs - All rights reserved." → "Paradis Labs - All rights reserved." (`Footer`). Só se veem com o campo do hcms vazio.

## Risks / Trade-offs

- **Texto antigo de sucesso no hcms** → aparece o "Thanks" duas vezes até um editor o encurtar. Fica uma tarefa de conteúdo.
- **Título de 56px no telefone** → linhas grandes no "Next product". É o que o artboard desenha, e a quebra verifica-se a 390px (D4).
- **Os cartões da home deixam de abrir o site externo** → quem procurava o site ao vivo passa pelo detalhe, que tem o "Visit" no topo. É a decisão de produto.

## Migration Plan

Sem migração de dados. Depois do deploy, um editor revê a mensagem `success` do formulário `quote_request` no hcms (en e pt). O rollback é reverter o merge.

## Open Questions

- A tradução portuguesa do título de sucesso ("Obrigado — o seu pedido chegou.") precisa de aprovação?
