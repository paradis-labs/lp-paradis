## 1. Efeito letra a letra

- [x] 1.1 `globals.css`: `.lit` (host com `view-timeline-name`, `--n`, `--start`, `--span`), `.lit-c` com `lit-in` e `animation-range` desfasado por `--i`, tudo dentro de `@supports (animation-timeline: view())` e `no-preference`; tirar `.sweep`, `.sweep-host` e `.sweep-dark`
- [x] 1.2 Componente server `LitText` (`tone: "light" | "dark"`): `sr-only` com a frase, palavras `whitespace-nowrap`, letras `aria-hidden` com `--i`
- [x] 1.3 Home: o título do about usa `LitText`
- [x] 1.4 `ProductDetail`: desafio e solução usam `LitText tone="dark"`
- [x] 1.5 Afinar `--start`/`--span` lado a lado com o mockup (export servido localmente) nos três alvos, a 1440px e a 390px

## 2. Cartões de características

- [x] 2.1 `types.ts`: `ProductIcon` (`swap`, `trend`, `shield`, `calculator`, `globe`, `clock`) e `ProductStep.icon: ProductIcon | null`
- [x] 2.2 `providers/hcms.ts`: ler `steps[].icon`, com valor fora da lista → `null`
- [x] 2.3 `ProductDetail`: cartões com ícone (SVG inline, lista fechada) e título numa linha, texto por baixo, sem número, uma coluna abaixo de 1024px
- [x] 2.4 `PageHeader` `titleSize="xl"`: 88 / 56 / 40px

## 3. Deltas anteriores

- [x] 3.1 `v3-home-reskin`, delta `scroll-reveal-animations`: o requisito do sweep passa a remeter para `scroll-lit-text`
- [x] 3.2 `v3-product-detail`, delta `product-detail-page`: "os passos numerados" passa a "as características" (`product-feature-cards`)

## 4. Verificação

- [x] 4.1 Chrome: o efeito corre nos três alvos e coincide com o mockup no início e no fim
- [x] 4.2 Sem JavaScript, e com `prefers-reduced-motion`: o texto a 100%
- [x] 4.3 Leitor de ecrã (árvore de acessibilidade): a frase aparece uma vez
- [x] 4.4 `/en/products/kitenda` com os ícones e o texto novos depois do `seed-paradis-v3-features` em prd
- [x] 4.5 `npm run lint` e `npm run build`

## Notas da aplicação

- 1.5: sem afinação, os valores são exactos (design, D2). O painel escuro passou de `overflow-hidden` a `overflow-clip`, que prendia o `view-timeline`.
- Alinhado com o mockup ao verificar: título dos cartões 17/24 (a spec dizia 18px), texto grande do painel 44 / 36 / 28px, e os factos do topo em 4 / 2 / 1 colunas (a 390px o link "Live at" saía 3px da viewport).
- 4.2: sem JavaScript, o HTML prerenderizado já tem as letras e a frase em `sr-only`; o movimento reduzido verificou-se pelo CSS compilado (a animação só existe dentro de `@supports` + `no-preference`), porque o browser de teste não emula a preferência.
