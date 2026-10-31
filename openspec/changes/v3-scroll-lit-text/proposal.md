## Why

O canvas "Paradis Landing Page" tem uma versão nova (1793432751, exportada a 2026-10-31 para `openspec/design/`) que muda duas coisas já implementadas:
- **O efeito de texto com o scroll:** o sweep em gradiente deu lugar a um efeito letra a letra, ao estilo dstudio. Cada carácter vai de 22% a 100% de opacidade à medida que o bloco atravessa a viewport. Aplica-se no título do about e no desafio e na solução do painel escuro do detalhe de produto.
- **Os cartões por baixo da solução:** deixam de ser passos numerados e passam a ser características com ícone ("Both directions", "Up-to-date exchange rate", "Free and safe").

## What Changes

- **Efeito letra a letra em CSS**, ligado ao scroll (`animation-timeline: view()`). Cada letra anima a opacidade de 0,22 para 1 na sua fatia do intervalo de scroll, desfasada pela posição. O mockup faz isto em JavaScript; aqui é CSS por decisão (design, D1). **BREAKING** (visual): o sweep em gradiente sai do about e do painel do produto.
- **Partição acessível do texto:** palavras que não quebram a meio, letras `aria-hidden`, e a frase inteira numa só cópia para leitores de ecrã.
- **Cartões de características:** ícone (de uma lista fechada) e título, sem número, e o texto por baixo. Um item sem ícone mostra só o título.
- **Tamanhos do título do detalhe:** 56px abaixo de 1024px e 40px abaixo de 768px, como no canvas novo.
- **Domínio:** `ProductStep` ganha `icon: ProductIcon | null`, lido de `steps[].icon` no hcms (`seed-paradis-v3-features`, no template).

## Capabilities

### New Capabilities
- `scroll-lit-text`: o efeito letra a letra (alvos, curva de progresso, acessibilidade, comportamento sem suporte e com movimento reduzido).
- `product-feature-cards`: os cartões de características do detalhe de produto (ícone, título, texto, degradação).

### Modified Capabilities
(nenhuma nas specs principais. Os requisitos que isto substitui estão em deltas ainda por arquivar: "Título com sweep de cor ligado ao scroll" em `v3-home-reskin` e os passos numerados em `v3-product-detail`. As tarefas acertam esses deltas antes do arquivo.)

## Impact

- **Código:** `globals.css` (sai `.sweep`/`.sweep-dark`, entra `.lit`), um componente `LitText` (server), `page.tsx` da home, `ProductDetail`, `PageHeader` (tamanhos do título `xl`), `src/content/types.ts` e `providers/hcms.ts` (`steps[].icon`).
- **Depende de** o `seed-paradis-v3-features` estar aplicado em `hcms.paradis.host` para os ícones e o texto novo. O `icon` é um subcampo de um JSON (`steps`), e não um campo da colecção, por isso lê-lo antes de existir não dá 403: vem `null`, e o cartão mostra só o título.
- **Browsers:** Chrome, Edge e Safari recentes animam; o Firefox (sem `animation-timeline`) mostra o texto a 100%, estático.
