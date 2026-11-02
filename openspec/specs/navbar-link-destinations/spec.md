# navbar-link-destinations Specification

## Purpose

Os destinos do navbar — os botões do CMS passarem a navegar, o prefixo de locale nos links e nos botões, quais `href` são deixados intactos, e a visibilidade em mobile.

_Introduzida por `add-navbar-locale-switch`, sincronizada ao arquivar._

## Requirements

### Requirement: Os botões do navbar navegam para a sua URL do CMS

Cada botão do array `buttons` do global `Menu` SHALL renderizar um destino navegável usando o seu campo `url`.

O botão "Get Quote" é o caminho de conversão principal do site.

O `Button` SHALL receber o destino por `href`, e não por `asChild`. Com `href`, um destino interno SHALL navegar pelo `Link` do `next/link` (prefetch e roteamento de cliente), e o botão SHALL manter as camadas da animação do v3 (`button-hover-inversion`). O `asChild` sobre um `Link` dava o roteamento sem as camadas, porque o `Slot` aceita um só filho.

#### Scenario: Botão com URL

- **WHEN** o global `Menu` tem um botão com `label: "Get Quote"` e `url: "/get-quote"`, e o visitante está em `/en`
- **THEN** o botão é uma âncora para `/en/get-quote`
- **AND** clicar nele navega para a página de orçamento por roteamento de cliente

#### Scenario: Botão sem URL authorada

- **WHEN** um botão do CMS não tem `url`
- **THEN** o botão continua a ser renderizado com o seu rótulo
- **AND** não produz uma âncora com destino vazio nem lança erro

#### Scenario: Botão que abre em novo separador

- **WHEN** um botão tem `openInNewTab` ligado
- **THEN** a âncora abre num novo separador com `rel` adequado

### Requirement: Links e botões relativos recebem o prefixo de locale

Um `href` que comece por `/` SHALL ser prefixado com o locale corrente. Um `href` que não comece por `/` SHALL ser devolvido intacto — `#ancora`, `mailto:`, `tel:` e URL absoluta, porque prefixar qualquer um deles quebraria o destino.

A raiz SHALL tornar-se `/<locale>`, e não `/<locale>/`. "Raiz" inclui qualquer href cujo caminho seja `/`, mesmo que seguido de âncora ou query: `/`, `/#seccao` e `/?q=1` SHALL produzir `/<locale>`, `/<locale>#seccao` e `/<locale>?q=1`. Com `trailingSlash: false`, a barra a mais faz o Next normalizar `/<locale>/` para `/<locale>` numa navegação de rota, e o hash perde-se pelo caminho.

O prefixo SHALL ser montado por um helper partilhado em `src/lib/locale-href.ts`, com a mesma semântica que o footer já aplica. O helper replica à mão o `localePrefix: "always"` que é o default do next-intl e que [`routing.ts`](../../../../src/i18n/routing.ts) não sobrescreve — o módulo SHALL registar esse acoplamento em comentário, porque uma alteração a `routing.ts` quebraria o prefixo sem erro de tipo nem teste a falhar.

#### Scenario: Link relativo

- **WHEN** um link do CMS tem `url: "/about"` e o visitante está em `/pt`
- **THEN** a âncora aponta para `/pt/about`

#### Scenario: Link para a raiz

- **WHEN** um link do CMS tem `url: "/"` e o visitante está em `/pt`
- **THEN** a âncora aponta para `/pt`

#### Scenario: Âncora na raiz

- **WHEN** um link do CMS tem `url: "/#services"` e o visitante está em `/pt`
- **THEN** a âncora aponta para `/pt#services`, sem barra entre o locale e o hash

#### Scenario: Âncora na raiz a partir de outra rota

- **WHEN** o visitante está em `/en/get-quote` e clica num link do navbar com `url: "/#about-us"`
- **THEN** a navegação termina em `/en` com a secção `#about-us` na viewport

#### Scenario: Query na raiz

- **WHEN** um link do CMS tem `url: "/?ref=nav"` e o visitante está em `/pt`
- **THEN** a âncora aponta para `/pt?ref=nav`

#### Scenario: Âncora sem barra inicial

