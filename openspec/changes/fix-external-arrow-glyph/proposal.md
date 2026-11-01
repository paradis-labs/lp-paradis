## Why

No iPhone, a seta `↗` dos links externos do footer aparece como emoji. A seta é o caractere U+2197 e herda a Inter do `body`. A Inter vem de `next/font/google` com `subsets: ["latin"]`, e nenhum dos ficheiros servidos tem esse glifo (verificado em `.next/static/media`). O "Inter Fallback" (Arial) também não o tem. O browser recorre então à fonte do sistema: no macOS é uma fonte de texto, e por isso o problema não se vê no desktop, mas no iOS é a Apple Color Emoji, porque o U+2197 tem a propriedade Unicode `Emoji=Yes`. O mockup não mostra o problema porque a máquina de quem o vê tem a Inter completa instalada.

## What Changes

- A seta de link externo passa a ser um ícone vetorial inline (o desenho do `ArrowUpRight` da lucide) e deixa de ser um caractere. Fica igual em todas as plataformas e não depende de nenhuma fonte.
- Muda nos três sítios que hoje usam o glifo: os links externos do footer, o URL do produto em `ProductDetail` e o e-mail do aside da get-quote. O aside já funciona por estar em Gilroy, mas muda para os três ficarem iguais.
- A animação do hover (`.roll-arrow`, só `transform`) e o tratamento decorativo (`aria-hidden`, nome acessível = rótulo) não mudam.
- O tamanho do ícone segue o `font-size` do contexto (`1em`), por isso o `text-lg` do aside continua a definir o tamanho.

## Capabilities

### New Capabilities
- `external-link-arrow`: a seta de link externo é um ícone vetorial, igual em todas as plataformas, nunca um glifo de fonte nem um emoji. Aplica-se a todos os sítios que a mostram.

### Modified Capabilities
<!-- Nenhuma: `footer-link-semantics` exige "a seta ↗ do mockup" e que ela seja decorativa. As duas coisas continuam verdade, só muda a forma de a desenhar. -->

## Impact

- **Código**: `src/components/Footer/index.tsx`, `src/components/ProductDetail/index.tsx`, `src/components/GetQuote/QuoteContactAside.tsx`, e um componente partilhado novo para o ícone (ou o `ArrowUpRight` da `lucide-react`, que já é dependência).
- **Sem mudanças** em conteúdo, hcms, leituras ou CSS (`.roll-arrow` continua igual).
- **Fontes**: a configuração da Inter não muda. Alargar o subset não resolveria, porque nenhum subset do Google Fonts tem as setas diagonais.
