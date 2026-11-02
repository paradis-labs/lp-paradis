## 1. PR A — navegação (#13, #16, #17)

- [x] 1.1 #13: estender o guard de raiz de `localizedHref` em `src/lib/locale-href.ts` para `/#…` e `/?…`, mantendo o comentário original
- [x] 1.2 #13: acrescentar os casos `/#about-us` e `/?ref=nav` à fixture `fixtures/navbar`
- [ ] 1.3 #13: verificar `/en/get-quote` → "About" chega a `#about-us`. Repetir com `prefers-reduced-motion`; só se os resultados divergirem, entregar o hash ao Lenis (`lenis.scrollTo`) depois da navegação
- [x] 1.4 #16: envolver `NavBar.LocaleSwitch` em `<Suspense>` em `src/components/Header/index.tsx`, com fallback de dimensões iguais (mesmo `Button`, locale por prop, sem `href`)
- [ ] 1.5 #16: confirmar em `npm run build` + `npm run start` que o header não tem deslocamento de layout e que o switch preserva a query string
- [x] 1.6 #17: criar `src/app/(app)/[locale]/(pages)/loading.tsx`
- [x] 1.7 #17: criar o componente de barra de progresso (store de módulo, listener de clique delegado com filtros de link interno, fim por `usePathname`) e montá-lo no layout de `[locale]` acima do header
- [ ] 1.8 #17: verificar com "Slow 4G" nos DevTools: barra em navegação interna; nada em link externo, `mailto:` e âncora na mesma página; sem animação de largura com movimento reduzido

## 2. PR B — `/get-quote` (#19 → #18 → #20, por esta ordem)

- [x] 2.1 #19: remover `className="border-2 "` do botão de submeter em `QuoteForm.tsx` e confirmar o contraste do `shineDim` em hover
- [x] 2.2 #18: tipar `swapInvert` pelas chaves de `buttonVariants` e corrigir o que o compilador apontar
- [x] 2.3 #18: acrescentar a variante `pill` a `buttonVariants` e a `swapInvert`
- [x] 2.4 #18: trocar o `<button>` das pills de interesse pela variante `pill`, mantendo `aria-pressed`, `onClick` e `data-cursor`
- [x] 2.5 #18: cobrir a variante `pill` (repouso, hover, selecionada) — na fixture `fixtures/buttons`, que é onde a spec `button-hover-inversion` já põe os estados do botão
- [x] 2.6 #20: envolver o cabeçalho de `GetQuote/index.tsx` em `Reveal` escalonado (primeiro sem atraso) e o formulário num único `Reveal`
- [ ] 2.7 #20: verificar Tab até ao último campo, erros de validação visíveis e `prefers-reduced-motion`

## 3. PR C — footer e cards (#21, #22)

- [x] 3.1 #21: extrair `FOOTER_GUTTER = "px-6 sm:px-10 lg:px-14 xl:px-0"` em `Footer/index.tsx` e aplicá-lo aos três blocos
- [ ] 3.2 #21: verificar 320, 375, 1024 e 1440px na home e na fixture `fixtures/footer`
- [x] 3.3 #22: em `Card/index.tsx`, trocar `next/link` por `<a target="_blank" rel="noopener noreferrer">` com indicação de nova aba para leitores de ecrã
- [ ] 3.4 #22: comentar no issue #22 que a opção B fica fora: o modelo de projetos do hcms não tem o campo (lacuna registada em `cms-phase-1-hcms-alignment`)

## 4. Fecho

- [ ] 4.1 `npm run lint` e `npm run build` em cada PR
- [ ] 4.2 Fechar cada issue com referência ao PR que o resolve
