## Why

O painel escuro da home tem três cabeçalhos (Services, Products, Testimonials) que hoje só fazem a revelação de disparo único. O título do about, logo acima, já acende letra a letra com o scroll (`LitText`, de `v3-scroll-lit-text`). Pediu-se o mesmo efeito, de cinzento para branco, nos cabeçalhos do painel, para a leitura do painel seguir o ritmo do about.

O mockup (`MainV3.dc.html:353-354`) não tem o efeito nestes cabeçalhos: é uma decisão de produto que vai além do canvas, e o non-goal "o efeito noutros textos além dos três do mockup" de `v3-scroll-lit-text` deixa de valer para estes alvos.

## What Changes

- **O título e o subtítulo do `SectionHeading` acendem letra a letra**, com o `LitText tone="dark"` como está: cada letra vai de branco a 22% para branco a 100%, no intervalo de scroll do about (topo a 85% → fundo a 35%). Cada um tem o seu intervalo, por isso o subtítulo acende em cascata depois do título.
- **Aplica-se aos três cabeçalhos** que usam o `SectionHeading`: Services, Products e Testimonials.
- **BREAKING** (visual): o subtítulo deixa de repousar a branco a 64%. No fim do efeito, e sem suporte ou com movimento reduzido, fica a branco a 100%, como o título.
- A pill e o CTA opcional (o "View All" de Products) não mudam, nem a revelação de disparo único do bloco.

## Capabilities

### New Capabilities
- `section-heading-lit-text`: os cabeçalhos do painel escuro acendem letra a letra (alvos, cor inicial e final, ordem título → subtítulo, comportamento sem suporte e com movimento reduzido, convivência com a revelação do bloco).

### Modified Capabilities
(nenhuma nas specs principais. O efeito em si é definido por `scroll-lit-text`, num delta de `v3-scroll-lit-text` ainda por arquivar; este change reutiliza-o sem mudar os seus requisitos.)

## Impact

- **Código:** `src/components/SectionHeading/index.tsx` (título e subtítulo passam a `LitText tone="dark"`). `LitText` e `.lit` em `globals.css` não mudam.
- **Chamadores:** `ServicesSection`, `ProductsSection` e `TestimonialsSection`, sem alterações.
- **DOM:** cerca de um `<span>` por carácter, mais um por palavra. Com os textos actuais são umas centenas de nós nos três cabeçalhos, sem JavaScript nem trabalho por frame.
- **Browsers:** como o `scroll-lit-text`: Chrome, Edge e Safari recentes animam, e o Firefox mostra o texto a 100%, estático.
- **Depende de** `v3-scroll-lit-text` (o `LitText` e o `.lit` já estão no código).
