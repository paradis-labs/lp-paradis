## ADDED Requirements

### Requirement: O provider é selecionado por ambiente, num único ponto

O módulo de conteúdo SHALL escolher o provider a partir de `CMS_PROVIDER` (`payload` ou `hcms`, default `payload`), num único ponto, no arranque. Um valor inválido SHALL impedir o arranque. Nenhum consumidor do módulo SHALL saber qual é o provider ativo.

#### Scenario: Troca de provider

- **WHEN** a app é reiniciada com `CMS_PROVIDER=hcms`
- **THEN** todas as leituras e escritas passam a ser feitas no hcms, sem alterações de código

#### Scenario: Valor inválido

- **WHEN** a app arranca com `CMS_PROVIDER=strapi`
- **THEN** o arranque falha com uma mensagem que indica os valores aceites

### Requirement: O provider hcms cumpre o mesmo contrato

O provider hcms SHALL implementar todas as funções do módulo com as mesmas garantias do provider Payload: validação na fronteira, propagação de erros de transporte, descarte registado de itens inválidos, rich text sanitizado e fallback para o idioma padrão campo a campo. SHALL ler com um token só de leitura e SHALL escrever submissões com um token que só tem `create` em `form_submissions`.

#### Scenario: Tradução parcial

- **WHEN** a tradução `pt-AO` de uma oferta tem o título preenchido e o resumo vazio, e um visitante abre `/pt`
- **THEN** o título aparece em português e o resumo em inglês

#### Scenario: Link de navegação para uma secção

- **WHEN** a navegação `header` tem um item do tipo `anchor` para `services` na página `home`, e o visitante está em `/pt/get-quote`
- **THEN** o link aponta para `/pt#services`

### Requirement: Os providers são verificados quanto à paridade de domínio

SHALL existir uma verificação que, para cada função de leitura e cada locale, obtém o resultado dos dois providers e compara os objetos de domínio campo a campo. A verificação SHALL normalizar apenas o que difere por natureza entre CMS, ou só na forma, com as mesmas regras da verificação de conteúdo da fase 2: identificadores opacos, URL das imagens, espaços, aspas tipográficas, texto vazio igual a ausente, e prefixo de locale e âncora (`#secção` igual a `/#secção`) nos URLs internos.

Do que sobra, uma diferença SHALL contar como falha, com duas exceções que SHALL ser listadas à parte:
- o hcms preenche um valor que o Payload não tinha: vazio ou, em `pt`, igual ao de `en` (o fallback de locale do Payload);
- o caminho está numa lista versionada de diferenças aceites, cada uma com o motivo.

A verificação SHALL sair com código diferente de zero se houver falhas, e SHALL indicar o caminho de cada campo diferente.

#### Scenario: Dados equivalentes

- **WHEN** a verificação corre com o conteúdo do hcms já verificado pela fase 2
- **THEN** não reporta falhas e sai com código 0

#### Scenario: Tradução que o Payload não tinha

- **WHEN** um rótulo da navegação em `pt` é "Home" no Payload (o mesmo de `en`) e "Início" no hcms
- **THEN** a verificação lista-o como acrescentado pelo hcms e não o conta como falha

#### Scenario: Diferença por desenho aceite

- **WHEN** o nome acessível de uma rede social difere porque o hcms o deriva da plataforma, e esse caminho está na lista de diferenças aceites com o motivo
- **THEN** a verificação mostra-o como aceite e não o conta como falha

#### Scenario: Ordem diferente

- **WHEN** os projetos da homepage estão por outra ordem no hcms
- **THEN** a verificação reporta `homepage.projects.items` como diferente e sai com código diferente de 0

## MODIFIED Requirements

### Requirement: Media chega com URL resolvida

Uma media no domínio SHALL ter `url`, `alt`, `width` e `height`, com `url` já resolvida pelo provider para um endereço que o site serve ou que o `next/image` aceita: `/cdn/<chave>` com o Payload, ou `${CMS_URL}/assets/<id>` com o hcms. Os componentes SHALL NOT construir URLs de media.

#### Scenario: Imagem do hero com o Payload

- **WHEN** o hero é renderizado com o provider Payload
- **THEN** o `src` da imagem resolve para `/cdn/<chave>`

#### Scenario: Imagem do hero com o hcms

- **WHEN** o hero é renderizado com o provider hcms
- **THEN** o `src` da imagem resolve para o `/assets/<id>` do hcms, através do `next/image`
