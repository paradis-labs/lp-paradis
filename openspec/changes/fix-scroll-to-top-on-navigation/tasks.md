## 1. Reprodução

- [x] 1.1 No dev server, reproduzir e registar qual hipótese do `design.md` se confirma: (A) clicar durante um scroll suave, (B) clicar num link do footer com o footer visível, (C) clicar a meio de uma página depois de o scroll assentar

## 2. Componente

- [x] 2.1 Criar `ScrollToTopOnNavigate` em `src/components/SmoothScroll/` (cliente, devolve `null`): observa `usePathname()`, ignora a primeira montagem, ignora quando `window.location.hash` não está vazio, e consome uma marca de `popstate` registada num `ref`
- [x] 2.2 No scroll: `lenis.scrollTo(0, { immediate: true, force: true })` quando `useLenis()` existe, senão `window.scrollTo({ top: 0, behavior: "instant" })`
- [x] 2.3 Renderizá-lo nos dois ramos de `SmoothScroll`, na mesma posição (dentro do `ReactLenis` e no fragmento de reduced motion), e atualizar o comentário da exceção de hidratação para dizer que os dois braços continuam a emitir o mesmo DOM

## 3. Verificação

- [ ] 3.1 Cenários de "abre no topo" da spec: clique depois de o scroll assentar, durante um scroll suave, no footer e no menu mobile (390px)
- [ ] 3.2 Com `prefers-reduced-motion: reduce` emulado no DevTools: navegar a meio de uma página abre no topo, sem animação
- [x] 3.3 Âncoras: `/en/products/<slug>` → `/en#services` para na secção, e `#faqs` na home continua suave
- [x] 3.4 Voltar/avançar não força o topo. Registar se o Lenis perturba a restauração (fora do âmbito, mas anotar)
- [ ] 3.5 Trocar de idioma vai para o topo. Confirmar com o utilizador que é o comportamento pretendido (Open Questions)
- [ ] 3.6 Trace de performance com a página ociosa: nenhum trabalho novo, e o `LenisFrameDriver` continua a adormecer
- [ ] 3.7 `npm run lint` e `npm run build` sem erros

## Notas da verificação (2026-10-31, dev server, Chrome desktop)

- 1.1: só a hipótese A se reproduz. Rodas sintéticas seguidas de clique no header levaram `/en/get-quote` a abrir em `scrollY = 1085`. O clique depois de o scroll assentar (C) e o link do footer (B) já abriam em 0.
- 3.1: os cenários de desktop passam: parado, durante o scroll suave (`get-quote` e `products` em 0) e footer. O menu mobile a 390px ainda não foi testado.
- 3.3: `/en/get-quote` → `/en#about-us` para no alvo (`top = 96`). `#services` na home faz scroll suave até `top = 96`.
- 3.4: voltar de `/en/products` restaurou a home na posição deixada (1409 → 1421), e avançar abriu em 0. O Lenis não perturbou a restauração.
- 3.5: `/en` a 900px → `/pt` abre em 0. Falta a decisão do utilizador.
- 3.6: verificado só por leitura do código, sem trace. O único listener novo é `popstate`, e não há `scroll`, rAF nem leitura de geometria.
- 3.7: o `npm run build` passa. O `npm run lint` acusa 5 erros em `src/components/ui/` (`grid-pattern`, `marquee`, `scroll-based-velocity`), em ficheiros que esta change não toca. O `SmoothScroll` passa.
