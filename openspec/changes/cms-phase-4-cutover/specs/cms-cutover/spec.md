## ADDED Requirements

### Requirement: O conteúdo no Payload é congelado antes do cutover

Antes da troca de provider, a criação, alteração e remoção de conteúdo no Payload SHALL estar indisponível para os editores, por configuração e sem deploy de código. A receção de submissões do formulário SHALL continuar a funcionar durante o congelamento.

#### Scenario: Editor tenta gravar durante o congelamento

- **WHEN** o congelamento está ativo e um editor tenta gravar uma global no `/admin`
- **THEN** a gravação é recusada

#### Scenario: Visitante submete durante o congelamento

- **WHEN** o congelamento está ativo e um visitante submete o formulário de orçamento
- **THEN** a submissão é gravada

### Requirement: A troca de provider em produção exige o portão a zero

O provider de produção SHALL só ser trocado para `hcms` depois de três verificações, corridas contra os dados de produção com o Payload congelado, reportarem zero falhas: a forma do modelo, o conteúdo face ao Payload e a paridade de domínio entre providers. Se alguma reportar falhas, o cutover SHALL ser abortado e o congelamento levantado.

#### Scenario: Paridade falha no dia

- **WHEN** a verificação de paridade de domínio reporta uma diferença durante o cutover
- **THEN** o provider de produção não é trocado e os editores voltam a poder editar no Payload

#### Scenario: Portão a zero

- **WHEN** as três verificações reportam zero falhas
- **THEN** o provider de produção passa a `hcms`, e uma edição no hcms aparece no site num pedido seguinte

### Requirement: O rollback durante a janela não perde submissões

Durante uma janela de rollback definida depois do cutover, o Payload e a sua base de dados SHALL permanecer intactos. O rollback SHALL ser possível por configuração. Antes de o concluir, as submissões recebidas no hcms desde o cutover SHALL ser repostas no Payload a partir de uma exportação, por um processo idempotente, sem que o ambiente do site precise de um token capaz de ler submissões.

#### Scenario: Rollback no terceiro dia

- **WHEN** o provider volta a `payload` três dias depois do cutover e a exportação das submissões é importada
- **THEN** todas as submissões recebidas no hcms nesses três dias existem no Payload, sem duplicados

#### Scenario: Importação repetida

- **WHEN** a mesma exportação é importada duas vezes
- **THEN** o número de submissões no Payload não muda na segunda vez

#### Scenario: Cache depois do rollback

- **WHEN** o rollback é concluído
- **THEN** todas as tags de cache de conteúdo são invalidadas e o site passa a mostrar o conteúdo do Payload
