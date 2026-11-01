## 1. Botão

- [x] 1.1 Em `src/components/Button/index.tsx`, acrescentar `cursor: "light" | "dark"` ao tipo `SwapInvert`, com um comentário a dizer que é o tom **sobre o painel** (D1)
- [x] 1.2 Preencher `cursor` em cada entrada de `swapInvert`: `primary` → `dark`, `outline` → `light`, `inverted` → `light`, `outline-inverted` → `dark`, `pill` → `light`; `link` e `icon` repetem o tom de `CURSOR_TONE`
- [x] 1.3 Trocar o atributo do `Comp` para `data-cursor-tone={swap ? swapInvert[v].cursor : CURSOR_TONE[v]}` e actualizar o comentário de `CURSOR_TONE`, que passa a ser só o tom de repouso
- [x] 1.4 Confirmar que tirar o campo `cursor` de uma entrada faz `npm run build` falhar na verificação de tipos, e depois repor o campo

## 2. Pills de interesse

- [x] 2.1 Em `src/components/GetQuote/QuoteForm.tsx`, dar às pills `data-cursor-tone={isSelected ? "light" : "dark"}` (D2)

## 3. Cursor

- [x] 3.1 Em `src/components/Cursor/Cursor.tsx`, extrair a resolução de modo, tom e texto do `onOver` para uma função que recebe o alvo, e guardar o último alvo
- [x] 3.2 Acrescentar um listener `click` passivo no `document` que reavalia o último alvo num `requestAnimationFrame` sem reagendamento, e removê-lo no cleanup (D3)
- [x] 3.3 Em `src/app/(app)/globals.css`, dar a `.cursor-dot[data-mode="button"]::before` a transição com `background-color 0.5s var(--ease-fill)`, mantendo `transform` e `opacity` como estão (D4)

## 4. Verificação

- [ ] 4.1 No `npm run dev`, em `/en/fixtures/buttons`, passar o ponteiro pelas cinco variantes com `textSwap` (`<button>` e `href`): o disco vê-se sempre depois de o painel subir
- [ ] 4.2 Na mesma fixture, confirmar que os botões sem `textSwap` mantêm o tom de hoje
- [ ] 4.3 Confirmar a cor do disco a meio da subida num `outline`: muda ao ritmo do painel e não salta à entrada
- [ ] 4.4 Em `/en/get-quote`, clicar numa pill sem mexer o rato: o cursor passa a claro, e volta a escuro ao clicar de novo
- [ ] 4.5 Verificar os CTAs reais: header, hero, footer, `ProductsSection`, `ProductDetail` e o submit do quote
- [ ] 4.6 No painel Performance, com o rato parado sobre um botão, confirmar que não há rAF a correr
- [x] 4.7 `npm run lint` (os ficheiros da change passam; os 5 erros que restam são de `src/components/ui/`, que já existiam)
