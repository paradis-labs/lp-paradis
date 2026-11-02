## ADDED Requirements

### Requirement: O aside fica ao lado do formulário

A página `/get-quote` SHALL renderizar, à direita do cartão do formulário, um aside de contacto com três grupos por esta ordem: contacto direto (título + e-mail), chamada (título + CTA + nota) e redes (título + links). O aside SHALL ficar sticky enquanto o formulário rola, a partir de 1024px. Abaixo de 1024px SHALL passar para baixo do formulário, sem sticky.

#### Scenario: Desktop

- **WHEN** `/en/get-quote` é vista a 1440px e a página rola ao longo do formulário
- **THEN** o aside fica visível ao lado do formulário

#### Scenario: Telefone

- **WHEN** `/en/get-quote` é vista a 390px
- **THEN** o aside aparece por baixo do formulário, a toda a largura, sem transbordo horizontal

### Requirement: Fontes do conteúdo do aside

- O e-mail SHALL vir de `Contact.email`, como link `mailto:` para o mesmo endereço, com roll no rótulo e seta.
- O título do contacto direto e o título das redes SHALL ser `directContact.reachHeading` e `directContact.socialHeading` do footer, com os pisos em código já existentes.
- As redes SHALL ser as `socialLinks` do footer, pela ordem authorada, como links de texto com o nome da plataforma (o mapa de nomes da faixa atual), com o `label` authorado como nome acessível e abertura num novo separador.
- O CTA de chamada SHALL ser o botão `outline` do CTA do footer (`cta.outlineButton`, o "Schedule a Call" authorado), com a variante `outline-inverted`. O título "Prefer to talk?" e a nota "30 minutes, no commitment." SHALL ser cópia de UI localizada.

#### Scenario: Conteúdo completo

- **WHEN** existe e-mail, os dois títulos estão authorados e há duas redes e um botão de chamada com `href`
- **THEN** o aside mostra os três grupos completos

#### Scenario: Locale português

- **WHEN** `/pt/get-quote` é servido
- **THEN** os títulos são os de `pt`, a cópia de UI está em português e os nomes das plataformas não são traduzidos

### Requirement: O aside degrada por grupo

Cada grupo SHALL renderizar só quando tem conteúdo: o contacto direto sem e-mail, a chamada sem `href` e as redes sem nenhuma rede não renderizam, cada um com o seu título. Sem nenhum dos três grupos, o aside SHALL NOT renderizar, e o formulário SHALL ocupar a largura da grelha.

#### Scenario: Sem e-mail

- **WHEN** o `Contact` não tem e-mail
- **THEN** o grupo de contacto direto não renderiza, e os outros dois sim

#### Scenario: Aside vazio

- **WHEN** não há e-mail, nem `href` de chamada, nem redes
- **THEN** o aside não existe no DOM e o formulário não deixa coluna vazia ao lado

### Requirement: Os estados do aside são exercitáveis numa fixture

A fixture `/[locale]/fixtures/get-quote` SHALL incluir um caso por estado do aside: completo, sem e-mail, sem chamada, sem redes, vazio, e uma rede com plataforma `other` (que mostra o `label`).

#### Scenario: Fixture em desenvolvimento

- **WHEN** um programador abre `/en/fixtures/get-quote`
- **THEN** cada estado do aside aparece rotulado
