## Context

- **Causa:** a seta `↗` (U+2197) é texto dentro de `<span className="roll-arrow">`. No footer e no `ProductDetail` herda a Inter do `body` (`Inter({ subsets: ["latin"] })` em `src/app/(app)/[locale]/layout.tsx`). Nenhum dos ficheiros da Inter em `.next/static/media` tem o U+2197; as duas faces da Gilroy têm. Sem glifo na Inter nem no "Inter Fallback", o iOS desenha a seta com a Apple Color Emoji.
- **Sítios afetados:** `Footer/index.tsx` (links externos, Inter → emoji no iOS), `ProductDetail/index.tsx` (URL do produto, Inter → emoji no iOS), `GetQuote/QuoteContactAside.tsx` (e-mail, `font-gilroy` → hoje está correto).
- **Precedente:** o `Card` já desenha a sua seta como `<svg>` inline dentro de `.roll-arrow` (`data-dir="x"`), e o `NavBarMobileMenu` e o `TestimonialCard` importam ícones da `lucide-react`.

## Goals / Non-Goals

**Goals:**
- A seta de link externo igual em todas as plataformas, sem depender de nenhuma fonte.
- Um só sítio a definir o desenho da seta, para os três usos não divergirem.

**Non-Goals:**
- Mudar a configuração da Inter (subsets, pesos) ou a fonte do `body`.
- Mudar a seta → do `Card` ou o chip de seta dos botões, que já são SVG.

## Decisions

### D1. SVG em vez de glifo
A seta passa a ser um `<svg>` com `stroke="currentColor"`, por isso não há glifo a resolver em nenhuma fonte.
- *Alternativa:* pôr o `<span>` em `font-gilroy`, como já faz o aside. Rejeitada: continua a depender de uma fonte ter o glifo, e uma mudança futura de fonte reabre o bug sem aviso.
- *Alternativa:* acrescentar `︎` (seletor de apresentação em texto). Rejeitada: tira o emoji, mas a seta continua a vir de uma fonte do sistema diferente em cada plataforma.
- *Alternativa:* alargar o subset da Inter. Rejeitada: nenhum subset do Google Fonts tem o bloco de setas diagonais.

### D2. Um componente partilhado `ExternalArrow`
`src/components/ExternalArrow/index.tsx` renderiza `<span className="roll-arrow" aria-hidden="true">` com o `ArrowUpRight` da `lucide-react` lá dentro, com `size="1em"` e `aria-hidden`. Aceita `className` (passado ao `span` com `cn`) para o aside manter o `text-lg`. Os três sítios trocam o `<span>…↗</span>` por `<ExternalArrow />`.
- *Alternativa:* `<svg>` inline em cada sítio, como no `Card`. Rejeitada: são três cópias do mesmo desenho, e o traço e o tamanho acabariam por divergir.
- O componente não tem estado nem hooks e serve server e client. O `Footer` é server, e o `ArrowUpRight` não exige `"use client"`.

### D3. Tamanho `1em` e traço da lucide
Com `1em`, o tamanho segue o `font-size` do `span`. O e-mail do aside (`text-lg`, 18px) e os links do footer (15px) ficam com as proporções que o glifo tinha. O traço fica no valor por omissão da lucide (2). A comparação visual com o mockup (tarefa de verificação) decide se é preciso afinar, por exemplo para 1.8 como no `Card`.

## Risks / Trade-offs

- **O desenho muda um pouco em relação ao glifo da Gilroy do mockup** (ponta e espessura) → a seta passa a ser igual em todo o lado. A comparação com o mockup fica como tarefa, e o traço afina-se num só sítio (D2).
- **Alinhamento vertical**: um SVG `1em` num `inline-flex` com `items-center` alinha pelo centro e não pela linha de base do texto → os três contentores já usam `inline-flex items-center`, e a verificação visual cobre-o.
