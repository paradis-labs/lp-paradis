## ADDED Requirements

### Requirement: Destaque por item no hover do marquee de serviços
Cada serviço do marquee SHALL ter um estado de repouso e um estado de destaque. Em repouso, o título e o ícone SHALL estar em `text-primary/60` e o ícone SHALL ser a lâmpada `LightbulbMinimalistic` em contorno (peso `Linear`). Com o ponteiro sobre o item, o título e o ícone SHALL passar a `text-primary` e o ícone SHALL ser a mesma lâmpada preenchida (peso `Bold`). A mudança de cor SHALL ser uma transição de 300 ms. Só o item sob o ponteiro SHALL ficar em destaque; os restantes SHALL manter o estado de repouso.

#### Scenario: Ponteiro sobre um serviço
- **WHEN** o utilizador passa o ponteiro sobre "WEB DEVELOPMENT" no marquee
- **THEN** esse título e a sua lâmpada ficam em `text-primary` e a lâmpada aparece preenchida
- **AND** os outros serviços continuam em `text-primary/60` com a lâmpada em contorno

#### Scenario: Ponteiro sai do serviço
- **WHEN** o ponteiro sai do item em destaque
- **THEN** o item volta ao estado de repouso, com a cor a transitar em 300 ms e a lâmpada de novo em contorno

#### Scenario: Item em destaque fica sob o ponteiro
- **WHEN** o ponteiro está sobre um item
- **THEN** a faixa está pausada, como já exige o requisito do marquee, e o item em destaque não desliza para fora do ponteiro

### Requirement: Âmbito do destaque
O destaque SHALL aplicar-se aos itens das duas cópias da faixa, incluindo a cópia `aria-hidden`. O destaque SHALL existir só em dispositivos com hover: um toque num ecrã tátil SHALL NOT deixar um item preso em destaque. Com `prefers-reduced-motion: reduce`, a faixa fica parada, mas o destaque SHALL continuar a funcionar. O destaque SHALL NOT mudar o tamanho nem a posição do item.

#### Scenario: Item da cópia duplicada
- **WHEN** o item sob o ponteiro pertence à segunda cópia da lista
- **THEN** o destaque é igual ao da primeira cópia

#### Scenario: Ecrã tátil
- **WHEN** o utilizador toca num serviço do marquee num telemóvel
- **THEN** nenhum item fica em destaque

#### Scenario: Movimento reduzido
- **WHEN** `prefers-reduced-motion: reduce` está ativo e o ponteiro passa sobre um serviço
- **THEN** a faixa está parada e o serviço fica em destaque

#### Scenario: Sem salto de layout
- **WHEN** um item entra ou sai do destaque
- **THEN** a largura do item e a posição dos vizinhos não mudam
