## Context

- O `LitText` (`src/components/LitText/index.tsx`) parte uma string no servidor, com uma palavra por `nowrap` e uma letra por `.lit-c` com `--i`. A frase vai uma vez em `sr-only`. O `.lit` (`globals.css:749`) liga cada letra a um `view-timeline` com o intervalo do mockup (topo a 85% → fundo a 35%) e anima `opacity` de 0.22 para 1, só dentro de `@supports (animation-timeline: view())` + `no-preference`.
- Hoje está em quatro alvos: o título do about, os três `SectionHeading` e o Challenge/Solution do detalhe de produto.
- O `PageHeader` está no topo das três páginas interiores. O H1 tem `gradient-text` (o fundo do H1 recortado pelo texto, com `color: transparent`, e `.gradient-text > *` repõe `color: var(--foreground)` nos filhos directos) e `data-enter="solid"` com `--enter-delay: 0.5s`. O lead tem `data-enter` com `0.6s` e duas cores (`splitLead`).
- O `data-enter` é uma animação CSS de 1s (`enter-up`/`enter-up-solid`) dentro de `no-preference`, sem JavaScript.
- O cartão do formulário do Get Quote fica logo abaixo do `PageHeader`. A 1440×900 o título do cartão fica por volta de y ≈ 640, acima dos 85% (765px).

## Goals / Non-Goals

**Goals:**
- O efeito em todos os títulos e subtítulos de secção do site, nas páginas interiores e no que falta da home.
- Um cabeçalho acima da dobra que acende ao carregar e não fica meio cinzento à espera de scroll.
- Manter as cores actuais dos subtítulos e o gradiente do H1.

**Non-Goals:**
- Títulos de cartões, pills, rótulos, a mensagem de sucesso e o CTA do footer.
- O H1 do Hero da home. Tem a sua própria entrada e não foi pedido.
- Mudar o `SectionHeading` (a branco a 100%) ou o intervalo do modo `scroll`.
- Um modo automático que escolha `scroll` ou `enter` conforme o bloco estiver ou não visível ao carregar. Exigiria JavaScript e dá resultados diferentes por ecrã.

## Decisions

### D1. Modo `enter` em CSS, com o atraso calculado a partir de `--i`/`--n`
A regra fica em `globals.css` ao lado do `.lit`:

```css
@media (prefers-reduced-motion: no-preference) {
  .lit[data-mode="enter"] .lit-c {
    animation: lit-in 0.5s linear both;
    animation-delay: calc(var(--lit-delay, 0s) + var(--lit-span, 1s) * var(--i) / var(--n));
  }
}
```

Fica fora do `@supports (animation-timeline)`, porque não precisa dele. O `.lit` em modo `enter` não declara `view-timeline-name`. O `LitText` recebe `mode`, `delay` e `span`, e escreve `data-mode`, `--lit-delay` e `--lit-span` no host. Os valores exactos (0.5s por letra, e os `delay`/`span` de cada alvo) afinam-se na verificação.
- **Alternativa:** acender com o `Reveal`, que usa IntersectionObserver. Daria um efeito para qualquer bloco e não só para os que estão acima da dobra, mas precisa de hidratação, e o `PageHeader` é server component com entrada sem JS.
- **Alternativa:** uma `view-timeline` com um intervalo que comece em 0. Continua ligada ao scroll: sem scroll, o H1 fica parado onde estiver.

### D2. O encadeamento no `PageHeader`
O H1 começa a acender aos 0.5s, ao mesmo tempo que sobe, com `span` ≈ 0.9s, e acaba por volta de 1.9s. O lead começa a acender quando o H1 vai a meio (≈ 1.0s), com `span` ≈ 1.2s. É uma cascata como a do título e subtítulo do `SectionHeading`, mas por tempo.

### D3. Segmentos e `tone="inherit"`
`text` passa a aceitar `string | { text: string; className?: string }[]`. Cada segmento é um `<span>` inline com a sua classe, dentro do `aria-hidden`. Os `offsets` são calculados sobre todas as palavras de todos os segmentos, por isso `--i` é contínuo, e o `sr-only` leva a frase toda unida por espaços. O lead passa a `[{ text: leadFirst }, { text: leadRest, className: "text-mist" }]`.

