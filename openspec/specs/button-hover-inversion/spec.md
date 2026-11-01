# button-hover-inversion Specification

## Purpose

O contrato de inversão do `Button` com `textSwap` — que camadas invertem no hover (rótulo, preenchimento, ícone, contorno), qual é a regra de contraste que nenhuma camada pode violar, como as transições se sincronizam com o painel que sobe, e a garantia de que a geometria da caixa não muda entre repouso e hover.

_Introduzida por `fix-button-hover-inversion`, sincronizada ao arquivar._

## Requirements

### Requirement: Nenhuma camada do botão iguala o que está atrás dela

Num `Button` com `textSwap`, cada camada visível — contorno, disco do `circleIcon`, glifo do ícone e rótulo — SHALL manter cor distinta da superfície imediatamente atrás de si, em repouso e em hover. A superfície atrás do contorno é o fundo da página; a superfície atrás do disco e do rótulo é o preenchimento do botão no instante considerado.

Esta é a invariante transversal da capability. Os requisitos seguintes são as suas aplicações concretas.

#### Scenario: Disco do ícone contra o preenchimento que sobe

- **WHEN** um botão com `circleIcon` e `textSwap` está em hover e o painel de preenchimento cobre o botão
- **THEN** o disco do ícone tem cor diferente do preenchimento
- **AND** o glifo dentro do disco tem cor diferente do disco

#### Scenario: Contorno contra o fundo da página

- **WHEN** o preenchimento de hover de uma variante tem a mesma cor que o fundo da secção onde o botão vive
- **THEN** o contorno do botão em hover tem cor distinta desse fundo, de modo que a silhueta do botão permanece delimitada

#### Scenario: Nenhuma camada é declarada uma vez e esquecida

- **WHEN** uma variante é adicionada ou alterada no mapa de inversão
- **THEN** a variante declara explicitamente o comportamento de hover de cada camada que possui
- **AND** uma camada sem declaração não herda uma cor fixa que possa coincidir com o preenchimento

### Requirement: O ícone inverte no hover

O `Button` SHALL inverter a cor do ícone final quando o rótulo inverte, seja o ícone um glifo nu ou um glifo dentro de disco.

#### Scenario: Ícone nu herda a inversão do rótulo

- **WHEN** um botão com `trailingIcon` sem `circleIcon` e com `textSwap` entra em hover
- **THEN** o glifo assume a mesma cor que o rótulo assume no hover
- **AND** isso acontece por herança de `currentColor`, sem regra de cor própria no glifo

#### Scenario: Disco e glifo trocam de papel

- **WHEN** um botão `outline` com `circleIcon` e `textSwap` entra em hover
- **THEN** o disco passa de `#212528` para branco
- **AND** o glifo passa de branco para `#212528`

#### Scenario: O disco volta ao repouso ao sair o cursor

- **WHEN** o cursor sai de um botão `outline` com `circleIcon` que estava em hover
- **THEN** o disco volta a `#212528` com glifo branco
- **AND** volta pelo mesmo percurso de transição por que entrou

### Requirement: A inversão do ícone acompanha o painel de preenchimento

A transição de cor do disco e do glifo SHALL usar a mesma duração e a mesma curva de easing que o painel de preenchimento que sobe, para nenhum instante intermédio produzir disco da cor da superfície que ainda está por baixo dele.

#### Scenario: Sem instante de disco invisível durante a subida

- **WHEN** o painel de preenchimento está a meio da subida num botão `outline` com `circleIcon`
- **THEN** o disco não está totalmente branco enquanto a área atrás dele ainda está clara
- **AND** o disco não está totalmente `#212528` depois de a área atrás dele já estar escura

#### Scenario: Duração e easing coincidem com o painel

- **WHEN** se comparam a transição do disco e a transição do painel de preenchimento
- **THEN** ambas têm a mesma duração
- **AND** ambas têm a mesma curva de easing

### Requirement: O contorno permanece legível em hover sobre fundo escuro

Numa variante cujo preenchimento de hover coincide com o fundo da secção, o `Button` SHALL apresentar em hover um contorno cuja cor contrasta com esse fundo, para o botão manter silhueta própria.

#### Scenario: CTA da ProductsSection mantém silhueta

- **WHEN** o CTA `inverted` da `ProductsSection`, dentro de uma secção `bg-primary`, entra em hover e o preenchimento `bg-primary` cobre o botão
- **THEN** existe um contorno visível a delimitar o botão contra a secção
- **AND** o botão não se reduz a rótulo e seta brancos sem forma delimitada

#### Scenario: Repouso não ganha anel indesejado

- **WHEN** o mesmo botão está em repouso
- **THEN** não se vê nenhum anel em torno do bloco branco
- **AND** a espessura do contorno já está reservada na caixa

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

### Requirement: O caminho de render decide se as camadas existem

Num `Button` com `textSwap`, as camadas de inversão — painel de preenchimento, rótulo em duas cópias e `<span>` do ícone — SHALL ser inseridas em todos os caminhos de render excepto `asChild`, incluindo o caminho de âncora aberto por `href`. O `asChild` é a única excepção, e é-o por uma razão mecânica e não estética: o `Slot` aceita um único filho.

Sem este requisito, o cenário acima leria como "âncora não ganha camadas", que é falso — e é precisamente o mal-entendido que deixaria um CTA authorado a escolher entre ter destino e ter animação.

O caminho `href` chega por `add-calendly-popup-cta`, que precisa de botões com destino **e** com `textSwap`/`trailingIcon` nos mesmos call sites.

#### Scenario: Âncora por `href` ganha as camadas

- **WHEN** um botão com `textSwap` é renderizado com `href` e o cursor entra
- **THEN** o painel de preenchimento sobe e o rótulo desliza em duas cópias, como num `<button>`
- **AND** o `<span>` do ícone é inserido dentro da âncora, com a mesma inversão de disco

#### Scenario: Contorno e geometria valem igual na âncora

- **WHEN** um botão `outline` com `textSwap` e `href` entra em hover
- **THEN** o contorno mede 1,5px em repouso e em hover, como no caminho `<button>`
- **AND** o rótulo não se desloca por mudança de espessura

#### Scenario: `href` e `asChild` não coexistem

- **WHEN** se tenta passar `href` e `asChild` ao mesmo `Button`
- **THEN** a combinação falha em compilação
- **AND** nenhum caminho de runtime tem de decidir entre os dois

### Requirement: Os estados são verificáveis sem navegar o site

O projeto SHALL disponibilizar uma rota de fixture que renderize as variantes de `Button` em repouso e em hover sobre fundo claro e sobre fundo escuro, disponível apenas em desenvolvimento.

#### Scenario: Fixture cobre as combinações relevantes

- **WHEN** a rota de fixture de botões é aberta em desenvolvimento
- **THEN** mostra cada variante com `textSwap`, com e sem `circleIcon`
- **AND** mostra-as sobre fundo claro e sobre fundo `bg-primary`

#### Scenario: Fixture está fechada em produção

- **WHEN** a rota de fixture é pedida com `NODE_ENV` diferente de `development`
- **THEN** responde 404 através de `notFound()`
- **AND** a guarda é a primeira instrução do corpo do componente

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
