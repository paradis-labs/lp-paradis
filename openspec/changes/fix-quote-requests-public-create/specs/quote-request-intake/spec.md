## MODIFIED Requirements

### Requirement: A coleção de submissões não é legível publicamente

O access control de `quote-requests` SHALL exigir utilizador autenticado para `create`, `read`, `update` e `delete`. Nenhuma operação sobre a coleção SHALL estar disponível a pedidos anónimos da API REST ou GraphQL.

A Server Action de `/get-quote` SHALL gravar pela Local API com `overrideAccess: true` declarado explicitamente, de modo que a única via de escrita anónima seja a Server Action e as guardas dela (honeypot, tempo mínimo, zod, `form.enabled`).

Este requisito é explícito porque as restantes coleções e globals deste repo usam `read: () => true` — são conteúdo de marketing — e replicar esse padrão aqui expõe nome, e-mail e descrição de projeto de terceiros na API REST.

#### Scenario: Leitura anónima da API

- **WHEN** um pedido não autenticado é feito a `/api/quote-requests`
- **THEN** a resposta não contém nenhuma submissão

#### Scenario: Leitura autenticada

- **WHEN** um utilizador autenticado abre a coleção em `/admin`
- **THEN** vê as submissões gravadas

#### Scenario: Escrita anónima pela API recusada

- **WHEN** um pedido não autenticado faz `POST /api/quote-requests` com um corpo válido
- **THEN** a resposta é 403
- **AND** nenhum documento novo existe em `quote-requests`

#### Scenario: Escrita anónima pelo formulário aceite

- **WHEN** um visitante não autenticado submete o formulário de `/get-quote` com dados válidos e `form.enabled` ligado
- **THEN** a submissão é gravada em `quote-requests`

#### Scenario: Formulário desligado não é contornável pela API

- **WHEN** `form.enabled` está desligado e um pedido anónimo faz `POST /api/quote-requests`
- **THEN** nenhum documento é gravado
