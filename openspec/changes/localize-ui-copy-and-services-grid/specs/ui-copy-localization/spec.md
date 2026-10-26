## ADDED Requirements

### Requirement: O texto visível que não vem do CMS existe em cada idioma do site

Todo o texto visível da UI pública que é definido no código, e não pelo CMS, SHALL existir em cada locale do site (`en`, `pt`) e SHALL ser mostrado no locale da rota. Isto inclui os badges das secções da home e os pisos de texto, ou seja, o texto que a UI mostra quando o campo do CMS está vazio. Texto que nenhum visitante vê, como o rótulo do campo armadilha anti-spam, fica fora desta regra.

#### Scenario: Badges das secções em português

- **WHEN** um visitante abre `/pt`
- **THEN** os badges das secções de serviços, produtos e testemunhos aparecem em português

#### Scenario: Piso do rodapé em português

- **WHEN** a tagline do rodapé está vazia no CMS e um visitante abre `/pt`
- **THEN** o rodapé mostra o piso da tagline em português

#### Scenario: Pisos do formulário de orçamento em português

- **WHEN** o rótulo de envio e a mensagem de sucesso estão vazios no CMS e um visitante submete o formulário em `/pt/get-quote`
- **THEN** o botão e a mensagem de sucesso aparecem em português

#### Scenario: Inglês continua igual

- **WHEN** um visitante abre `/en`
- **THEN** os badges e os pisos mostram o mesmo texto inglês de antes desta mudança

### Requirement: A grelha de serviços encontra todos os serviços que o CMS entrega

A grelha de serviços SHALL associar cada cartão ao serviço do CMS pelo slug que o módulo de conteúdo entrega, que é o mesmo nos dois providers. Um cartão cujo serviço exista no CMS SHALL mostrar o nome e a descrição do CMS, no locale da rota.

#### Scenario: Cartão UI/UX em português

- **WHEN** o CMS entrega o serviço `ui-ux-design` com título português e um visitante abre `/pt`
- **THEN** o cartão de UI/UX mostra o título e a descrição em português do CMS

#### Scenario: Todos os cartões encontrados

- **WHEN** o CMS entrega os sete serviços da grelha
- **THEN** nenhum cartão da grelha mostra o texto de recurso

### Requirement: O texto de recurso da grelha segue o idioma da rota

Quando um cartão da grelha não encontra o seu serviço no CMS, o texto de recurso (nome e descrição) SHALL estar no locale da rota.

#### Scenario: Serviço em falta no CMS

- **WHEN** um serviço da grelha não existe no CMS e um visitante abre `/pt`
- **THEN** o cartão mostra o nome e a descrição de recurso em português
