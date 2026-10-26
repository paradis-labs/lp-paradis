## MODIFIED Requirements

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
