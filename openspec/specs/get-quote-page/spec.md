# get-quote-page Specification

## Purpose

A página `/get-quote` inteiramente dirigida pelo CMS — a forma da global `GetQuotePage`, o mapeamento de cada campo para o design, o comportamento com conteúdo em falta ou parcial, a localização por locale, e os metadados de SEO.

_Introduzida por `add-get-quote-page`, sincronizada ao arquivar._

## Requirements

### Requirement: A rota `/get-quote` renderiza conteúdo vindo da global

A rota `/[locale]/get-quote` SHALL obter o seu conteúdo da global da página de orçamento através de `getQuotePage(locale)` do módulo de conteúdo (`@/content`), com o `locale` do segmento de rota, e com os serviços de interesse já populados.

A rota SHALL NOT conhecer o CMS que serve a global: nem o slug interno, nem a profundidade de população, nem a instância do cliente do CMS.

#### Scenario: Página com a global preenchida

- **WHEN** um visitante abre `/en/get-quote` com a global da página de orçamento preenchida
- **THEN** o headline, o parágrafo de introdução, a pill de disponibilidade, o eyebrow, os rótulos do formulário, o rótulo do botão e a nota de privacidade apresentados são os valores gravados na global
- **AND** nenhum desses textos aparece escrito diretamente no JSX do componente

#### Scenario: A rota usa só o módulo de conteúdo

- **WHEN** se inspeciona `get-quote/page.tsx` e os componentes de `GetQuote`
- **THEN** o único import de conteúdo é `@/content`
- **AND** não há imports de `payload`, `@payloadcms/*` nem `payload-types.ts`

### Requirement: Cada campo visível tem um piso em código

Todo texto do design SHALL existir em código como valor de piso do campo correspondente, e o valor da global SHALL substituí-lo apenas quando não estiver vazio. Um campo SHALL contar como vazio quando for `null`, `undefined`, string vazia ou composto apenas por espaços — o Payload grava string vazia quando um campo de texto é limpo no admin, e `"" ?? piso` devolveria `""`.

A resolução SHALL usar um helper partilhado (`src/lib/cms-text.ts`), e esse helper SHALL devolver o valor original intacto quando há conteúdo.

#### Scenario: Campo esvaziado no admin

- **WHEN** o rótulo do botão de submissão é apagado no admin e a página é aberta
- **THEN** o botão apresenta o rótulo de piso definido em código
- **AND** não aparece um botão sem rótulo

#### Scenario: Campo com apenas espaços

- **WHEN** um campo de texto da global contém apenas espaços
- **THEN** o valor de piso é usado

#### Scenario: Global inexistente ou totalmente vazia

- **WHEN** a página é renderizada sem nenhum conteúdo gravado na global
- **THEN** a página renderiza por inteiro com os valores de piso, mantendo o layout do design
- **AND** não lança erro nem devolve 500

### Requirement: Os chips de interesse vêm da coleção `Services`

A lista de interesses selecionáveis SHALL ser um campo `relationship` para `services` com `hasMany: true` na global, e não uma lista de rótulos própria da global.

O rótulo de cada chip SHALL ser o `title` do serviço (localizado) e a identidade estável de cada chip SHALL ser o `slug` do serviço, nunca o título.

#### Scenario: Serviços ligados na global

- **WHEN** a global tem três serviços ligados no campo de interesses e a página é aberta em `/pt/get-quote`
- **THEN** aparecem três chips, rotulados com o `title` em português de cada serviço
- **AND** a ordem dos chips é a ordem definida no campo de relationship

#### Scenario: Nenhum serviço ligado

- **WHEN** a global não tem nenhum serviço ligado no campo de interesses
- **THEN** a secção de interesses inteira não é renderizada, incluindo o seu rótulo
- **AND** o resto do formulário permanece utilizável

#### Scenario: Título de serviço reescrito no CMS

- **WHEN** o `title` de um serviço é alterado no admin
- **THEN** o rótulo do chip acompanha a alteração
- **AND** a identidade usada para submeter aquele interesse continua a ser o `slug`, inalterada

