## MODIFIED Requirements

### Requirement: A coleção de submissões não é legível publicamente

As submissões SHALL exigir credenciais para qualquer operação. Nenhuma operação sobre elas SHALL estar disponível a pedidos anónimos à API do CMS.

Com o Payload, `create`, `read`, `update` e `delete` em `quote-requests` SHALL exigir utilizador autenticado, e a Server Action SHALL gravar pela Local API com `overrideAccess: true` declarado explicitamente. Com o hcms, a submissão SHALL ser um registo de `form_submissions` do formulário `quote_request` do site, criado com um token que só tem `create` nessa coleção; o papel público SHALL NOT ter acesso a `form_submissions`, e o token de leitura do site SHALL NOT as ler. Em ambos os casos, a única via de escrita anónima SHALL ser a Server Action e as guardas dela (honeypot, tempo mínimo, zod, formulário ativo).

Este requisito é explícito porque o conteúdo de marketing é público por natureza, e replicar esse padrão nas submissões expõe nome, e-mail e descrição de projeto de terceiros.

#### Scenario: Leitura anónima da API

- **WHEN** um pedido não autenticado tenta listar as submissões na API do CMS ativo
- **THEN** a resposta não contém nenhuma submissão

#### Scenario: Leitura autenticada

- **WHEN** um editor autenticado abre as submissões no admin do CMS ativo
- **THEN** vê as submissões gravadas

#### Scenario: Escrita anónima pela API recusada

- **WHEN** um pedido não autenticado tenta criar uma submissão diretamente na API do CMS ativo
- **THEN** o pedido é recusado e nenhuma submissão é gravada

#### Scenario: Escrita anónima pelo formulário aceite

- **WHEN** um visitante não autenticado submete o formulário de `/get-quote` com dados válidos e o formulário ativo
- **THEN** a submissão é gravada no CMS ativo

#### Scenario: O token de leitura do site não lê submissões

- **WHEN** o token de leitura do site tenta listar `form_submissions` no hcms
- **THEN** o pedido é recusado

#### Scenario: Formulário desligado não é contornável pela API

- **WHEN** o formulário está desligado e um pedido anónimo tenta criar uma submissão na API do CMS ativo
- **THEN** nenhuma submissão é gravada
