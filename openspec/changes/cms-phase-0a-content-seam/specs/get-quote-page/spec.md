## MODIFIED Requirements

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
