## Why

O cursor do v3 escolhe a cor pelo `data-cursor-tone` do botão, e o `CURSOR_TONE` (`src/components/Button/index.tsx`) declara o tom pelo **repouso** da variante. Com `textSwap`, o botão inverte no hover: sobe um painel da cor contrária, e o disco do cursor (sólido, modo `button`) fica da mesma cor desse painel e desaparece. Acontece nas cinco variantes que invertem (`primary`, `outline`, `inverted`, `outline-inverted`, `pill`), justamente nos CTAs que mais devem chamar a atenção. As pills de interesse do `/get-quote` têm a mesma falha quando estão seleccionadas: são `<button>` crus, sem tom, e uma pill seleccionada é `bg-primary`.

## What Changes

- O tom do cursor sobre um `Button` com `textSwap` passa a ser o **contrário da cor do painel de hover**: claro sobre painel escuro, escuro sobre painel claro. Sem `textSwap`, o tom continua o do repouso, porque nesse caso o hover só esbate o fundo.
- O tom do cursor sai da mesma tabela exaustiva que já define as camadas da inversão (`swapInvert`): uma variante nova sem tom de cursor deixa de compilar, como já acontece com as outras camadas.
- As pills de interesse do `QuoteForm` declaram o tom pelo estado: escuro quando não estão seleccionadas, claro quando estão (`aria-pressed`).
- A mudança de cor do cursor em modo `button` passa a acompanhar a subida do painel (500 ms, `--ease-fill`) e não a transição genérica de 0,25 s. Assim nenhum instante intermédio deixa o disco da cor da superfície que está por baixo.
- Não mudam: as formas e os tamanhos dos modos do cursor, o modo `text` das capas, o tom `light` declarado pelas secções escuras, e o loop sem rAF em repouso.

## Capabilities

### New Capabilities
- `cursor-hover-tone`: o cursor personalizado mantém contraste com a cor que o elemento sob ele ganha no hover ou no estado seleccionado, e muda de cor ao ritmo da inversão.

### Modified Capabilities
<!-- Nenhuma: `button-hover-inversion` define as camadas do botão, não o cursor; este requisito soma-se ao lado dele sem alterar nenhum cenário existente. -->

## Impact

- **Código**: `src/components/Button/index.tsx` (tom do cursor por variante e por `swap`), `src/components/GetQuote/QuoteForm.tsx` (tom das pills), `src/app/(app)/globals.css` (transição do `.cursor-dot` em modo `button`), `src/components/Cursor/Cursor.tsx` só se o modo precisar de ser exposto de outra forma (ver design).
- **Verificação**: a fixture `/[locale]/fixtures/buttons`, que já mostra todas as variantes com e sem `textSwap`.
- **Sem mudanças** em conteúdo, hcms, dependências ou no custo de runtime do cursor (`idle-runtime-budget`, `scroll-frame-budget`).
- **Fora do âmbito**: dar mais destaque ao modo `link` (disco a 16 %) e o `FakeButton` do `NextProductCard`. Este último inverte no hover do cartão inteiro, e o cursor sobre ele está em modo `link` (escuro esbatido sobre o painel branco), que se vê.
