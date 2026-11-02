# cms-content-cache Specification

## Purpose

O cache das leituras do módulo de conteúdo — chaveado por locale, com tags definidas pelo módulo e independentes do CMS, expiração máxima finita, escritas fora do cache, e a invalidação disparada pelo Flow do hcms através do endpoint protegido `POST /api/cms/revalidate`.

_Introduzida por `cms-phase-0b-content-cache` e alterada por `cms-phase-3-directus-provider` e `cms-phase-5-remove-payload`, sincronizada antes de arquivar._

## Requirements

### Requirement: Leituras de conteúdo são cacheadas por locale

Cada função de leitura do módulo de conteúdo SHALL ter o resultado cacheado, com o locale como parte da chave. Com o cache quente, servir uma rota SHALL NOT fazer pedidos ao CMS.

#### Scenario: Troca de idioma com cache quente

- **WHEN** `/en` e `/pt` já foram servidos uma vez e o visitante troca de idioma
- **THEN** a rota de destino é servida sem nenhuma query ao CMS

#### Scenario: Locales isolados

- **WHEN** `/en` é servido a partir do cache depois de `/pt` ter aquecido o cache
- **THEN** todo o conteúdo apresentado está em inglês

### Requirement: As tags de cache são definidas pelo módulo, não pelo CMS

As tags de cache SHALL ser definidas num único ficheiro do módulo de conteúdo, com nomes que não dependem do provider: uma tag por global, uma por global e locale, e uma por coleção populada. Qualquer mecanismo de invalidação, de qualquer provider, SHALL invalidar estas tags e nenhumas outras.

#### Scenario: Leitura que popula coleções

- **WHEN** a homepage é lida
- **THEN** o resultado fica associado às tags da global `homepage` e às tags de cada coleção que ela popula

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

### Requirement: O cache tem uma expiração máxima finita

Mesmo sem invalidação, uma entrada de cache SHALL expirar num prazo máximo definido no módulo, para que uma invalidação perdida não deixe conteúdo antigo indefinidamente.

#### Scenario: Hook de invalidação falha

- **WHEN** um hook de invalidação falha depois de uma gravação
- **THEN** o conteúdo novo aparece no site, no máximo, no fim do prazo de expiração

### Requirement: Escritas não são cacheadas

As operações de escrita do módulo de conteúdo SHALL NOT passar pela camada de cache.

#### Scenario: Duas submissões iguais

- **WHEN** dois visitantes submetem o formulário com os mesmos dados
- **THEN** existem duas submissões gravadas

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
