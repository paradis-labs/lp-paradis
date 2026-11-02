## ADDED Requirements

### Requirement: O gutter lateral do footer acompanha o das secções

Os blocos do footer SHALL usar um gutter lateral responsivo definido num único sítio do módulo `Footer`, crescendo de pelo menos 24px nos ecrãs mais estreitos até ao mesmo gutter das secções da home (`px-14`) a partir de `lg`, e SHALL anular o gutter a partir de `xl`, onde o `max-width` do `container` já afasta o conteúdo das margens.

#### Scenario: Ecrã de 375px

- **WHEN** a home é vista com 375px de largura
- **THEN** o conteúdo do footer está a pelo menos 24px de cada margem lateral
- **AND** não há estouro horizontal

#### Scenario: Ecrã de 1024px

- **WHEN** a home é vista com 1024px de largura
- **THEN** o gutter lateral do footer é igual ao das secções acima dele

#### Scenario: Ecrã acima de 1280px

- **WHEN** a home é vista com 1440px de largura
- **THEN** o conteúdo do footer está centrado e limitado pelo `max-width` do `container`
