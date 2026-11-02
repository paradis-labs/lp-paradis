## MODIFIED Requirements

### Requirement: Publicar no CMS invalida o conteúdo afetado

Uma alteração ou remoção de conteúdo do site publicada no hcms SHALL invalidar as tags afetadas, de modo que a próxima navegação de um visitante mostre o conteúdo novo. A invalidação SHALL ser feita por um Flow do hcms que chama o endpoint de revalidação do site, com as tags definidas pelo módulo de conteúdo. Submissões do formulário SHALL NOT invalidar cache.

#### Scenario: Editor altera o título do hero

- **WHEN** um editor grava um novo título do hero em `pt-AO` no hcms
- **THEN** a página `/pt`, num pedido seguinte, mostra o novo título

#### Scenario: Editor altera um serviço

- **WHEN** um editor altera o nome de uma oferta do site
- **THEN** a homepage e a página de orçamento passam a mostrar o nome novo

#### Scenario: Submissão do formulário

- **WHEN** um visitante submete o formulário de orçamento
- **THEN** nenhuma tag de cache de conteúdo é invalidada
