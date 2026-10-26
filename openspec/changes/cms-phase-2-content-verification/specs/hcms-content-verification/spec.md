## ADDED Requirements

### Requirement: Nenhum texto de exemplo chega a produção

A verificação SHALL encontrar todo o campo traduzido do site no hcms, em qualquer idioma, que contenha o marcador `[EXEMPLO]`, e SHALL falhar enquanto existir algum. Estes campos SHALL NOT poder ser aceites como exceção.

#### Scenario: Hero ainda com texto de exemplo

- **WHEN** o título do `block_hero` da página `home` em `en-US` é `[EXEMPLO] We design and build digital products`
- **THEN** a verificação falha e nomeia `home → block_hero.title (en-US)`

### Requirement: Cada campo traduzido existe nos dois idiomas

A verificação SHALL reportar todo o campo do mapeamento que está preenchido num idioma e vazio no outro.

#### Scenario: Resumo de projeto só em inglês

- **WHEN** um projeto tem `summary` em `en-US` e vazio em `pt-AO`
- **THEN** a verificação reporta a tradução em falta desse projeto

### Requirement: O conteúdo do hcms é equivalente ao do Payload

Para cada campo do mapeamento domínio → hcms e cada locale, a verificação SHALL comparar o valor do Payload, lido sem fallback de locale, com o valor do hcms, depois de normalizar espaços, a marcação de rich text e o prefixo de locale dos URLs. As listas SHALL ser emparelhadas por identidade (slug ou título normalizado) e não por posição.

Uma diferença SHALL só ser aceite se estiver numa lista de exceções versionada, com o motivo.

#### Scenario: Texto revisto no hcms

- **WHEN** a tagline em `pt-AO` difere da do Payload e a diferença está na lista de exceções com motivo
- **THEN** a verificação não a conta como falha e mostra-a como aceite

#### Scenario: Projeto reordenado

- **WHEN** os projetos têm o mesmo conteúdo mas outra ordem no hcms
- **THEN** a verificação não reporta diferença de conteúdo e indica a diferença de ordem à parte

### Requirement: A verificação não escreve em nenhum CMS

A verificação SHALL usar apenas leituras: o token de leitura no hcms e a Local API do Payload sem operações de escrita.

#### Scenario: Correr em produção

- **WHEN** a verificação corre contra o hcms e o Payload de produção
- **THEN** nenhum registo é criado, alterado ou apagado em nenhum dos dois