### Requirement: Todo o conteúdo visível é localizado

Todos os campos da global que produzem texto no ecrã SHALL ser declarados `localized: true`, incluindo as mensagens de validação, de sucesso e de erro do formulário. Campos que não produzem texto no ecrã — `href`s, e-mail destinatário e flags — SHALL NOT ser localizados.

Este requisito existe porque o projeto não tem catálogo de mensagens do next-intl: [`src/i18n/request.ts`](../../../../src/i18n/request.ts) devolve apenas `locale`, sem `messages`, portanto o Payload é o único sítio onde uma string pode ter duas versões.

#### Scenario: Mesma página nos dois locales

- **WHEN** a global tem conteúdo distinto gravado em `en` e em `pt` e o visitante abre `/pt/get-quote`
- **THEN** todo o texto do ecrã — headline, introdução, rótulos, botão, nota de privacidade — está em português
- **AND** nenhuma string em inglês aparece na rota `/pt`

#### Scenario: Mensagem de erro de validação em português

- **WHEN** o visitante em `/pt/get-quote` submete um e-mail inválido
- **THEN** a mensagem de erro apresentada é a gravada no locale `pt` da global
- **AND** não é a mensagem padrão do zod em inglês

### Requirement: Metadados de SEO gerados a partir da global

A rota SHALL exportar `generateMetadata` que lê um grupo `seo` (`metaTitle`, `metaDescription`, ambos localizados) da global, seguindo a forma do grupo `seo` da `HomePage`. Quando um desses campos estiver vazio, SHALL recair sobre os valores da `metadata` estática do layout.

#### Scenario: SEO preenchido

- **WHEN** `metaTitle` e `metaDescription` estão preenchidos no locale pedido
- **THEN** o `<title>` e a meta description da página são esses valores

#### Scenario: SEO vazio

- **WHEN** o grupo `seo` está vazio
- **THEN** a página herda o título estático do layout
- **AND** não apresenta um `<title>` vazio

### Requirement: Apenas o formulário é código de cliente

O componente da página SHALL ser um server component e SHALL passar ao formulário apenas strings já resolvidas e a lista de chips (`slug` + `title`) — o objeto populado da global SHALL NOT atravessar a fronteira servidor/cliente.

O módulo de cliente do formulário SHALL NOT importar de `@/i18n/navigation`, e ícones SHALL ser importados nominalmente, nunca resolvidos por indexação dinâmica sobre um `import * as`. As duas restrições correspondem a custos já medidos neste repo: +33,6 KB de runtime ICU do `@formatjs` e 12,7 MB retidos por indexação de namespace de ícones, este último documentado em [`Button/index.tsx`](../../../../src/components/Button/index.tsx).

#### Scenario: Fronteira de serialização

- **WHEN** a página renderiza o formulário
- **THEN** as props do componente de cliente contêm apenas strings resolvidas e a lista de chips
- **AND** não contêm o objeto da global nem objetos `Service` completos

#### Scenario: Imports proibidos no formulário

- **WHEN** o módulo do formulário e os seus imports são inspecionados
- **THEN** não existe import de `@/i18n/navigation`
- **AND** não existe acesso a ícones por indexação dinâmica sobre um namespace importado

### Requirement: Fixture dev-only para os estados degradados

SHALL existir uma rota `/[locale]/fixtures/get-quote` que renderiza a página com props fabricadas, cobrindo os estados degradados descritos nesta especificação: global vazia, sem serviços ligados, pill desativada, e rótulos individuais em branco.

A rota SHALL chamar `notFound()` a menos que `NODE_ENV === "development"`, e essa guarda SHALL ser a primeira coisa no corpo do componente. A fixture SHALL apontar, em comentário, para os cenários desta spec que cobre, porque não há nada que force a sua atualização quando a global ganhar campos.

#### Scenario: Acesso em produção

- **WHEN** a rota da fixture é pedida com `NODE_ENV` diferente de `development`
- **THEN** a resposta é 404

