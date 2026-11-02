## Why

Oito issues abertos (#13, #16, #17, #18, #19, #20, #21, #22) não dependem do CMS, ou dependem dele só através de valores que não mudam com o provider. Não há razão para esperarem pela migração Payload → Directus, e fazê-los antes evita que a fase 0 da migração tenha de os carregar consigo. Ficam juntos numa change por serem a "onda 0" do roadmap `migrate-cms-to-directus`, mas cada grupo abaixo entra num PR próprio.

## What Changes

**Navegação e performance**
- **#13** — `localizedHref` deixa de acrescentar a barra entre o locale e um href de raiz com âncora ou query: `/#about-us` passa a `/en#about-us` em vez de `/en/#about-us`. O link "About" volta a funcionar a partir de `/get-quote`. Só se o diagnóstico o justificar: o scroll para a âncora depois de uma navegação de rota passa pelo Lenis.
- **#16** — `LocaleSwitch` deixa de forçar renderização no cliente de todas as rotas: `useSearchParams` passa a estar dentro de um `<Suspense>` com fallback de dimensões iguais ao botão.
- **#17** — `loading.tsx` no grupo `(pages)` e uma barra de progresso fina, acima do navbar, visível enquanto uma navegação está pendente.

**`/get-quote`** (em série, porque os três mexem em `QuoteForm.tsx`: #19 → #18 → #20)
- **#19** — o botão de submeter perde o `border-2` estático; o `ShineBorder` passa a ser o único aro animado.
- **#18** — as pills de interesse passam a usar uma variante `pill` do `Button`, com a animação de `textSwap`. A tabela `swapInvert` passa a ser exaustiva por tipo, como o comentário dela já promete.
- **#20** — `Reveal` no cabeçalho da página e no bloco do formulário, sem esconder campos individuais.

**Footer e cards**
- **#21** — o gutter lateral do footer passa de `px-4` a uma escala responsiva alinhada com as secções, definida num só sítio.
- **#22 (opção A)** — o "Discover More" dos cards de projeto passa a abrir sempre em nova aba, com `rel="noopener noreferrer"`, como `<a>` em vez de `next/link`. A opção B (campo `openInNewTab` authorável) fica fora: o modelo de projetos do hcms não tem esse campo (ver `cms-phase-1-hcms-alignment`).

## Capabilities

### New Capabilities

- `navigation-progress-feedback`: fallback de rota com `loading.tsx` e barra de progresso de navegação acima do navbar.
- `project-card-links`: destino, aba e `rel` do link dos cards de projeto.

### Modified Capabilities

- `navbar-link-destinations`: o href de uma âncora ou query na raiz deixa de ganhar a barra entre o locale e o resto (`/pt#services`, não `/pt/#services`).
- `navbar-locale-switch`: o switch não pode forçar a renderização no cliente das rotas que o contêm.
- `button-hover-inversion`: nova variante `pill` de alternância; exaustividade de `swapInvert` garantida pelo compilador; o `shine` é o único aro do botão.
- `scroll-reveal-animations`: a página `/get-quote` usa `Reveal` sem comprometer a usabilidade do formulário.
- `responsive-content-fit`: o gutter lateral do footer acompanha o das secções em ecrãs estreitos.

## Impact

- **Código:** `src/lib/locale-href.ts`, `src/components/NavBar/LocaleSwitch.tsx`, `src/components/Header/index.tsx`, `src/app/(app)/[locale]/(pages)/loading.tsx` (novo), um componente de barra de progresso (novo) no layout, `src/components/Button/index.tsx`, `src/components/GetQuote/{index,QuoteForm}.tsx`, `src/components/Footer/index.tsx`, `src/components/Card/index.tsx`.
- **Fixtures:** `fixtures/navbar` ganha o caso `/#ancora`; `fixtures/get-quote` cobre a variante `pill`.
- **Sem alterações** ao schema do Payload, aos fetchers ou a `payload-types.ts`. Esta change não colide com a fase 0a da migração.
- **#13 tem um efeito colateral:** `localizedHref` também é usado pelos CTAs (`localizedCtaHref`), que herdam a correção.
