## Context

O cursor (`src/components/Cursor/Cursor.tsx`) resolve modo e tom no `mouseover`: o modo pelo alvo (`[data-cursor-text]` → `text`, `button`/`[data-cursor="button"]` → `button`, `a` → `link`) e o tom pelo `data-cursor-tone` do ancestral mais próximo, com `dark` por omissão. O CSS (`.cursor-dot` em `globals.css`) faz o resto: em modo `button` o disco é sólido, com 32 px (`scale(0.4)` de 80 px), e muda de cor numa transição de 0,25 s.

O `Button` escreve `data-cursor-tone={CURSOR_TONE[variant]}`, uma tabela pensada para o **repouso**. Com `textSwap`, o `swapInvert` faz subir um painel da cor contrária em 500 ms (`--ease-fill`), e o disco acaba da cor do painel:

```
 variant            CURSOR_TONE   swapInvert.fill   hover hoje
 primary            light         bg-white          branco sobre branco
 outline            dark          bg-primary        escuro sobre escuro
 inverted           dark          bg-primary        escuro sobre escuro
 outline-inverted   light         bg-white          branco sobre branco
 pill               dark          bg-primary        escuro sobre escuro
```

As pills de interesse do `QuoteForm` são `<button>` crus, sem `data-cursor-tone`, e herdam `dark`. Quando estão seleccionadas são `bg-primary`.

## Goals / Non-Goals

**Goals:**
- O disco do cursor vê-se sempre sobre o botão que está debaixo dele, depois de o botão inverter.
- A regra vive junto das outras camadas da inversão, e o compilador obriga a declará-la.
- A troca de cor acompanha o painel, como o disco do `circleIcon` já faz (`button-hover-inversion`).

**Non-Goals:**
- Mudar formas, tamanhos ou opacidades dos modos do cursor. Mais destaque no modo `link` fica para outra change.
- Mexer no `FakeButton` do `NextProductCard`: inverte no hover do cartão, e o cursor sobre ele está em modo `link`, escuro esbatido sobre o painel branco, que se vê.
- Detecção genérica da cor por baixo do cursor.

## Decisions

### D1. O tom de hover é um campo `cursor` em `swapInvert`

`SwapInvert` ganha `cursor: "light" | "dark"`, que é o tom **sobre o painel**: `primary` → `dark`, `outline` → `light`, `inverted` → `light`, `outline-inverted` → `dark`, `pill` → `light`. `link` e `icon` não têm painel (`fill` vazio), por isso o campo deles repete o tom do repouso. O `Button` escreve `data-cursor-tone={swap ? swapInvert[v].cursor : CURSOR_TONE[v]}`.

O valor do repouso basta, porque o cursor só lê o atributo quando já está por cima do botão, ou seja, em hover. Não é preciso um atributo por estado.

- *Alternativa: derivar o tom da string `fill`* (`bg-white` → `dark`). Seria uma só fonte de verdade, mas parsear classes Tailwind para tirar semântica parte à primeira classe composta (`bg-white/90`). O campo explícito, ao lado de `fill`, torna a divergência visível na revisão, e o tipo obriga a escrevê-lo.
- *Alternativa: `mix-blend-difference`.* Rejeitada antes, pelo custo de composição por frame (comentário no `Cursor.tsx`).
- *Alternativa: `getComputedStyle` no `mouseover`.* Leria o repouso, porque o painel ainda não subiu, e força o cálculo de estilos a cada mudança de alvo.

### D2. As pills cruas declaram o tom pelo `aria-pressed`

No `QuoteForm`: `data-cursor-tone={isSelected ? "light" : "dark"}`. Não têm painel de hover (o hover só muda o contorno), por isso só conta o estado seleccionado.

### D3. Reavaliar o tom depois de um clique

Clicar numa pill muda o tom sem que o ponteiro saia, e o `mouseover` não volta a disparar. O `Cursor` guarda o último alvo do `mouseover` e, num `click` (passivo, no `document`), reavalia modo e tom num `requestAnimationFrame`, depois de o React aplicar o novo `aria-pressed`. É um único `closest()` por clique, e o rAF não se reagenda.

- *Alternativa: `MutationObserver` em `data-cursor-tone`.* Um observador no documento inteiro para um caso só. Rejeitada pelo `idle-runtime-budget`.
- *Alternativa: aceitar o tom errado até o ponteiro sair.* É o caso mais visível do pedido (clicar e o cursor desaparecer), por isso não.

### D4. A transição de cor em modo `button` é a do painel

```css
.cursor-dot[data-mode="button"]::before {
  /* transform e opacity como hoje; só a cor muda de ritmo */
  transition: transform .55s var(--ease-soft), opacity .35s,
              background-color .5s var(--ease-fill);
}
```

As transições CSS usam a regra do estado **de destino**: a entrada no botão fica com 500 ms `--ease-fill`, e a saída volta aos 0,25 s, que é o que se quer, porque fora do botão já não há painel para acompanhar. Sobre botões sem `textSwap`, a cor normalmente não muda à entrada (o tom do repouso já é o da secção ou o do botão), e quando muda, 500 ms continua aceitável.

## Risks / Trade-offs

- [O painel sobe de baixo, e o disco está num ponto concreto do botão] → Mesma duração e mesma curva não sincronizam exactamente com o momento em que o painel passa sob o disco. É a mesma aproximação que o requisito do disco do `circleIcon` aceita. Para botões de 40–52 px de altura, a diferença não se vê.
- [O clique reavalia no frame seguinte; se o React demorar mais que um frame, o tom fica com o valor antigo] → Os cliques são eventos discretos, que o React aplica de forma síncrona. Se a verificação na fixture mostrar atraso, troca-se o rAF por dois rAFs encadeados.
- [Botões em `asChild` (ex.: `LocaleSwitch`) não têm `swap`] → Ficam com o tom do repouso, que é o certo: sem painel, não há inversão.

## Open Questions

- Nenhuma que bloqueie. O destaque do modo `link` fica registado como possível change seguinte.
