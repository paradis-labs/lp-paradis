## MODIFIED Requirements

### Requirement: A coleção de submissões não é legível publicamente

As submissões SHALL ser registos de `form_submissions` do formulário `quote_request` do site no hcms, e SHALL exigir credenciais para qualquer operação. O papel público SHALL NOT ter acesso a `form_submissions`, o token de formulário do site SHALL ter apenas `create`, e o token de leitura do site SHALL NOT as ler. A única via de escrita anónima SHALL ser a Server Action e as guardas dela (honeypot, tempo mínimo, zod, formulário ativo).

Este requisito é explícito porque as submissões guardam nome, e-mail e descrição de projeto de terceiros, ao contrário do restante conteúdo, que é de marketing.

#### Scenario: Leitura anónima da API

- **WHEN** um pedido não autenticado faz `GET /items/form_submissions` ao hcms
- **THEN** o pedido é recusado

#### Scenario: Leitura por editor

- **WHEN** um editor autenticado abre as submissões do formulário `quote_request` no app do hcms
- **THEN** vê as submissões gravadas

#### Scenario: Escrita anónima pela API recusada

- **WHEN** um pedido não autenticado faz `POST /items/form_submissions` ao hcms
- **THEN** o pedido é recusado e nenhuma submissão é gravada

#### Scenario: Escrita anónima pelo formulário aceite

- **WHEN** um visitante não autenticado submete o formulário de `/get-quote` com dados válidos e o formulário ativo
- **THEN** a submissão é gravada em `form_submissions`

#### Scenario: O token de leitura do site não lê submissões

- **WHEN** o token de leitura do site faz `GET /items/form_submissions`
- **THEN** o pedido é recusado

#### Scenario: Formulário desligado não é contornável pela API

- **WHEN** o formulário está desligado e um pedido anónimo faz `POST /items/form_submissions`
- **THEN** nenhuma submissão é gravada
