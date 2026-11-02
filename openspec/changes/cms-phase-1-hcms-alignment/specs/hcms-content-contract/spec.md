## ADDED Requirements

### Requirement: O site lê do hcms partilhado, identificado pelo seu registo de site

O conteúdo do site SHALL vir da instância partilhada `hcms.paradis.host`, a partir do registo de `sites` com slug `paradis`. Nenhuma leitura SHALL devolver conteúdo de outro site da mesma instância.

#### Scenario: Coleção partilhada por vários sites

- **WHEN** o site lê `offerings` ou `projects`
- **THEN** só recebe itens cujo `site` é o registo `paradis`

### Requirement: Os locales do site correspondem a idiomas do hcms por tabela única

Os locales do site SHALL corresponder aos idiomas do hcms por uma tabela única: `en` → `en-US` e `pt` → `pt-AO`. Um campo traduzido vazio no idioma pedido SHALL recair no valor de `en-US`, campo a campo.

#### Scenario: Leitura em português

- **WHEN** o site pede conteúdo para o locale `pt`
- **THEN** o hcms é consultado com o idioma `pt-AO`

### Requirement: As rotas do site não dependem dos slugs do hcms

As rotas públicas SHALL continuar fixas em código. A página do hcms SHALL ser escolhida pela sua `key` (`home`, `contact`), e os links de navegação do tipo `page` ou `anchor` SHALL ser resolvidos para as rotas do site, não para os slugs traduzidos do hcms.

#### Scenario: Link para a página de orçamento em português

- **WHEN** a navegação `header_actions` aponta para a página `contact` e o visitante está em `/pt`
- **THEN** o link vai para `/pt/get-quote` e não para `/pt/pedir-orcamento`

### Requirement: A composição das páginas é do site; o conteúdo é dos blocos

A homepage e a página de orçamento SHALL manter a composição definida em código. O conteúdo de cada secção SHALL vir do bloco correspondente da página no hcms, identificado pela coleção e pela âncora, e um bloco com `hide_block` SHALL desligar a secção.

#### Scenario: Bloco escondido

- **WHEN** o bloco `#testimonials` da página `home` tem `hide_block` ligado
- **THEN** a homepage não renderiza a secção de testemunhos

#### Scenario: Bloco desconhecido

- **WHEN** um editor acrescenta à página `home` um bloco que a composição do site não usa
- **THEN** a homepage renderiza como antes e ignora esse bloco

### Requirement: Os tokens do site têm privilégio mínimo

O site SHALL usar dois tokens distintos: um só de leitura para o conteúdo e um com apenas `create` em `form_submissions` para o formulário. Este repositório SHALL NOT conter nem usar tokens com permissão de escrita no conteúdo ou no schema do hcms.

#### Scenario: Token do formulário tenta ler

- **WHEN** o token do formulário tenta ler qualquer coleção de conteúdo
- **THEN** o pedido é recusado

### Requirement: O contrato com o hcms é verificável por script

SHALL existir um script só de leitura que confirma, com o token de leitura, que o hcms tem a forma de que o site depende: o site e os seus idiomas; as páginas `home` e `contact` com os blocos e âncoras esperados; as navegações `header`, `header_actions`, `footer_columns` e `footer_actions`; o formulário `quote_request` com os campos `name`, `email`, `interests` e `message`; e itens publicados nas coleções referidas pela home. O script SHALL sair com código diferente de zero e nomear cada peça em falta.

#### Scenario: Contrato completo

- **WHEN** o script corre contra o hcms com o modelo atual
- **THEN** sai com código 0 e lista as peças verificadas

#### Scenario: Âncora removida

- **WHEN** o bloco `#products` deixa de existir na página `home`
- **THEN** o script sai com código diferente de 0 e indica `home → block_collection #products` em falta
