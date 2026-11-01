## Context

- **Referência:** o canvas "Paradis Landing Page" (artifact `DQQj4ga6FourZQZHYjbqm3`), artboards `MainV3`, `Products`, `GetQuote` e `Product*`. As medidas citadas vêm do CSS dos artboards: a `.pad-x` (`@media (max-width:1279px)` → 24px, `(max-width:767px)` → 20px), a `.work-head`/`.pd-head`/`.q-head` e as `.work-h1`/`.pd-h1`/`.q-h1`.
- **Estado atual:** a comparação de 2026-11-01 (quatro análises, uma por página) encontrou as secções todas no sítio. As diferenças que se repetem são as desta change:
  - **Margens:** `px-3 md:px-4 xl:px-0` em `ProductsListing` (:23, :35), `ProductDetail` (:280, :359) e `GetQuote` (:154). Na home (`page.tsx:56`) o contentor do about tem `px-3 md:px-4` e o bloco `px-5 md:px-6`. No footer, `FOOTER_GUTTER = "px-6 sm:px-10 lg:px-14 xl:px-0"`. `ProductDetail:172` e o FAQ da home (`page.tsx:137`) já estão a 20/24px.
  - **`PageHeader`** (:47, :76-81): `md:px-10 … xl:px-20`, `max-w-205`, `gap-8` e `text-[40px] md:text-[56px] lg:text-[72px]`.
  - **Capas:** `Card` (`bg-white/4`), `ProductCard` e `ProductDetail` (`bg-primary`).
  - **Navbar:** `isNavLinkActive` (`NavActiveContext.tsx:29-36`) compara `link.href === pathname`, por igualdade de propósito.
  - **Ícones:** o `Button` recebe `trailingIcon: React.ComponentType<IconProps>` (o tipo da Solar) e passa `size={18}` no disco ou só `iconProps` fora dele. O `ExternalArrow` já resolveu a seta `↗` com um componente decorativo.
- **Restrições:** não há test runner. A verificação faz-se nas fixtures de dev, na comparação visual e com `npm run lint` e `npm run build`. Há trabalho por commitar das changes v3 anteriores nos mesmos ficheiros.

## Goals / Non-Goals

**Goals:**
- Fechar, uma vez e em peças partilhadas, as diferenças que se repetem entre o canvas e as quatro páginas.
- Deixar estas medidas num sítio só, para `v3-finish-pages` não as voltar a tocar.

**Non-Goals:**
- Lacunas específicas de página: os cartões da home para `/products/<slug>`, o zoom das capas na home, o título de sucesso do get-quote, as alturas da capa e da galeria do detalhe.
- Campos novos no hcms: os ícones dos passos, o nome curto do "Visit" e o poster do vídeo.
- Os desvios assumidos ao canvas: letras acesas a mais, subtítulos escuros a 100%, testemunhos em movimento, H1 sem fade, hover do marquee, validação do get-quote.
- O padding do hero da home e os contentores do painel escuro, que já seguem o canvas.

## Decisions

### D1. Um utilitário `gutter` em `globals.css`
A regra é `px-6 max-md:px-5 xl:px-0`, isto é 24 → 20 abaixo de 768 → 0 a partir de 1280 (o `container` centra), definida como `@utility gutter` ao lado do `@utility container`. Cada contentor da lista troca a sua combinação de classes por `gutter`, e o `FOOTER_GUTTER` passa a ser `gutter`.
- *Alternativa:* corrigir as classes em cada componente. Rejeitada: foi assim que as margens divergiram, porque cada página escolheu os seus números.
- *Alternativa:* pôr a margem dentro do `@utility container`. Rejeitada: o `container` também é usado em sítios que têm padding próprio (o painel escuro, o hero), e mudá-lo arrasta-os.
- No about da home, o contentor exterior perde a margem e o bloco (o `pad-x` do canvas, com padding de 40px em desktop) passa a `gutter` abaixo de `xl`. Assim, a soma deixa de dar 32/40px.