#### Scenario: Acesso em desenvolvimento

- **WHEN** a rota é aberta no dev server
- **THEN** apresenta os casos degradados fabricados, cada um identificado
- **AND** cada caso difere do caso completo apenas no campo que degrada

### Requirement: Layout v3 da página de orçamento

A página SHALL seguir o artboard `openspec/design/v3 · Get Quote (EN)-html/GetQuote.dc.html`: um `PageHeader` com o eyebrow, o headline (Gilroy, 64px a desktop, 52px abaixo de 1024px, 38px abaixo de 768px) e a introdução, e por baixo uma grelha com o cartão do formulário e o aside de contacto (`quote-contact-aside`). Os breakpoints e os valores visuais são os do mockup.

Inputs: 52px de altura, contorno de 1,5px `#edeef0`, raio 12px; `#d4d7da` em hover; contorno `#212528` com anel de 4px em foco. A textarea tem no mínimo 168px e redimensiona na vertical. Os chips de interesse são `<button aria-pressed>`, com o ícone a rodar 45° quando ligados e contorno `#212528` em hover.

#### Scenario: Desktop

- **WHEN** `/en/get-quote` é vista a 1440px
- **THEN** o cabeçalho, o cartão do formulário e o aside coincidem com o artboard

#### Scenario: Chips por teclado

- **WHEN** o visitante usa Tab até um chip e carrega em Espaço
- **THEN** o chip passa a `aria-pressed="true"` e o interesse é incluído na submissão

### Requirement: Mapeamento dos textos no layout v3

- O eyebrow do formulário (`form.eyebrow`) SHALL passar a ser o eyebrow do `PageHeader`, com piso "Get a Quote" / "Pedir orçamento".
- O `PageHeader` SHALL terminar na introdução, sem a pill de disponibilidade, como no artboard.
- O título do cartão ("Tell us about your project") e o subtítulo ("A few details are enough to get started.") SHALL ser cópia de UI localizada, porque o formulário do hcms não tem esses campos.
- O piso do rótulo da mensagem SHALL passar a "Your project" / "O seu projecto", e o placeholder da textarea ("Goals, timeline, budget range — anything that helps us understand it.") SHALL ser cópia de UI localizada.

Os restantes rótulos, o botão, a nota de privacidade e as mensagens continuam a vir do CMS, com os pisos existentes.

#### Scenario: Eyebrow authorado

- **WHEN** o formulário do hcms tem eyebrow "Start here" em `en`
- **THEN** o `PageHeader` de `/en/get-quote` mostra "Start here"

#### Scenario: Nenhuma string em inglês em /pt

- **WHEN** `/pt/get-quote` é servido com o CMS vazio
- **THEN** todo o texto do ecrã, incluindo a cópia de UI nova e o placeholder, está em português

#### Scenario: Cabeçalho sem pill

- **WHEN** `/en/get-quote` é servida e o bloco de hero da página `contact` no hcms ainda tem `highlights`
- **THEN** o `PageHeader` mostra o eyebrow, o headline e a introdução, e nada por baixo
- **AND** o cartão do formulário começa à mesma distância da introdução que no artboard

### Requirement: O campo de empresa depende do formulário do hcms

O campo "Company (optional)" SHALL renderizar só quando o formulário `quote_request` do hcms declarar um campo com `name = "company"`. A label SHALL vir da tradução desse campo, com piso "Company" / "Empresa", seguida de "(optional)" / "(opcional)" como cópia de UI. O input SHALL usar `autocomplete="organization"` e SHALL NOT ser obrigatório.

Sem o campo no hcms, a grelha de dados pessoais SHALL mostrar só nome e e-mail, sem célula vazia.

#### Scenario: Campo declarado no hcms

- **WHEN** o formulário do hcms tem um campo `company`
- **THEN** a página mostra o input de empresa ao lado do e-mail

#### Scenario: Campo ausente no hcms

- **WHEN** o formulário do hcms não tem um campo `company`
- **THEN** a página não mostra o input de empresa e o formulário continua a submeter
