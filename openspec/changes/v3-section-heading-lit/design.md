## Context

- O `LitText` (`src/components/LitText/index.tsx`) e o `.lit` em `globals.css` existem desde `v3-scroll-lit-text`. São CSS ligado ao scroll (`view-timeline` + `animation-range` desfasado por `--i`/`--n`), partidos no servidor, sem JavaScript.
- O `SectionHeading` (`src/components/SectionHeading/index.tsx`) é o cabeçalho dos três blocos do painel escuro: `Eyebrow` + `<h2>` (`text-white`, `text-balance`) + `<p>` (`text-white/64`) + `children` opcional, tudo dentro de um `Reveal` de disparo único. Os chamadores são `ServicesSection`, `ProductsSection` (com o CTA "View All" em `children`) e `TestimonialsSection`.
- Os antepassados dos três cabeçalhos, até `.services_shape`, não têm `overflow: hidden`. O `overflow-hidden` do `TestimonialsSection` está no carrossel, que é irmão do cabeçalho e não antepassado.
- O mockup (`MainV3.dc.html:353-354`) tem estes cabeçalhos estáticos. A decisão de os acender é de produto (proposal).

## Goals / Non-Goals

**Goals:**
- O mesmo efeito do about nos títulos e subtítulos dos três cabeçalhos do painel escuro.
- Sem mudanças no `LitText`, no `.lit` nem nos chamadores.

**Non-Goals:**
- Uma opacidade inicial configurável (por exemplo, de 64% para 100%). Foi considerada e posta de lado: o pedido é o efeito do about tal como está.
- O efeito na pill, no CTA ou noutros cabeçalhos fora do `SectionHeading` (FAQ, páginas interiores).
- Um modo opt-in por chamador.

## Decisions

### D1. Sempre ligado no `SectionHeading`, sem prop
O efeito aplica-se aos três chamadores, e o `SectionHeading` só é usado no painel escuro. Uma prop `lit` ligada nos três seria configuração sem uso.
- **Alternativa:** a prop opt-in. Só valeria a pena se um chamador futuro quisesse o cabeçalho estático, e nesse caso adiciona-se.

### D2. `LitText tone="dark"` dentro do `<h2>` e do `<p>`, como no about e no ProductDetail
O `<h2>` e o `<p>` mantêm a tipografia, e o `LitText` vai dentro. O `.lit` é `display: block` e herda o `text-wrap: balance` do `<h2>`, como acontece no título do about. O `tone="dark"` põe `text-white` no host, por isso o `text-white/64` do `<p>` deixa de ter efeito e pode sair, para a classe não mentir sobre a cor.
- **Alternativa:** partir o texto à mão no `SectionHeading`. Duplicaria a partição acessível que o `LitText` já resolve.

### D3. Um intervalo por bloco, e não um só para o cabeçalho
Cada `LitText` é um host `.lit` com o seu `view-timeline`. O título e o subtítulo acendem por isso cada um no seu intervalo, e a sobreposição dos dois dá a cascata título → subtítulo. Um intervalo único para os dois exigiria um host que contivesse o `<h2>` e o `<p>`, com um `--i` contínuo entre eles, e mudaria o `LitText`.
- Os dois hosts declaram o mesmo nome (`--lit`). Cada `.lit-c` resolve para o antepassado mais próximo com esse nome, por isso não há conflito.

### D4. O `Reveal` fica
O `Reveal` anima a opacidade e o `transform` do bloco, e o `.lit-c` anima a opacidade de cada letra. As opacidades multiplicam-se, e um `transform` num antepassado não prende o `view-timeline`. É a mesma combinação do título do about, que está dentro de um `Reveal`.

## Risks / Trade-offs

- [Um bloco que nunca chega aos 35% fica meio aceso] → os três cabeçalhos têm o FAQ e o footer por baixo, com scroll de sobra. Verificar no Testimonials, o último, a 1440px e a 390px.
- [Nós de DOM] → cerca de um `<span>` por carácter mais um por palavra, nos três títulos e subtítulos: umas centenas de nós de texto, sem JavaScript nem trabalho por frame. O comentário do `SectionHeading` sobre o `TextReveal` referia-se a nós de animação em JS, que aqui não existem.
- [O subtítulo perde a hierarquia de cor (64% → 100%)] → aceite por decisão de produto. O tamanho (18px contra 26–36px) continua a separar título e subtítulo.
- [Um `overflow: hidden` novo num antepassado congela o efeito] → já documentado em `globals.css`. Usar `overflow-clip`.
- [Firefox sem efeito] → o texto fica a 100%, legível.

## Migration Plan

Só markup, num componente. O rollback é reverter o `SectionHeading`.