### D2. O `PageHeader` segue o `.work-head` e o `.pd-head`
- Padding `px-5 py-10` abaixo de `md`, e `md:px-20 md:pt-22 md:pb-18` a partir dele (o `xl:px-20` deixa de ser preciso).
- Coluna `max-w-250` (1000px), separação `lg:gap-10`.
- H1 `text-[40px] md:text-[56px] lg:text-[72px]`. A escala já é esta, porque `md` = 768 e `lg` = 1024 coincidem com os cortes do canvas (767/1023). A análise do get-quote viu 52/38 porque esse artboard é o único que desenha assim. Fica 56/40: duas páginas contra uma, e o componente é um só.
- *Alternativa:* uma prop para a escala do get-quote. Rejeitada: diferença de 4px num só artboard, sem intenção visível no design.

### D3. Token `cover-ground`
`--cover-ground: #5a5b5d` em `:root`, com `--color-cover-ground: var(--cover-ground)` em `@theme inline`, ao lado de `cloud` e `haze`. As quatro capas de produto passam a `bg-cover-ground`: o cartão da home, o da listagem, a capa do detalhe e a do "Next product". A galeria do detalhe fica em `bg-primary`, que é o `#212528` do artboard. O nome descreve o papel e não a cor, como os outros tokens.
- O nome `cover` foi descartado: `bg-cover` já é a utility `background-size: cover` do Tailwind v4.

### D4. Link corrente por segmento, com exceção para a raiz
`isNavLinkActive` mantém as duas regras de hoje (secção ativa ganha; link de página só sem secção ativa) e troca a igualdade por:

```
active = pathname === href
      || (!isLocaleRoot(href) && pathname.startsWith(href + "/"))
```

`isLocaleRoot` é verdadeiro quando o `href` tem um só segmento (`/en`). O comentário atual, que explica a igualdade, passa a explicar a exceção. A função é pura e já é partilhada pelo desktop e pelo menu mobile, por isso a mudança cobre os dois.
- *Alternativa:* uma lista de prefixos por link no CMS. Rejeitada: é configuração para um caso que a estrutura das rotas já resolve.

### D5. Ícones de traço num módulo `Glyphs`
Um ficheiro `src/components/Glyphs/index.tsx` exporta `ArrowDownRight`, `ArrowUpRight`, `ArrowRight` e `Bulb` (este com `filled`). Cada um é um SVG `viewBox="0 0 24 24"`, `stroke="currentColor"`, `strokeLinecap/Join="round"`, `aria-hidden`, e aceita `size` e `className`. Assim os tipos encaixam no `trailingIcon` do `Button` sem mudar o `Button`. Como os glifos aceitam um subconjunto das `IconProps` da Solar, o tipo da prop (`React.ComponentType<IconProps>`) aceita-os sem alteração. O módulo é `"use client"`, como a Solar: as páginas (server) passam o componente ao `Button` (client) como prop, e só uma referência de cliente atravessa essa fronteira. O build falhava sem isso.
- A espessura é a dos artboards: 2px nas três setas e 1,5px na lâmpada. Fica fixa por glifo, e não é uma prop por chamada.
- O tamanho por omissão é `1em`, o mesmo da Solar, para nada mudar fora do disco (onde o `Button` passa `size={18}`).
- O `ExternalArrow` passa a usar o `ArrowUpRight` daqui em vez do `lucide-react`. É o mesmo desenho, e fica uma só fonte para as setas.
- *Alternativa:* um sprite SVG. Rejeitada: são quatro glifos, todos inline e server-renderable.
- `fixtures/buttons` troca a Solar pelos glifos novos, para ser o sítio onde se veem todos.

## Risks / Trade-offs

- **Trabalho por commitar das changes v3 nos mesmos ficheiros** → esta change parte do estado atual da árvore. As tarefas citam classes e não números de linha, e o primeiro passo é confirmar que as classes ainda lá estão.
- **`bg-cover` ambíguo** → D3 tem o nome alternativo, e a escolha confirma-se pelo CSS gerado.
- **Margens mais largas no telefone (12 → 20px)** → os cartões da listagem e o formulário ficam 16px mais estreitos a 390px. É o que o canvas desenha, mas confirma-se que nada transborda (`responsive-content-fit`).
- **A prefixação pode marcar links inesperados** se um editor authorar um link de página que é prefixo de outro (`/en/p` e `/en/products`) → a fronteira de segmento (`href + "/"`) impede-o.

## Migration Plan

Sem migração: é só código de apresentação, sem hcms, cache nem tipos de conteúdo. O rollback é reverter o merge.

## Open Questions

Nenhuma. A espessura do traço, que estava em aberto, ficou decidida pelos artboards (D5).
