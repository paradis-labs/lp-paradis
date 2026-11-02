# v3-page-finish Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-finish-pages`, sincronizada antes de arquivar._

## Requirements

### Requirement: Os cartões de produto da home levam ao detalhe

Na secção de produtos da home, o link de cada cartão ("Discover More") SHALL levar a `/[locale]/products/<slug>` no mesmo separador, por navegação de cliente, quando o projeto tem slug. Sem slug, SHALL levar ao `url` do projeto num novo separador, com `rel="noopener noreferrer"` e o aviso de novo separador só para leitores de ecrã. É a mesma regra do cartão da listagem. O site ao vivo SHALL ser visitado a partir do detalhe ("Visit", "Live at"), e não da home.

#### Scenario: Projeto com slug

- **WHEN** o visitante em `/en` clica "Discover More" no cartão da Kitenda
- **THEN** chega a `/en/products/kitenda`, no mesmo separador, e o link não anuncia novo separador

#### Scenario: Projeto sem slug

- **WHEN** um projeto não tem slug
- **THEN** o link abre o `url` do projeto num novo separador, e um leitor de ecrã ouve "(opens in a new tab)"

### Requirement: Zoom da capa dos cartões da home

Com o rato sobre a capa de um cartão de produto da home, a imagem SHALL escalar para 1,065 em 0,5 s (`ease`), e voltar ao sair. Com `prefers-reduced-motion: reduce`, SHALL NOT haver zoom nem transição. O cursor "Discover" e o chip de seta mantêm-se.

#### Scenario: Hover na capa

- **WHEN** o rato entra na capa do cartão
- **THEN** a imagem cresce para 1,065 dentro do contorno arredondado, sem sair dele

#### Scenario: Movimento reduzido

- **WHEN** o sistema pede movimento reduzido
- **THEN** a capa não escala

### Requirement: Título do cartão da listagem

O título de cada cartão em `/products` SHALL ter 36px em todas as larguras, como no artboard.

#### Scenario: Telefone

- **WHEN** `/en/products` abre a 390px
- **THEN** o título "Kitenda" tem 36px

### Requirement: Ecrã de sucesso do get-quote

Depois de um envio bem-sucedido, o ecrã de sucesso SHALL mostrar:

- o ícone de visto;
- um título fixo de UI: "Thanks — your enquiry is in." em `en` e "Obrigado — o seu pedido chegou." em `pt`;
- um só parágrafo com a mensagem `success` do formulário no hcms, ou, sem ela, o piso "We'll reply within one business day." / "Respondemos dentro de um dia útil.";
- o botão "Send another".

Nenhuma frase SHALL aparecer duas vezes por omissão.

#### Scenario: Sem mensagem no hcms

- **WHEN** a mensagem `success` do formulário está vazia e o visitante envia o pedido em `/en/get-quote`
- **THEN** vê o título "Thanks — your enquiry is in." e, por baixo, uma única vez, "We'll reply within one business day."

#### Scenario: Mensagem authorada

- **WHEN** a mensagem `success` é "Vamos responder até amanhã." em `pt`
- **THEN** o título é "Obrigado — o seu pedido chegou." e o parágrafo é a mensagem authorada

### Requirement: Piso do título do aside do get-quote

Sem título vindo do hcms, o aside de contacto SHALL mostrar "Reach us directly" em `en`, em sentence case como no canvas. O piso em `pt` mantém-se.

#### Scenario: Título vazio no hcms

- **WHEN** o título do aside está vazio e o visitante abre `/en/get-quote`
- **THEN** o aside diz "Reach us directly"

### Requirement: Medidas da capa e da galeria do detalhe

No detalhe de produto, a partir de 768px, a capa SHALL ter 760px de altura, o primeiro plano da galeria 720px e cada um dos outros 460px. Abaixo de 768px, as alturas atuais (340px na capa, 260px na galeria) mantêm-se. A capa SHALL usar o texto alternativo do media quando o hcms o tem, e `alt=""` quando não tem.

#### Scenario: Desktop

- **WHEN** `/en/products/kitenda` abre a 1440px
- **THEN** a capa tem 760px, o primeiro plano da galeria 720px e os dois seguintes 460px

#### Scenario: Capa com alt

- **WHEN** a capa da Kitenda tem o alt "Kitenda website on a desktop monitor"
- **THEN** a imagem da capa é anunciada com esse texto

### Requirement: Medidas do "Next product"

O cartão "Next product" do detalhe SHALL ter o título com 56px e o bloco de texto com 40px de padding em todas as larguras, como no artboard. O título SHALL quebrar dentro do cartão, sem overflow horizontal a 390px.

#### Scenario: Telefone

- **WHEN** o detalhe abre a 390px e o próximo produto é "Génesis Sport Club"
- **THEN** o título tem 56px, quebra em linhas dentro do cartão e a página não ganha scroll horizontal

### Requirement: Piso do copyright do footer

Sem copyright vindo do hcms, o footer em `en` SHALL mostrar "Paradis Labs - All rights reserved.", com o nome escrito como no canvas e como no piso em `pt`.

#### Scenario: Copyright vazio no hcms

- **WHEN** o copyright do site está vazio e o visitante abre `/en`
- **THEN** o footer mostra "Paradis Labs - All rights reserved."
