## ADDED Requirements

### Requirement: A home segue o artboard "v3 · EN"

A home SHALL reproduzir os valores visuais do artboard `openspec/design/v3 · EN-html/MainV3.dc.html` (cores, tamanhos de tipo, espaçamentos, raios, sombras, breakpoints em 1279, 1023 e 767px) com os componentes e o Tailwind do repo. O mockup é a referência e não é código a copiar: o runtime `support.js`, os estados `data-props`, o smooth scroll por `wheel` e os textos placeholder (`[CMS cover: …]`, `[Answer from the CMS…]`, `circuit-board.mp4 · with poster`) SHALL NOT chegar ao site.

#### Scenario: Comparação lado a lado

- **WHEN** a home `/en` e o artboard são vistos a 1440, 1024, 768 e 390px
- **THEN** a ordem das secções, a hierarquia tipográfica e os espaçamentos coincidem

#### Scenario: Nenhum placeholder do mockup em produção

- **WHEN** o HTML servido em `/en` e `/pt` é inspecionado
- **THEN** não contém nenhum dos textos entre parêntesis retos do mockup

### Requirement: A estrutura e a origem do conteúdo não mudam

A home SHALL manter as secções e os ids de âncora atuais (`#about-us`, `#services`, `#products`, `#testimonials`, `#faqs`), e todo o conteúdo que hoje vem do hcms SHALL continuar a vir do hcms pelas mesmas leituras de `@/content`. O reskin SHALL NOT introduzir texto de conteúdo em código. Só a cópia de UI sem campo no CMS pode viver em código, como `Record<Locale, …>`.

#### Scenario: Secção desligada no CMS

- **WHEN** um bloco da home tem `hide_block` ligado no hcms
- **THEN** a secção correspondente não é renderizada, como antes do reskin

#### Scenario: Locale português

- **WHEN** `/pt` é servido
- **THEN** toda a cópia de UI introduzida pelo v3 aparece em português

### Requirement: Navbar em glass com roll nos links

A navbar SHALL ficar sticky no topo com fundo `rgba(255,255,255,0.55)` e `backdrop-filter: blur(20px) saturate(160%)` em todas as posições de scroll. Cada link SHALL rolar o rótulo no hover (duas cópias, a segunda `aria-hidden`) em 0,38 s. O link da secção corrente SHALL ter `aria-current` e peso 600.

Abaixo de 1024px os links SHALL dar lugar ao botão de menu. Abaixo de 768px o CTA e o switch de idioma SHALL sair da barra para dentro do menu.

#### Scenario: Desktop

- **WHEN** a home é vista a 1440px
- **THEN** a barra mostra logo, cinco links ao centro, switch de idioma e o CTA "Get Quote"

#### Scenario: Telefone

- **WHEN** a home é vista a 390px
- **THEN** a barra mostra só o logo e o botão de menu
- **AND** o CTA e o switch estão dentro do menu

### Requirement: Hero e marquee de serviços

O hero SHALL ser um cartão com contorno `#edeef0` e raio 16px sobre uma grelha de 90×30px mascarada ao centro, com o H1 em Gilroy 700 com gradiente `#151718 → #6e797e` (cor sólida de base, como exige `text-visibility-guarantees`), a descrição e os dois CTAs authorados.

Logo abaixo, o marquee SHALL mostrar os títulos dos serviços em maiúsculas, cada um precedido de um ícone, num loop CSS contínuo de 45 s, com máscara de fade nas pontas e pausa no hover. O marquee SHALL pausar fora da viewport e com a aba oculta, como exige `idle-runtime-budget`.

#### Scenario: Marquee fora do ecrã

- **WHEN** o utilizador rola até o marquee sair da viewport
- **THEN** a animação do marquee está em `paused`

#### Scenario: Movimento reduzido

- **WHEN** `prefers-reduced-motion: reduce` está ativo
- **THEN** o marquee está parado e os títulos são legíveis

### Requirement: Grelha de serviços em 12 colunas

Dentro do painel escuro, os serviços SHALL ser dispostos numa grelha de 12 colunas com linhas de 60px, com as posições do mockup, células vazias decorativas à volta e uma vinheta radial por cima. Abaixo de 768px os cartões SHALL empilhar numa coluna, sem células decorativas.

A grelha mantém o contrato que já tinha (`localize-ui-copy-and-services-grid`): as posições e os ícones vivem em código, indexados pelo `slug` do serviço, e o CMS dá o título e a descrição curta. Uma posição sem serviço correspondente no CMS mostra a cópia de piso no locale da rota. Cada cartão mostra o ícone, o título e a descrição curta. As garantias de `responsive-content-fit` e `text-visibility-guarantees` sobre as células de serviço continuam a valer.

#### Scenario: Os sete serviços do site

- **WHEN** o hcms devolve os sete serviços com os slugs da grelha
- **THEN** cada cartão ocupa a posição do mockup que corresponde ao seu slug

#### Scenario: Serviço em falta no CMS

- **WHEN** o hcms não devolve o serviço `ai-solutions`
- **THEN** a posição dele mostra o título e a descrição de piso, no locale da rota

### Requirement: Cartões de produto

Os produtos SHALL aparecer numa grelha de 3 colunas (2 abaixo de 1024px, 1 abaixo de 768px). Cada cartão SHALL mostrar a capa (280px de altura, raio 14px, chip de seta no canto), o título em maiúsculas, a descrição a 22px e o link "Discover More" (o `linkLabel` authorado, ou o piso), que abre o `url` do projeto num novo separador. A capa SHALL ativar o modo de texto do cursor com "Discover".

