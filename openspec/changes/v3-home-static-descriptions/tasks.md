## 1. Descrições estáticas

- [x] 1.1 `SectionHeading`: o subtítulo passa a texto directo no `<p>`, sem `LitText`, com `text-white/64` (design, D1–D2); o título, a pill, os `children` e o `Reveal` ficam como estão
- [x] 1.2 `SectionHeading`: actualizar o comentário do componente (só o título acende; o subtítulo é estático a branco a 64%, como no mockup)
- [x] 1.3 Home (`page.tsx`): o subtítulo do about passa a texto directo no `<p>`, mantendo `text-muted-foreground` (D3); o título fica com `LitText`
- [x] 1.4 `FAQSection`: o subtítulo passa a texto directo no `<p>`, mantendo `text-muted-foreground`; o título fica com `LitText`

## 2. Verificação

- [x] 2.1 Chrome a 1440px: os cinco subtítulos (about, Services, Products, Testimonials, FAQ) estão a opacidade total desde o primeiro frame, e os títulos continuam a acender
- [x] 2.2 Cores calculadas contra o mockup v3: about e FAQ `#31373d` (`rgb(49, 55, 61)`), os três subtítulos do painel `rgba(255, 255, 255, 0.64)`
- [x] 2.3 Os subtítulos não têm `.lit` nem `<span>` por letra; a árvore de acessibilidade lê cada subtítulo uma vez
- [x] 2.4 A 390px os subtítulos quebram normalmente e os títulos mantêm o `text-balance`
- [x] 2.5 Fora da home nada mudou: o lead do `PageHeader`, o desafio/solução e o "Next product" do detalhe, e o formulário do Get Quote continuam a acender
- [x] 2.6 `npm run lint` e `npm run build`

## Notas da aplicação

- 2.1–2.2: medido em `/pt` no build de produção. Os cinco subtítulos têm opacidade 1 e nenhum `.lit-c`; cores calculadas `rgb(49, 55, 61)` no about e no FAQ, e branco com alfa 0,64 (`oklab(1 0 0 / 0.64)`) nos três do painel. Os cinco títulos continuam com `.lit`.
- 2.3: cada subtítulo é um `<p>` sem filhos, só com o texto, por isso é lido uma vez e não há cópia `sr-only`.
- 2.4: a 390px (num `iframe`) nenhum subtítulo transborda; os quatro títulos com `text-balance` mantêm-no (o do FAQ já não o tinha).
- 2.5: `/pt/products` 1 `.lit` (lead), `/pt/get-quote` 3 (lead, título e subtítulo do formulário), `/pt/products/kitenda` 4 (lead, desafio, solução, "Next product"): sem mudanças.
- 2.6: o `npm run lint` acusa os mesmos 5 erros de `src/components/ui/` que já existiam sem este change; os três ficheiros tocados passam. O `npm run build` passa.
