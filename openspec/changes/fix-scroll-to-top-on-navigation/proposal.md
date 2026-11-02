## Why

Quando se navega para outra página (por exemplo, da home para `/products/<slug>` ou para `/get-quote`), a página nova não abre no topo: abre a meio, na posição de scroll da página anterior. O Next 16 não faz `scrollTo(0, 0)` na navegação. Só põe `html.scrollTop = 0` quando o primeiro elemento do segmento novo não está visível (`layout-router.js`, `handlePotentialScroll`), e esse scroll nativo é desfeito pelo Lenis. O Lenis só aceita uma posição nativa quando está parado (`lenis.mjs`, `onNativeScroll`: `isScrolling === false || "native"`). Com `lerp: 0.1`, depois da última roda ele continua em `"smooth"` durante cerca de meio segundo, e é nessa janela que normalmente se clica num link. A interpolação continua até ao `targetScroll` antigo e leva a página nova de volta para baixo. Há mais dois caminhos para o mesmo sintoma. O slot `@footer` também muda em cada navegação e pode ser o primeiro a avaliar o scroll: se o footer estiver visível, o scroll é dado como feito sem acontecer. E o primeiro nó do segmento novo (`loading.tsx` ou o `motion.div` do `template.tsx`) pode já estar dentro do viewport.

## What Changes

- Uma navegação de cliente para outra página (push, sem hash) passa a abrir sempre no topo. Deixa de depender da heurística de viewport do Next e do estado da animação do Lenis.
- O scroll para o topo passa a ser feito por quem já controla o scroll. Com o Lenis ativo, é o próprio Lenis que o faz (posição imediata e forçada), o que cancela qualquer interpolação em curso. Com `prefers-reduced-motion` (sem Lenis), é feito por scroll nativo instantâneo.
- Ficam como estão: links com âncora (`/en#services`, `#faqs`), que continuam a parar no alvo; a navegação com voltar/avançar do browser, que continua a restaurar a posição; e o scroll por âncora na mesma página.
- O condutor de frames do Lenis (`LenisFrameDriver`) e o orçamento de `scroll-frame-budget` não mudam: nenhum loop novo, nenhuma leitura de geometria em handlers de scroll.

## Capabilities

### New Capabilities
- `navigation-scroll-position`: a posição de scroll ao mudar de página. Uma navegação para uma página nova abre no topo, uma navegação para uma âncora abre no alvo e o voltar/avançar restaura a posição, com ou sem smooth scroll.

### Modified Capabilities
<!-- Nenhuma: `scroll-frame-budget` e `navbar-link-destinations` continuam válidos como estão. Esta change acrescenta um comportamento e não altera os requisitos deles. -->

## Impact

- **Código**: `src/components/SmoothScroll/index.tsx`, com um efeito cliente novo dentro do `ReactLenis` e o mesmo comportamento no ramo de reduced motion. Possivelmente um fixture dev-only em `src/app/(app)/[locale]/(pages)/fixtures/` para reproduzir o caso "clicar a meio de um scroll suave".
- **Sem mudanças** em conteúdo, hcms, leituras, rotas, `template.tsx`, `loading.tsx` ou `data-scroll-behavior="smooth"` no `<html>`.
- **Dependências**: nenhuma nova. Usa a API pública do Lenis 1.3 (`scrollTo(0, { immediate, force })`).
