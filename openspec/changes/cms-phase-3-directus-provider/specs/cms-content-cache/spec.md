## MODIFIED Requirements

### Requirement: Publicar no CMS invalida o conteúdo afetado

Uma alteração ou remoção de conteúdo publicada no CMS SHALL invalidar as tags afetadas, de modo que a próxima navegação de um visitante mostre o conteúdo novo.

Com o Payload, a invalidação SHALL ser feita por hooks das globals e coleções. Com o hcms, SHALL ser feita pelo flow de revalidação do template do hcms, que chama o endpoint de revalidação do site configurado no item do site (`revalidate_url` e `revalidate_secret`). Em ambos os casos, as tags invalidadas SHALL ser as definidas pelo módulo de conteúdo. Submissões do formulário SHALL NOT invalidar cache.

#### Scenario: Editor altera o título do hero

- **WHEN** um editor grava um novo título do hero em `pt` no CMS ativo
- **THEN** a página `/pt`, num pedido seguinte, mostra o novo título

#### Scenario: Editor altera um serviço

- **WHEN** um editor altera o nome de um serviço
- **THEN** a homepage e a página de orçamento passam a mostrar o nome novo

#### Scenario: Submissão do formulário

- **WHEN** um visitante submete o formulário de orçamento
- **THEN** nenhuma tag de cache de conteúdo é invalidada

## ADDED Requirements

### Requirement: O endpoint de revalidação exige um segredo e só conhece tags do módulo

O site SHALL expor `POST /api/cms/revalidate`, que só aceita pedidos com o segredo de revalidação correto, valida o corpo e mapeia a coleção alterada no hcms para tags do módulo de conteúdo. Um pedido sem segredo válido, ou destinado a outro site, SHALL NOT invalidar nada. Uma coleção que o site não usa SHALL ser aceite sem invalidar nada, porque o flow notifica todas as alterações de conteúdo do hcms.

#### Scenario: Segredo errado

- **WHEN** um pedido chega a `/api/cms/revalidate` sem o segredo correto
- **THEN** a resposta é 401 e nenhuma tag é invalidada

#### Scenario: Coleção que o site não usa

- **WHEN** um pedido com o segredo correto indica uma coleção sem mapeamento (por exemplo, de outro site do hcms)
- **THEN** a resposta é 200, sem tags invalidadas

#### Scenario: Pedido para outro site

- **WHEN** um pedido com o segredo correto indica um `site` diferente do deste projeto
- **THEN** a resposta é 400 e nenhuma tag é invalidada

#### Scenario: Edição de um projeto no hcms

- **WHEN** um editor altera um projeto do site no hcms
- **THEN** o Flow chama o endpoint e as tags da coleção `projects` são invalidadas
