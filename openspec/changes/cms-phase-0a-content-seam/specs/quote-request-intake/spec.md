## MODIFIED Requirements

### Requirement: Submissão válida é persistida em `QuoteRequests`

SHALL existir uma coleção `quote-requests` que guarda cada submissão do formulário com: nome, e-mail, serviços de interesse, mensagem, o locale de origem da submissão, e a data de criação.

A submissão SHALL ser processada por uma Server Action em `src/app/(app)/[locale]/get-quote/actions.ts`, que grava através de `createQuoteRequest` do módulo de conteúdo (`@/content`). A Server Action SHALL NOT importar o cliente do CMS. SHALL NOT ser criado um route handler público para a submissão.

#### Scenario: Submissão completa

- **WHEN** um visitante em `/pt/get-quote` submete nome, e-mail válido, dois interesses e uma mensagem
- **THEN** existe um documento novo em `quote-requests` com esses valores e `locale` igual a `pt`
- **AND** o documento é visível na interface de administração do CMS

#### Scenario: Submissão sem interesses

- **WHEN** a submissão é válida mas nenhum chip de interesse está selecionado
- **THEN** a submissão é aceite e gravada com a lista de interesses vazia
- **AND** a ausência de interesses não é tratada como erro de validação
