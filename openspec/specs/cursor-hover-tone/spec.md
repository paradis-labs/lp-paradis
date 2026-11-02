# cursor-hover-tone Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-cursor-hover-tone`, sincronizada antes de arquivar._

## Requirements

### Requirement: O cursor contrasta com o painel de hover dos botões que invertem

Sobre um `Button` com `textSwap`, o tom do cursor SHALL ser o contrário da cor do painel de preenchimento que sobe no hover: `light` quando o painel é escuro (`bg-primary`), `dark` quando o painel é claro (`bg-white`). Sobre um `Button` sem `textSwap`, o tom SHALL continuar a ser o do repouso da variante.

#### Scenario: Botão `outline` com `textSwap`

- **WHEN** o cursor entra num `Button` `outline` com `textSwap`
- **THEN** o cursor fica com tom `light` (disco branco)
- **AND** o disco vê-se sobre o painel `#212528` depois de o painel cobrir o botão

#### Scenario: Botão `primary` com `textSwap`

- **WHEN** o cursor entra num `Button` `primary` com `textSwap`
- **THEN** o cursor fica com tom `dark`
- **AND** o disco vê-se sobre o painel branco

#### Scenario: Variantes sobre fundos escuros

- **WHEN** o cursor entra num `Button` `inverted` com `textSwap`
- **THEN** o cursor fica com tom `light`
- **WHEN** o cursor entra num `Button` `outline-inverted` com `textSwap`
- **THEN** o cursor fica com tom `dark`

#### Scenario: Pill com `textSwap`

- **WHEN** o cursor entra num `Button` `pill` com `textSwap`, seleccionado ou não
- **THEN** o cursor fica com tom `light`

#### Scenario: Sem `textSwap` o tom é o do repouso

- **WHEN** o cursor entra num `Button` `primary` sem `textSwap`
- **THEN** o cursor fica com tom `light`, como hoje
- **AND** o mesmo vale para as outras variantes: tom igual ao de repouso

#### Scenario: Âncora por `href`

- **WHEN** o cursor entra num `Button` com `textSwap` renderizado com `href`
- **THEN** o tom é o mesmo que o do `<button>` da mesma variante com `textSwap`

### Requirement: O tom do cursor é uma camada obrigatória da inversão

O tom do cursor em hover SHALL ser declarado por variante na mesma tabela exaustiva que define as camadas de inversão do `Button`, para uma variante nova sem tom de cursor falhar a compilação em vez de herdar um tom errado em silêncio.

#### Scenario: Variante nova sem tom de cursor

- **WHEN** se acrescenta uma variante a `buttonVariants` e a sua entrada na tabela de inversão não declara o tom do cursor
- **THEN** `npm run build` falha na verificação de tipos

### Requirement: As pills de interesse declaram o tom pelo estado seleccionado

As pills de interesse do formulário de `/get-quote` SHALL declarar tom `dark` quando não estão seleccionadas e tom `light` quando estão (`aria-pressed="true"`). O cursor SHALL reflectir o novo tom quando a pill muda de estado com o ponteiro ainda por cima dela, sem esperar que o ponteiro saia e volte a entrar.

#### Scenario: Pill seleccionada

- **WHEN** o cursor entra numa pill de interesse já seleccionada
- **THEN** o cursor fica com tom `light`

#### Scenario: Pill não seleccionada

- **WHEN** o cursor entra numa pill de interesse não seleccionada
- **THEN** o cursor fica com tom `dark`

#### Scenario: Clicar sem sair da pill

- **WHEN** o visitante clica numa pill não seleccionada e não move o rato
- **THEN** o cursor passa a tom `light` assim que a pill fica seleccionada
- **AND** ao clicar de novo, volta a tom `dark`

### Requirement: A cor do cursor acompanha a subida do painel

Ao entrar em modo `button`, a mudança de cor do cursor SHALL usar a mesma duração (500 ms) e a mesma curva (`--ease-fill`) que o painel de preenchimento, para nenhum instante da subida deixar o disco da cor da superfície que está por baixo dele. Fora do modo `button`, a transição de cor SHALL continuar a ser a de hoje.

#### Scenario: Entrada num botão `outline` com `textSwap`

- **WHEN** o cursor escuro entra num `Button` `outline` com `textSwap` sobre uma página clara
- **THEN** o disco vai de `#212528` a branco em 500 ms com `--ease-fill`, ao mesmo ritmo do painel

#### Scenario: Saída do botão

- **WHEN** o cursor sai de um botão para a página
- **THEN** a cor volta com a transição genérica de hoje (0,25 s)

### Requirement: Sem custo de runtime novo

A mudança de tom SHALL ser resolvida pelos atributos lidos no `mouseover` e pela reavaliação após um clique, sem `mix-blend-mode`, sem `getComputedStyle` e sem observadores de mutação. Com o rato parado, o cursor SHALL continuar sem rAF agendado.

#### Scenario: Rato parado sobre um botão

- **WHEN** o rato pára sobre um botão com `textSwap` e o círculo chega ao ponteiro
- **THEN** não fica nenhum `requestAnimationFrame` agendado pelo cursor
