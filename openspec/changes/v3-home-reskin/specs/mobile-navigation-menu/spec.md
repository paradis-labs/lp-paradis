## ADDED Requirements

### Requirement: O menu mobile é um painel escuro numerado

Abaixo de 1024px, o botão de menu SHALL abrir um painel `#212528` com raio 20px, preso à navbar (8px de margem lateral, 8px abaixo da barra), com a altura da viewport menos a barra. O painel tem uma grelha decorativa mascarada no canto superior direito.

O painel SHALL conter, por esta ordem:
1. o rótulo "NAVIGATION" (cópia de UI localizada) e os links do navbar, numerados `01`, `02`, … em Gilroy 28px, cada um com o chip de seta e roll no rótulo, com o link corrente destacado;
2. abaixo de 768px: o título "Ready to build?" (cópia de UI localizada, porque o navbar não lê o footer), os botões do navbar (`header_actions`) a toda a largura e, numa barra inferior, o switch de idioma e as redes sociais.

#### Scenario: Conteúdo authorado

- **WHEN** o navbar tem cinco links e um botão, e o site tem duas redes
- **THEN** o painel mostra os cinco links numerados de 01 a 05, o botão e as duas redes

#### Scenario: Entre 768 e 1023px

- **WHEN** o menu é aberto a 900px
- **THEN** o painel mostra os links, e o CTA e o switch continuam na barra

### Requirement: As redes do menu vêm do site

As redes sociais do menu SHALL ser as `socialLinks` do item `sites`, pela ordem authorada, expostas no domínio `NavBar`. Cada ícone SHALL ter como nome acessível o `label` authorado. Sem redes, a fila de redes SHALL NOT renderizar.

#### Scenario: Sem redes

- **WHEN** o site não tem redes sociais authoradas
- **THEN** a barra inferior do menu mostra só o switch de idioma

### Requirement: Abrir e fechar o menu

O botão de menu SHALL ser um `<button>` com `aria-expanded` e um nome acessível que alterna entre "Open menu" e "Close menu" (localizado), com o ícone a trocar de hambúrguer para cruz. O menu SHALL fechar ao escolher um link ou um CTA, ao carregar em Escape e ao passar para 1024px ou mais. Enquanto está aberto, o scroll da página por baixo SHALL ficar bloqueado e o foco SHALL ficar dentro do painel e da barra.

#### Scenario: Escolher um link de âncora

- **WHEN** o visitante abre o menu e toca em "Services"
- **THEN** o menu fecha e a página rola até `#services`

#### Scenario: Escape

- **WHEN** o menu está aberto e o visitante carrega em Escape
- **THEN** o menu fecha e o foco volta ao botão de menu

### Requirement: Os destinos do menu respeitam o locale

Os links e os botões do menu SHALL usar os mesmos destinos da barra, com o prefixo de locale de `navbar-link-destinations`. O switch de idioma do menu SHALL ser o mesmo componente da barra, com os requisitos de `navbar-locale-switch`.

#### Scenario: Locale português

- **WHEN** o visitante em `/pt` abre o menu e toca no botão "Get Quote"
- **THEN** chega a `/pt/get-quote`
