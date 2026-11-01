## Why

O efeito de texto que acende letra a letra, de cinzento para a cor final, está hoje em quatro sítios da home: o título do about e os três cabeçalhos do painel escuro (`v3-scroll-lit-text`, `v3-section-heading-lit`). Pediu-se o mesmo efeito em todos os títulos e subtítulos do site, incluindo as páginas interiores: Products, Get Quote e o detalhe de produto.

Há um obstáculo: o cabeçalho dessas páginas (o `PageHeader`) está acima da dobra. Com o efeito ligado ao scroll, a página abriria com o título principal meio cinzento, numa proporção que depende da altura do ecrã, e esse título é o LCP. Por isso este change acrescenta ao `LitText` um modo de entrada que corre ao carregar a página, com o mesmo aspecto letra a letra.

## What Changes

- **Novo modo `enter` no `LitText`.** As letras acendem uma vez, em sequência, quando a página carrega. A animação é CSS com atraso por letra e não está ligada ao scroll. O modo actual, ligado ao scroll, passa a chamar-se `scroll` e continua a ser o padrão.
- **O `LitText` aceita segmentos**, cada um com a sua classe, e o índice das letras continua de um segmento para o seguinte. Assim um texto em duas cores, como o lead do `PageHeader`, acende como uma só frase sem perder as cores.
- **O `LitText` aceita `tone="inherit"`.** Neste tom não impõe cor e herda a do pai. É o que permite manter os subtítulos no tom actual e testar o efeito sobre o `gradient-text`.
- **`PageHeader` (Products, Get Quote, detalhe de produto):** o lead acende em modo `enter`, depois da entrada `data-enter` que já existe. O H1 fica como está: verificou-se que o texto em gradiente ignora a opacidade das letras (design, D4).
- **Get Quote:** o título e o subtítulo do cartão do formulário acendem em modo `enter`, depois do lead, porque no desktop já estão na dobra (design, D5).
- **Detalhe de produto:** o título "Next product" acende com o scroll. O Challenge e o Solution já acendiam.
- **A home fica completa:** o subtítulo do about e o título e o subtítulo do FAQ acendem com o scroll.
- **Os subtítulos novos mantêm a cor actual** (`muted-foreground`, `#5b656a`, `mist`): o efeito só anima a opacidade. O `SectionHeading` continua como está, a branco a 100%.
- **Ficam de fora:** o H1 do Hero da home, os títulos de cartões (`ProductCard`, `NextProductCard`, passos do detalhe, `Card`), as pills e os eyebrows, os rótulos do aside do Get Quote, a mensagem de sucesso do formulário e o CTA do footer.

## Capabilities

### New Capabilities
- `site-wide-lit-headings`: que títulos e subtítulos acendem em cada página, em que modo (`scroll` ou `enter`), com que cor final, e o que fica de fora.
- `lit-text-enter-mode`: o modo de entrada do `LitText`, com a ordem das letras, o tempo, o encadeamento com o `data-enter`, o comportamento com movimento reduzido e sem CSS, o texto em segmentos e o `tone="inherit"`.

### Modified Capabilities
(nenhuma nas specs principais. O efeito de scroll em si, `scroll-lit-text`, é um delta de `v3-scroll-lit-text` ainda por arquivar, e não muda: os alvos novos em modo `scroll` usam-no tal como está.)

## Impact

- **Código:** `src/components/LitText/index.tsx` (modo, segmentos e tom), o `.lit` em `src/app/(app)/globals.css` (regras do modo `enter`), `PageHeader`, `GetQuote/QuoteForm.tsx` (client component; o `LitText` não usa hooks e pode ser renderizado lá), `ProductDetail`, `FAQSection` e `src/app/(app)/[locale]/(pages)/page.tsx` (subtítulo do about).
- **LCP:** o texto em modo `enter` começa a 22% e não a 0, por isso é pintado no primeiro frame. O H1 não muda. O modo `enter` não acrescenta JavaScript.
- **Browsers:** no modo `enter` o efeito corre em todos os browsers, incluindo o Firefox, porque é uma animação CSS normal. No modo `scroll` mantém-se o comportamento do `scroll-lit-text`.
- **DOM:** cerca de um `<span>` por carácter, como nos alvos que já existem. O lead do `PageHeader` soma umas 150 letras por página.
- **Depende de** `v3-scroll-lit-text` e `v3-section-heading-lit`, cujo `LitText` e `.lit` já estão no código.
