## ADDED Requirements

### Requirement: O disco do cursor é translúcido sobre botões e capas

Em modo `button`, o disco do cursor SHALL ter opacidade de cerca de 0.6. Em modo `text`, SHALL ter opacidade de cerca de 0.85. Os valores finais são afinados na verificação visual. A opacidade SHALL aplicar-se só ao disco (`::before`), nunca ao rótulo. O ponto em repouso e o modo `link` mantêm as opacidades de hoje.

#### Scenario: Sobre um botão

- **WHEN** o cursor está em modo `button` sobre um CTA
- **THEN** o rótulo do botão vê-se através do disco
- **AND** o disco continua a contrastar com o painel do botão (tom de `cursor-hover-tone`)

#### Scenario: Sobre uma capa

- **WHEN** o cursor está em modo `text` sobre uma capa de produto
- **THEN** a imagem nota-se através do disco
- **AND** o rótulo ("Explore", "View") está com opacidade plena

#### Scenario: Fora de botões e capas

- **WHEN** o cursor está sobre a página ou sobre um link
- **THEN** as opacidades do ponto (1) e do modo `link` (0.16) não mudam

### Requirement: Sem custo de composição novo

A translucidez SHALL ser feita só com `opacity`, sem `backdrop-filter` nem `mix-blend-mode`.

#### Scenario: Disco em movimento sobre uma capa

- **WHEN** o cursor se move sobre uma capa em modo `text`
- **THEN** o disco não aplica nenhum filtro ao que está por trás dele
