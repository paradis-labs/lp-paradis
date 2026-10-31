## ADDED Requirements

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
- A pill de disponibilidade SHALL renderizar por baixo da introdução, com o ponto a pulsar (parado com movimento reduzido), e continua opcional e controlada pelo CMS.
- O título do cartão ("Tell us about your project") e o subtítulo ("A few details are enough to get started.") SHALL ser cópia de UI localizada, porque o formulário do hcms não tem esses campos.
- O piso do rótulo da mensagem SHALL passar a "Your project" / "O seu projecto", e o placeholder da textarea ("Goals, timeline, budget range — anything that helps us understand it.") SHALL ser cópia de UI localizada.

Os restantes rótulos, o botão, a nota de privacidade e as mensagens continuam a vir do CMS, com os pisos existentes.

#### Scenario: Eyebrow authorado

- **WHEN** o formulário do hcms tem eyebrow "Start here" em `en`
- **THEN** o `PageHeader` de `/en/get-quote` mostra "Start here"

#### Scenario: Nenhuma string em inglês em /pt

- **WHEN** `/pt/get-quote` é servido com o CMS vazio
- **THEN** todo o texto do ecrã, incluindo a cópia de UI nova e o placeholder, está em português

### Requirement: O campo de empresa depende do formulário do hcms

O campo "Company (optional)" SHALL renderizar só quando o formulário `quote_request` do hcms declarar um campo com `name = "company"`. A label SHALL vir da tradução desse campo, com piso "Company" / "Empresa", seguida de "(optional)" / "(opcional)" como cópia de UI. O input SHALL usar `autocomplete="organization"` e SHALL NOT ser obrigatório.

Sem o campo no hcms, a grelha de dados pessoais SHALL mostrar só nome e e-mail, sem célula vazia.

#### Scenario: Campo declarado no hcms

- **WHEN** o formulário do hcms tem um campo `company`
- **THEN** a página mostra o input de empresa ao lado do e-mail

#### Scenario: Campo ausente no hcms

- **WHEN** o formulário do hcms não tem um campo `company`
- **THEN** a página não mostra o input de empresa e o formulário continua a submeter
