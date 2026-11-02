## 1. Marquee

- [x] 1.1 Em `src/components/MarqueeServices/index.tsx`, trocar a função `Lightbulb` pelo `LightbulbMinimalistic` de `@solar-icons/react` (22 px, `aria-hidden`), e corrigir o comentário sobre a fronteira de cliente
- [x] 1.2 Mover `text-primary/60` do `.marquee-track` para cada `<li>` e dar-lhe `group/item`, `hover:text-primary` e `transition-colors duration-300`
- [x] 1.3 Empilhar as lâmpadas `Linear` e `Bold` na mesma célula, com a troca por `opacity` em `group-hover/item` e `transition-opacity duration-300` (D2)
- [x] 1.4 Confirmar que o marquee continua server component (sem `"use client"`) e que `npm run build` passa

## 2. Verificação

- [x] 2.1 No `npm run dev`, passar o ponteiro sobre um serviço: só esse fica escuro com a lâmpada cheia, a faixa pausa, e o item volta ao repouso ao sair
- [x] 2.2 Repetir num item da segunda cópia da lista
- [x] 2.3 Confirmar que a largura do item e a posição dos vizinhos não mudam no hover
- [ ] 2.4 Com `prefers-reduced-motion: reduce` emulado, confirmar faixa parada e destaque a funcionar
- [ ] 2.5 Em modo tátil (DevTools), tocar num serviço e confirmar que nenhum fica em destaque
- [x] 2.6 `npm run lint`
