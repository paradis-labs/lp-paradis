## ADDED Requirements

### Requirement: A composição do footer acompanha a rota em navegação soft

Numa navegação do lado do cliente, o footer SHALL passar para a composição da rota de destino, e não conservar a composição da rota de origem. Para isso, o slot do footer SHALL ter uma folha que case com cada rota pública: uma para a raiz, uma catch-all para qualquer rota sem composição própria, e as folhas específicas das variantes. `default.tsx` SHALL continuar a existir como rede de 404 em hard navigation.

As folhas que renderizam o footer base SHALL delegar num único módulo partilhado.

#### Scenario: De `/get-quote` para a home por clique

- **WHEN** um visitante está em `/en/get-quote` e clica no logo ou num link para `/en`
- **THEN** o footer em `/en` não inclui a faixa de contacto direto

#### Scenario: De `/get-quote` para uma fixture por clique

- **WHEN** um programador está em `/en/get-quote` em desenvolvimento e navega por clique para `/en/fixtures/navbar`
- **THEN** o footer partilhado não inclui a faixa de contacto direto

#### Scenario: Ida e volta

- **WHEN** um visitante navega por clique `/pt` → `/pt/get-quote` → `/pt`
- **THEN** a faixa aparece só enquanto está em `/pt/get-quote`

#### Scenario: Recarga na home depois da navegação

- **WHEN** um visitante recarrega `/en` depois de ter vindo de `/en/get-quote`
- **THEN** o footer não inclui a faixa e a página responde 200
