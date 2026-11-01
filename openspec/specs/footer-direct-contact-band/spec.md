# footer-direct-contact-band Specification

## Purpose

O conteúdo e a degradação da faixa. Cobre a origem de cada texto (e-mail no `Contact`, títulos no global `Footer`, nomes de plataforma em código), o comportamento quando cada peça falta, a localização em `/pt`, e a relação entre as pills da faixa e os ícones da barra inferior.

_Introduzida por `add-get-quote-footer-band`, sincronizada ao arquivar._

## Requirements

### Requirement: O e-mail vem da coleção Contact

A faixa SHALL ler o endereço de e-mail de `Contact.email` e de mais nenhum sítio. O e-mail SHALL ser um link `mailto:` para esse mesmo endereço.

`Contact.email` é a fonte de verdade existente para o endereço da empresa e não é localizado — o mesmo endereço serve os dois idiomas. Duplicá-lo num campo do global `Footer` criaria duas fontes para o mesmo dado, e a desatualizada mandaria clientes para um endereço morto.

#### Scenario: E-mail authorado

- **WHEN** existe um documento `Contact` com `email` preenchido
- **THEN** a faixa mostra esse endereço como texto visível
- **AND** o link aponta para `mailto:` seguido do mesmo endereço

#### Scenario: O e-mail é idêntico nos dois idiomas

- **WHEN** `/en/get-quote` e `/pt/get-quote` são servidos
- **THEN** ambos mostram exatamente o mesmo endereço

### Requirement: Os títulos da faixa são conteúdo localizado do global Footer

Os dois títulos da faixa SHALL vir de campos de texto localizados do global `Footer`, dentro de um grupo `directContact`. Cada campo SHALL ter um piso em código, aplicado quando o valor authorado está ausente, vazio, ou só com espaços.

Literais em código como fonte foram rejeitados: `add-get-quote-page` exige que nenhuma string em inglês apareça em `/pt/get-quote`, e um título fixo em inglês violaria isso no primeiro render.

#### Scenario: Títulos authorados nos dois idiomas

- **WHEN** os dois campos estão authorados em `en` e em `pt`
- **THEN** `/en/get-quote` mostra os textos em inglês
- **AND** `/pt/get-quote` mostra os textos em português, sem nenhuma palavra em inglês

#### Scenario: Campo esvaziado no admin

- **WHEN** um editor limpa um dos títulos, e o Payload grava string vazia
- **THEN** a faixa mostra o piso em código desse título
- **AND** nenhum título fica em branco na página

### Requirement: O rótulo visível da pill deriva da plataforma

Cada pill SHALL mostrar o nome da plataforma derivado do valor de `socialLinks[].platform`, através de um mapa de nomes em código. A pill NÃO SHALL usar o campo `label` como texto visível, exceto no caso previsto abaixo.

O campo `label` é documentado no admin como "not shown on screen — it is the link's accessible name", e o conteúdo já authorado segue essa instrução. Usá-lo na pill mostraria *"Paradis on LinkedIn"* dentro da pill sem ninguém ter editado nada.

O mapa de nomes SHALL cobrir todas as plataformas nomeáveis do enum, não só as três que têm ícone: um nome é uma string e não custa um módulo, ao contrário de um ícone.

#### Scenario: Plataforma com ícone e nome

- **WHEN** uma rede tem `platform` igual a `instagram`, `linkedin` ou `dribbble`
- **THEN** a pill mostra o ícone dessa plataforma seguido do seu nome

#### Scenario: Plataforma com nome mas sem ícone

- **WHEN** uma rede tem `platform` igual a `github`, `twitter`, `facebook`, `youtube`, `discord` ou `whatsapp`
- **THEN** a pill mostra o nome da plataforma, sem ícone
- **AND** a pill continua a renderizar e a ser clicável

#### Scenario: Plataforma sem nome derivável

- **WHEN** uma rede tem `platform` igual a `other`
- **THEN** a pill mostra o campo `label` como texto visível
- **AND** a pill não é omitida

#### Scenario: O nome da plataforma não é traduzido

- **WHEN** `/pt/get-quote` é servido
- **THEN** as pills mostram os mesmos nomes de marca que em `/en/get-quote`

### Requirement: O nome acessível da pill continua a ser o label authorado

Cada pill SHALL expor o campo `label` como nome acessível da âncora, e o ícone SHALL ser marcado como decorativo. O texto visível e o nome acessível divergem de propósito.

#### Scenario: Leitor de ecrã numa pill

- **WHEN** um leitor de ecrã encontra a pill de uma rede com `label` igual a "Paradis Labs on Instagram"
- **THEN** anuncia "Paradis Labs on Instagram"
- **AND** não anuncia o ícone
- **AND** não anuncia o nome visível duas vezes

#### Scenario: Abertura em nova aba

- **WHEN** um visitante clica numa pill
- **THEN** o destino abre em nova aba, com `rel` a impedir acesso ao `window` de origem

### Requirement: As redes renderizam na ordem authorada, nos dois sítios do footer

Os links de redes do aside de contacto de `/get-quote` e os ícones da barra inferior do footer SHALL renderizar pela ordem do array `socialLinks` do CMS. Nenhum dos dois inverte ou reordena.

A descrição do campo promete ao editor que a ordem é a que ele escolhe ("in the order added here"). Uma inversão num dos dois sítios tornaria essa promessa falsa sem explicação.

#### Scenario: Ordem consistente

- **WHEN** o array `socialLinks` contém, por esta ordem, Dribbble, LinkedIn e Instagram
- **THEN** os links do aside aparecem por essa ordem
- **AND** os ícones da barra inferior do footer aparecem pela mesma ordem