O CTA "View All" da secção SHALL ser o `primaryCta` authorado do bloco `#products`, e SHALL NOT renderizar quando não tiver `url`.

#### Scenario: Projeto sem capa

- **WHEN** um projeto não tem `coverImage`
- **THEN** o cartão mostra a área da capa com o título sobre fundo neutro, sem imagem partida

### Requirement: Testemunhos em colunas que deslizam

Os testemunhos SHALL ser dispostos em três colunas (duas abaixo de 1024px, uma abaixo de 768px), numa janela de altura fixa (680px, 600px abaixo de 1024px, 520px abaixo de 768px) com máscara de fade em cima e em baixo, com os cartões do v3.

As colunas SHALL manter o movimento que o site já tinha, apesar de o mockup v3 as desenhar paradas: deslizam na vertical de forma contínua, em direcções alternadas (a primeira e a terceira descem, a do meio sobe), aceleram com a velocidade do scroll e pausam no hover. O loop SHALL pausar fora da viewport (`idle-runtime-budget`), e a duplicação de cartões SHALL ficar limitada ao que preenche a janela (`client-memory-budget`).

Só a primeira coluna SHALL ser exposta a tecnologias de apoio; as outras são `aria-hidden`. A data de cada testemunho SHALL ser a do domínio (`date`), formatada no locale, e nunca a data de hoje.

#### Scenario: Colunas em movimento

- **WHEN** a secção está na viewport e o ponteiro não está sobre ela
- **THEN** a primeira e a terceira coluna descem e a do meio sobe

#### Scenario: Hover pausa

- **WHEN** o ponteiro está sobre uma coluna
- **THEN** essa coluna para

#### Scenario: Nenhum testemunho

- **WHEN** o hcms não devolve testemunhos
- **THEN** a secção de testemunhos não renderiza

### Requirement: FAQ com acordeão e cartão de chamada

O FAQ SHALL ser uma lista de itens com contorno de 1,5px e raio 16px. O item aberto tem contorno `#212528`, fundo `#fafafa`, sombra e um ícone que roda 180°. A abertura SHALL animar por `grid-template-rows: 0fr → 1fr`, nunca por `height`. Só um item está aberto de cada vez, e o primeiro começa aberto. O acordeão SHALL manter a semântica de teclado e ARIA atual (botão com `aria-expanded`, painel associado).

Por baixo da lista, um cartão com contorno shine SHALL mostrar "Still have questions?" e "Talk to us on a 30-minute call." (cópia de UI localizada) e o CTA de chamada do hero (`secondaryCta`). Sem `url` nesse CTA, o cartão SHALL NOT renderizar.

#### Scenario: Abrir outro item

- **WHEN** o visitante abre o terceiro item com o primeiro aberto
- **THEN** o primeiro fecha e o terceiro abre

#### Scenario: Navegação por teclado

- **WHEN** o visitante usa Tab até uma pergunta e carrega em Enter
- **THEN** o item abre e `aria-expanded` passa a `true`

### Requirement: Layout do footer v3

O footer de todas as rotas SHALL ter, por esta ordem: a faixa "Ready to build?" (o `cta.heading` authorado, com gradiente sobre cor sólida de base) com os dois botões do CTA; o logo e a tagline; as colunas de `linkGroups`, com roll nos links e seta nos externos; e a barra com o copyright e as redes em ícones circulares. O fundo SHALL ser `#212528` com a grelha mascarada no topo e o halo radial do mockup.

Os requisitos de `footer-content-authority`, `footer-link-semantics` e `route-scoped-footer` continuam a valer sem alteração.

#### Scenario: Botão do CTA sem destino

- **WHEN** um dos botões do CTA não tem `href`, ou tem `#`
- **THEN** o botão renderiza com o rótulo authorado (ou o piso) como `<button>` inerte, como antes do reskin, e nunca como âncora para o topo

### Requirement: Cursor com modos

Em dispositivos com `hover: hover` e `pointer: fine`, um cursor personalizado SHALL seguir o ponteiro com interpolação por frame. Tem quatro estados: repouso (ponto), link (anel translúcido), botão (disco opaco) e texto (disco grande com o texto do atributo `data-cursor-text`). O tom é claro sobre o painel escuro, o footer, o menu mobile e os botões escuros, e escuro no resto.

O cursor SHALL NOT existir em toque nem com movimento reduzido. O loop de frames SHALL parar quando o cursor chega ao alvo, como exigem `scroll-frame-budget` e `idle-runtime-budget`.

#### Scenario: Ponteiro parado

- **WHEN** o ponteiro fica parado sobre a página
- **THEN** não há `requestAnimationFrame` agendado pelo cursor

#### Scenario: Dispositivo de toque

- **WHEN** a home é aberta num telefone
- **THEN** o elemento do cursor não é montado

### Requirement: Primitivas do v3 verificáveis numa fixture

SHALL existir uma rota dev-only `/[locale]/fixtures/v3` com as primitivas do v3 usadas por mais de uma página: as variantes de botão sobre fundo claro e escuro, o `PageHeader` com e sem eyebrow e lead, o cartão de chamada, e um item de FAQ aberto e fechado. A rota SHALL chamar `notFound()` fora de `NODE_ENV === "development"`, como primeira instrução do componente.

#### Scenario: Produção

- **WHEN** `/en/fixtures/v3` é pedida com `NODE_ENV` diferente de `development`
- **THEN** a resposta é 404