`tone="inherit"` não põe nenhuma classe de cor no host. Os subtítulos novos usam-no, e o `<p>` guarda a cor (`text-muted-foreground`, `text-[#5b656a]`). Os títulos usam `tone="light"` (`text-foreground`), como o about.
- **Alternativa:** acabar os subtítulos em `foreground`, como o `SectionHeading` fez com o branco. Foi posta de lado: o pedido é o efeito, e não mudar a hierarquia de cor. O `SectionHeading` fica como está, para não reabrir essa decisão.

### D4. O H1 com gradiente decide-se numa verificação, antes de mexer no resto
Com o `LitText` dentro do H1, o host é filho directo do `.gradient-text`, por isso `.gradient-text > *` pinta-o de `foreground` sólido e o gradiente desaparece. Para o manter, o host tem de ficar transparente (`tone="inherit"` mais `color: transparent` no host, ou mudar a regra `> *` para excluir `.lit`), para o texto ser pintado pelo fundo recortado do H1. A dúvida é se a `opacity` de cada `.lit-c` esbate o recorte do `background-clip: text` do pai. Não é certo que esbata, e o comportamento pode variar entre Chrome, Safari e Firefox.

**Resultado:** no Chrome o gradiente não muda com as letras a 0.05 de opacidade, por isso o H1 fica estático e só o lead acende.

A primeira tarefa é verificar isto no Chrome, no Safari e no Firefox. Se as letras esbaterem com o gradiente visível nos três, o H1 acende. Se não, o H1 fica como está (gradiente mais `data-enter="solid"`) e só o lead acende. Perder o gradiente para ter o efeito foi considerado e posto de lado, porque o gradiente é a assinatura dos títulos do v3.

### D5. O título do formulário do Get Quote: começou em `scroll` e passou a `enter`

**Resultado:** em modo `scroll`, a 1456×962 o título abria com 8 das 22 letras acesas. Passou para `enter`, com o título a começar aos 1.4s e o subtítulo aos 1.8s, depois do lead. O raciocínio original fica abaixo.

A 1440×900 o título do cartão começa por volta de 25% do intervalo quando a página carrega, ou seja, com o primeiro quarto das letras aceso. Em ecrãs mais baixos e no telemóvel está abaixo da dobra. Fica em `scroll`, por coerência com o resto do conteúdo abaixo do header, e verifica-se como fica a 1440×900. Se o meio-aceso ao carregar parecer um defeito, há duas saídas: passar este título para `enter` (com `delay` depois do lead), ou adiantar `--start` só nesta instância.

### D6. O `LitText` dentro do `QuoteForm` (client component)
O `LitText` é um componente puro, sem hooks, por isso pode ser renderizado dentro do `QuoteForm`. O custo é a partição em `<span>` correr também no cliente para o título e o subtítulo do formulário, umas 80 letras.

## Risks / Trade-offs

- [O gradiente e a opacidade por letra não funcionam juntos] → é a tarefa 1, e o plano B é o H1 estático (D4).
- [O LCP muda] → o H1 começa a 0.22 e não a 0, por isso é pintado no primeiro frame. Confirmar no painel Performance que o LCP continua a ser o H1 e que o tempo não piora.
- [Um alvo em `scroll` não chega aos 35%] → o "Next product" fica por cima do footer, e o FAQ e o formulário também têm conteúdo por baixo. Verificar o "Next product" a 1440px e a 390px.
- [Nós de DOM no `PageHeader`] → umas 250 letras por página, só markup estático e sem trabalho por frame no modo `enter` depois de a animação acabar.
- [Encadeamento com `data-enter`] → as opacidades multiplicam-se: no lead, o fade do `data-enter` (0 → 1) multiplica-se com o 0.22 → 1 das letras. Afinar o `delay` para o lead não parecer apagado demasiado tempo.
- [`overflow: hidden` num antepassado de um alvo em `scroll`] → o FAQ, o about, o formulário e o "Next product" não o têm (nenhum dos `overflow-hidden` encontrados é antepassado deles). O `PageHeader` tem `overflow-hidden`, mas está em modo `enter`, que não usa `view-timeline`.

## Migration Plan

Só markup e CSS. O rollback é reverter os componentes, e o `LitText` continua compatível com os chamadores actuais porque `mode` é `scroll` por omissão e `text` continua a aceitar uma string.

## Open Questions

- O resultado da verificação do gradiente (D4) decide se o H1 acende.
- Os tempos finais do modo `enter` (D1, D2) afinam-se a olho, na verificação.