- **WHEN** um link do CMS tem `url: "#services"`
- **THEN** a âncora aponta para `#services`, sem prefixo

#### Scenario: URL externa

- **WHEN** um link do CMS tem `url: "https://kitenda.paradis.host/"`
- **THEN** a âncora aponta para essa URL, sem prefixo de locale

#### Scenario: Destino mailto

- **WHEN** um link do CMS tem `url: "mailto:hello@paradis.host"`
- **THEN** a âncora aponta para esse `mailto:`, sem prefixo

### Requirement: O locale corrente chega ao navbar por prop

O `Header` SHALL receber o locale como prop, passada pelo `layout.tsx`, tal como já acontece com o `Footer` (`<Footer {...footerData} locale={locale} />`).

O `Header` SHALL NOT obter o locale através de `getLocale()` de `next-intl/server` — evitar imports de next-intl é precisamente o que esta mudança defende, mesmo do lado do servidor.

#### Scenario: Locale propagado

- **WHEN** o layout renderiza o `Header` na rota `/pt`
- **THEN** o `Header` recebe `locale: "pt"` e os seus links são prefixados com `pt`

#### Scenario: Sem import de next-intl no Header

- **WHEN** o módulo do `Header` e os seus imports são inspecionados
- **THEN** não existe import de `next-intl` nem de `@/i18n/navigation`

### Requirement: Os botões do navbar são visíveis em mobile

Os botões do CMS e o switch de idioma SHALL ser visíveis dentro do menu mobile.

O `NavBarButtonWrap` é hoje `hidden gap-3 lg:flex`, e o `NavBarMobileMenu` renderiza `children` duas vezes — na linha desktop e no portal mobile. No portal o wrap continua `hidden`, pelo que os botões do CMS **nunca aparecem em ecrã pequeno**: é o mesmo defeito de "botão sem destino" por outra via, e deixa `/get-quote` inalcançável em telefone.

#### Scenario: Menu mobile aberto

- **WHEN** a página é vista abaixo de 1024px e o menu é aberto
- **THEN** os botões do CMS são visíveis dentro do menu

#### Scenario: Layout em desktop preservado

- **WHEN** a página é vista a partir de 1024px
- **THEN** os botões continuam dispostos em linha na barra, como antes desta mudança

### Requirement: Navegar depois de trocar de idioma mantém o idioma

Depois de o visitante trocar de locale, clicar num link do navbar SHALL mantê-lo nesse locale.

Este requisito é a razão de os links entrarem no mesmo escopo do switch: um switch que funciona seguido de navegação que o desfaz é pior do que não ter switch.

#### Scenario: Trocar e navegar

- **WHEN** o visitante em `/en` troca para `/pt` e depois clica no link "Services" do navbar
- **THEN** chega ao destino no locale `pt`
- **AND** não é devolvido a `en`

### Requirement: Link corrente do navbar

O navbar (desktop e menu mobile) SHALL marcar um único link como corrente, com estas regras por ordem:

1. Um link de secção (com hash, ex.: `/#services`) é corrente quando essa secção é a mais visível na viewport.
2. Com uma secção ativa, nenhum link de página é corrente.
3. Um link de página é corrente quando o pathname é igual ao seu `href`, ou desce dele por segmento inteiro (`/en/products/kitenda` desce de `/en/products`, `/en/products-old` não).
4. A raiz do locale (`/en`, `/pt`) só é corrente por igualdade. Se descesse por segmento, "Home" ficava corrente em todas as páginas.

#### Scenario: Página de detalhe

- **WHEN** o visitante está em `/en/products/kitenda`
- **THEN** "Products" está marcado como corrente e "Home" não

#### Scenario: Prefixo sem fronteira de segmento

- **WHEN** existe uma rota `/en/products-archive` e o visitante está nela
- **THEN** "Products" (`/en/products`) não está marcado

#### Scenario: Raiz do locale

- **WHEN** o visitante está em `/pt/get-quote`
- **THEN** "Home" (`/pt`) não está marcado

#### Scenario: Home com secção ativa

- **WHEN** o visitante está na home com a secção de serviços a meio do ecrã
- **THEN** "Services" é o link corrente e "Home" não
