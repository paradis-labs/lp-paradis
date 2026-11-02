## ADDED Requirements

### Requirement: Margem lateral única nas superfícies claras

Abaixo de 1280px, todo o contentor de conteúdo sobre superfície clara SHALL ter 24px de margem lateral até 1279px e 20px até 767px, como a `.pad-x` do canvas. A partir de 1280px o conteúdo SHALL centrar-se no `container` de 1280px sem margem própria. A regra SHALL viver num único utilitário em `globals.css`, usado pela listagem de produtos, pelo get-quote, pela galeria e pelo "Next product" do detalhe, pela secção "About" da home e pelas três faixas do footer. Os contentores dentro do painel escuro da home seguem a `.dark-shape .pad-x` (40px / 20px) e SHALL ficar como estão.

#### Scenario: Tablet

- **WHEN** a listagem de produtos, o get-quote ou o detalhe abre a 1024px
- **THEN** o conteúdo começa a 24px da borda da janela

#### Scenario: Telefone

- **WHEN** as mesmas páginas abrem a 390px
- **THEN** o conteúdo começa a 20px da borda da janela

#### Scenario: Footer abaixo de 1280px

- **WHEN** o footer é visto a 1100px ou a 700px
- **THEN** a faixa "Ready to build?", a grelha de links e a linha do copyright começam a 24px da borda, e não a 56px ou 40px

#### Scenario: Desktop largo

- **WHEN** qualquer destas páginas abre a 1440px
- **THEN** o conteúdo ocupa o `container` de 1280px centrado, como hoje

### Requirement: Medidas do PageHeader

O `PageHeader` (listagem de produtos, get-quote e detalhe de produto) SHALL usar as medidas do canvas:

- padding de `88px 80px 72px` a partir de 768px e `40px 20px` abaixo, com margem exterior de 16px e 8px respetivamente;
- a coluna do H1 e do lead com até 1000px de largura;
- 40px entre essa coluna e as ações à direita (o "Visit" do detalhe);
- o H1 com 72px a partir de 1024px, 56px de 768px a 1023px e 40px abaixo de 768px.

A entrada do H1 sem fade, a pill, o lead bicolor aceso letra a letra e a grelha mascarada SHALL ficar como estão.

#### Scenario: Cabeçalho a 900px

- **WHEN** `/en/products` abre a 900px
- **THEN** o cartão do cabeçalho tem 80px de padding horizontal e o H1 tem 56px

#### Scenario: Título longo a 1440px

- **WHEN** o H1 do get-quote, "Let's build something that moves you forward.", é mostrado a 1440px
- **THEN** a coluna do título pode ir até 1000px, e as linhas quebram como no artboard

#### Scenario: Telefone

- **WHEN** o detalhe de produto abre a 390px
- **THEN** o cabeçalho tem 8px de margem, 40px de padding vertical, 20px de horizontal e o H1 com 40px

### Requirement: Fundo das capas de produto

As capas de produto SHALL assentar sobre o token de cor `cover-ground` (`#5a5b5d`), definido em `globals.css` ao lado dos outros tokens. São quatro sítios: o cartão da secção de produtos da home, o cartão da listagem, a capa do detalhe e a capa do "Next product". Nenhum destes sítios SHALL repetir o hex. As imagens da galeria do detalhe ficam sobre `#212528`, como no artboard.

#### Scenario: Capa a carregar ou com transparência

- **WHEN** a imagem de uma capa ainda não carregou, ou tem áreas transparentes
- **THEN** o que se vê por trás é `#5a5b5d`, nos quatro sítios

### Requirement: Glifos de seta e de lâmpada do canvas

Os botões e os cartões SHALL usar os glifos de traço do canvas, e não os da Solar:

| Glifo | Traço | Onde |
|---|---|---|
| seta para baixo e direita (disco) | `M7 7l10 10M17 9v8H9` | CTA do hero, "Get Quote" do header, CTA do about, botões do footer, envio do get-quote |
| seta para cima e direita | `M7 17L17 7M9 7h8v8` | "Visit" do detalhe |
| seta para a direita | `M4 12h16M14 6l6 6-6 6` | "View All" da home, "View product" do "Next product" |
| lâmpada | `M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z` | itens do marquee de serviços |

Cada glifo SHALL ser um SVG de `viewBox="0 0 24 24"`, com traço `currentColor` de 2px nas setas e 1,5px na lâmpada, pontas redondas, `aria-hidden="true"`, e o tamanho a seguir o que o `Button` passa hoje à Solar. O nome acessível SHALL continuar a ser o rótulo do botão. No marquee, o estado de hover SHALL continuar a trocar a lâmpada de contorno por uma preenchida.

#### Scenario: Botão com disco

- **WHEN** o visitante passa o rato pelo "Get Quote" do header
- **THEN** o disco mostra a seta `M7 7l10 10M17 9v8H9`, e a animação de rolar dos dois glifos continua igual

#### Scenario: Marquee em hover

- **WHEN** o visitante passa o rato por um serviço do marquee
- **THEN** a lâmpada de traço do canvas dá lugar à versão preenchida, como hoje acontece com a Solar

#### Scenario: Leitor de ecrã

- **WHEN** um leitor de ecrã chega ao "Visit Kitenda"
- **THEN** anuncia o rótulo, sem nada vindo da seta
