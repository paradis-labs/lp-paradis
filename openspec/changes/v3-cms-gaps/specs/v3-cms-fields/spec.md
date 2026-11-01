## ADDED Requirements

### Requirement: Textos do get-quote vindos do formulário

A página de orçamento SHALL ler do formulário `quote_request` do hcms, com o fallback por campo para `en-US` que o provider já aplica, e um piso em código quando ambos faltam:

| Texto | Campo do hcms | Piso (en / pt) |
|---|---|---|
| título do ecrã de sucesso | `forms.translations.success_title` | "Thanks — your enquiry is in." / "Obrigado — o seu pedido chegou." |
| botão para enviar outro | `forms.translations.success_again_label` | "Send another" / "Enviar outro" |
| placeholder da mensagem | `form_fields.translations.placeholder` do campo `message` | o texto atual do canvas / a versão pt |

O título e o subtítulo do cartão do formulário, "(optional)" e os textos do cartão de chamada SHALL continuar a ser cópia de UI em `Record<Locale, …>`.

#### Scenario: Título de sucesso authorado

- **WHEN** `success_title` é "Pedido recebido!" em `pt-AO` e o visitante envia o pedido em `/pt/get-quote`
- **THEN** o título do ecrã de sucesso é "Pedido recebido!"

#### Scenario: Só a versão inglesa authorada

- **WHEN** `success_again_label` só existe em `en-US`, com "Send another one"
- **THEN** `/pt/get-quote` mostra "Send another one" no botão, pelo fallback de campo, e não o piso pt

#### Scenario: Nada authorado

- **WHEN** o placeholder do campo `message` está vazio nos dois idiomas
- **THEN** a área de texto mostra o piso do locale

### Requirement: Poster do vídeo dos serviços

O vídeo de fundo da secção de serviços da home SHALL usar como `poster` a imagem (`image`) do bloco `block_media_text` com âncora `about-us`, o mesmo bloco que dá o vídeo (`media`). O vídeo SHALL manter `preload="none"` e começar só quando entra no ecrã. Sem imagem no bloco, o vídeo SHALL renderizar sem `poster`, sobre o gradiente atual.

#### Scenario: Bloco com imagem

- **WHEN** o bloco `#about-us` tem uma imagem e um vídeo
- **THEN** o `<video>` tem `poster` com o URL da imagem, e a área mostra a imagem antes de o vídeo tocar

#### Scenario: Bloco sem imagem

- **WHEN** o bloco tem vídeo mas não tem imagem
- **THEN** o `<video>` não tem atributo `poster`, e a área mostra o gradiente

### Requirement: Ícones dos passos do produto

`PRODUCT_ICONS` SHALL conter os ícones que os artboards de produto usam: `swap`, `trend`, `shield`, `calculator`, `globe`, `clock`, `chart`, `heart`, `calendar`, `filter`, `bank`, `chat`, `leaf` e `bag`. Cada um SHALL ter o traço do artboard em que aparece; o `calculator` é o da Ficha Segura. Um valor que chegue do hcms fora desta lista SHALL continuar a dar um passo sem ícone, sem descartar o passo.

#### Scenario: Ícone novo antes do schema

- **WHEN** o hcms ainda só oferece os 6 ícones antigos
- **THEN** o site compila e renderiza como hoje, e os 8 novos ficam à espera de ser escolhidos

#### Scenario: Ícone novo escolhido

- **WHEN** o primeiro passo da Génesis tem o ícone `chart`
- **THEN** o cartão do passo mostra o gráfico de barras do artboard

#### Scenario: Valor desconhecido

- **WHEN** um passo chega com o ícone `rocket`
- **THEN** o passo aparece com título e texto, sem ícone

### Requirement: Nome curto do produto no "Visit"

Depois de o schema do template ter `projects.short_name`, o botão "Visit" do detalhe SHALL dizer `Visit <short_name>` ("Visit Génesis"), e `Visit <title>` quando o nome curto está vazio. O `cms:check` SHALL exigir o campo, para um hcms sem ele ser apanhado antes do deploy. O site SHALL NOT pedir `short_name` ao hcms antes de o campo existir lá.

#### Scenario: Nome curto preenchido

- **WHEN** a Génesis Sport Club tem `short_name` "Génesis"
- **THEN** o botão do detalhe diz "Visit Génesis"

#### Scenario: Nome curto vazio

- **WHEN** a Kitenda não tem `short_name`
- **THEN** o botão diz "Visit Kitenda"

#### Scenario: hcms sem o campo

- **WHEN** `npm run cms:check` corre contra um hcms sem `projects.short_name`
- **THEN** o check falha e nomeia o campo em falta
