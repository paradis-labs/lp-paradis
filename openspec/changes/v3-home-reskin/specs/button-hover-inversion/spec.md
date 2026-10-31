## MODIFIED Requirements

### Requirement: A geometria da caixa não muda entre repouso e hover

O `Button` SHALL manter a mesma largura de contorno em repouso e em hover, de modo que a caixa de conteúdo tenha exactamente as mesmas dimensões nos dois estados. Só a cor do contorno muda.

A espessura depende do tamanho do botão, como no v3: 1,5px nos botões compactos (navbar, FAQ, footer, menu mobile, "View All") e 2px nos CTAs grandes do hero e do about.

#### Scenario: Conteúdo não desloca ao entrar em hover

- **WHEN** o cursor entra num botão com `textSwap`
- **THEN** o rótulo e o ícone não se deslocam horizontal nem verticalmente por causa de mudança de espessura de contorno

#### Scenario: Contorno reservado mesmo quando invisível em repouso

- **WHEN** uma variante não mostra contorno em repouso
- **THEN** a largura do contorno na caixa é a mesma que terá em hover, com a cor transparente ou igual ao fundo do botão

#### Scenario: Espessura constante por tamanho

- **WHEN** um botão com `textSwap` é medido em repouso e em hover
- **THEN** o contorno tem a mesma espessura nos dois estados
- **AND** essa espessura é 1,5px ou 2px, conforme o tamanho do botão

### Requirement: Botões sem textSwap mantêm o comportamento actual

Botões sem `textSwap` SHALL manter exactamente o hover que a `cva` já define, sem painel de preenchimento e sem inversão de ícone. No v3, todos os CTAs do site usam `textSwap`, incluindo os do footer e do menu mobile. Ficam sem `textSwap` só os botões que não são CTA (ícone, link).

#### Scenario: CTAs do footer ganham o efeito

- **WHEN** os CTAs da faixa "Ready to build?" do footer entram em hover
- **THEN** o preenchimento sobe e o rótulo rola, como em qualquer CTA do site

#### Scenario: Botão com asChild não ganha camadas

- **WHEN** um botão é renderizado com `asChild`
- **THEN** nenhum painel de preenchimento nem `<span>` de ícone é inserido
- **AND** o filho único exigido pelo `Slot` é preservado

## ADDED Requirements

### Requirement: O preenchimento sobe em arco e o rótulo rola

Num `Button` com `textSwap`, o hover SHALL produzir o efeito do v3:

- o painel de preenchimento começa abaixo do botão com cantos superiores em arco (`border-radius: 50% 50% 0 0`) e sobe até cobrir o botão, perdendo o arco, em 0,5 s com `cubic-bezier(0.4, 0, 0, 1)`;
- o rótulo, em duas cópias, rola para cima uma altura de linha em 0,8 s com `cubic-bezier(0.16, 1, 0.3, 1)`, e a cópia que entra tem a cor de hover;
- o glifo do disco rola na vertical (sai por cima e entra por baixo) com a mesma duração e curva do rótulo, enquanto a cor do disco transita com a duração e a curva do painel.

#### Scenario: Hover completo

- **WHEN** o cursor entra num botão `primary` com `circleIcon`
- **THEN** o painel branco sobe em arco até cobrir o botão
- **AND** o rótulo passa a `#212528`, e o disco passa de branco para `#212528` com glifo branco

#### Scenario: A segunda cópia do rótulo não é anunciada

- **WHEN** um leitor de ecrã encontra o botão
- **THEN** o rótulo é anunciado uma vez, porque a segunda cópia é `aria-hidden`

### Requirement: O botão não tem efeito magnético

O `Button` SHALL NOT deslocar-se atrás do ponteiro. A prop `magnetic` e o hook `use-magnetic` SHALL ser removidos, e nenhum call site SHALL continuar a passá-la.

#### Scenario: Ponteiro sobre o botão

- **WHEN** o ponteiro se move dentro de um botão
- **THEN** a caixa do botão não muda de posição

### Requirement: Movimento reduzido desliga as transições do botão

Com `prefers-reduced-motion: reduce`, o painel, o rótulo e o disco SHALL mudar de estado sem transição, e a cor final do hover SHALL ser a mesma que com movimento.

#### Scenario: Hover sob movimento reduzido

- **WHEN** o cursor entra num botão com `textSwap` e `prefers-reduced-motion: reduce` está ativo
- **THEN** o botão mostra de imediato o estado de hover, sem animação intermédia
