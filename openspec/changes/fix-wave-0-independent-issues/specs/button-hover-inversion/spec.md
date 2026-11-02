## ADDED Requirements

### Requirement: A tabela de inversão é exaustiva por variante

A tabela `swapInvert` em `src/components/Button/index.tsx` SHALL ser tipada pelas chaves de variante de `buttonVariants`, de modo que acrescentar uma variante sem a entrada correspondente seja um erro de compilação.

#### Scenario: Variante sem entrada

- **WHEN** uma variante nova é acrescentada a `buttonVariants` sem entrada em `swapInvert`
- **THEN** `npm run build` falha com erro de tipo

### Requirement: Variante `pill` de alternância

O `Button` SHALL ter uma variante `pill` para controlos de alternância: forma totalmente arredondada, estado selecionado comunicado por `aria-pressed` e por preenchimento sólido, e a mesma animação de `textSwap` das restantes variantes.

As pills de interesse do formulário de `/get-quote` SHALL usar esta variante. A pill de disponibilidade da mesma página, que não é interativa, SHALL NOT usá-la nem ganhar animação de hover.

#### Scenario: Pill não selecionada em hover

- **WHEN** o visitante passa o cursor sobre uma pill de interesse não selecionada
- **THEN** o painel de preenchimento sobe e o texto inverte, como nas restantes variantes com `textSwap`

#### Scenario: Pill selecionada

- **WHEN** o visitante ativa uma pill de interesse
- **THEN** `aria-pressed` passa a `true` e a pill fica com preenchimento sólido
- **AND** o texto mantém contraste mínimo de 4.5:1 sobre o preenchimento

#### Scenario: Alternância por teclado

- **WHEN** uma pill tem o foco e o visitante prime Espaço
- **THEN** o estado de seleção alterna

### Requirement: O shine é o único aro do botão

Um `Button` com `shine` SHALL ter como único contorno visível o anel animado do `ShineBorder`. Nenhuma `border` estática SHALL ser empilhada sobre ele.

#### Scenario: Botão de submeter de `/get-quote`

- **WHEN** o botão de submeter do formulário é renderizado
- **THEN** o único contorno visível é o gradiente animado, sem aro opaco por baixo ou por cima

#### Scenario: Movimento reduzido

- **WHEN** `prefers-reduced-motion: reduce` está ativo
- **THEN** o anel é visível e estático
