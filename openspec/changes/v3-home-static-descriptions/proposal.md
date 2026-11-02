## Why

Na home, as descrições (os subtítulos por baixo dos títulos) acendem letra a letra com o scroll (`LitText`). Num parágrafo de duas ou três linhas o efeito deixa o texto meio cinzento enquanto se lê, e pediu-se que as descrições da home fiquem estáticas. O mockup v3 (`MainV3.dc.html`) também não as anima, e dá-lhes cores fixas: `#31373d` no about e no FAQ, branco a 64% no painel escuro.

Hoje o painel escuro está ainda fora da cor do mockup: `v3-section-heading-lit` pôs o subtítulo a acabar a branco a 100% e tirou o `text-white/64`.

## What Changes

- **Os subtítulos da home deixam de acender**: o about, os três cabeçalhos do painel escuro (Services, Products, Testimonials, via `SectionHeading`) e o FAQ. Ficam texto estático, a opacidade total desde o primeiro frame.
- **BREAKING** (visual): **o subtítulo do `SectionHeading` volta a branco a 64%** (`rgba(255,255,255,0.64)`, o do mockup), em vez do branco a 100% de `v3-section-heading-lit`.
- O about e o FAQ mantêm a cor que já têm, `muted-foreground` (`#31373d`), que é a do mockup.
- **Os títulos não mudam**: o título do about, os três títulos do painel escuro e o título do FAQ continuam a acender com o scroll. É a leitura literal do pedido ("as descrições"); o mockup só anima o título do about, e alinhar os outros títulos com ele fica para outro change, se se quiser.
- Fora da home nada muda: o lead do `PageHeader`, o desafio e a solução do detalhe de produto, o "Next product" e o formulário do Get Quote continuam com o efeito.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `section-heading-lit-text`: só o título acende; o subtítulo fica estático a branco a 64%, e o requisito "O subtítulo acaba branco" sai.
- `site-wide-lit-headings`: na lista de alvos em modo `scroll` saem o subtítulo do about e o subtítulo do FAQ; o título do FAQ fica.

## Impact

- **Código:** `src/components/SectionHeading/index.tsx` (subtítulo sem `LitText`, com `text-white/64`), `src/app/(app)/[locale]/(pages)/page.tsx` (subtítulo do about) e `src/components/FAQSection/index.tsx` (subtítulo do FAQ). `LitText` e `.lit` em `globals.css` não mudam: continuam a servir os títulos e as outras páginas.
- **DOM:** menos umas centenas de `<span>` na home (um por carácter das cinco descrições), e o texto deixa de ter uma cópia `sr-only` separada.
- **Sem impacto** no hcms, nos tipos de conteúdo nem na cache.
