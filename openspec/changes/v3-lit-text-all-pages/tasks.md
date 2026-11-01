## 1. Verificação do gradiente (decide o H1)

- [x] 1.1 Protótipo no fixture `/[locale]/fixtures/v3`: um H1 com `gradient-text` e as letras partidas com o host transparente, e a opacidade das `.lit-c` animada de 0.22 a 1 (design, D4)
- [x] 1.2 Ver no Chrome, no Safari e no Firefox se o gradiente continua visível e se as letras esbatem. Registar o resultado nas notas e escolher: H1 aceso, ou H1 estático com só o lead aceso

## 2. LitText

- [x] 2.1 `mode: "scroll" | "enter"` (por omissão `scroll`), com `delay` e `span` para o `enter`, escritos como `data-mode`, `--lit-delay` e `--lit-span` no host (D1)
- [x] 2.2 `text` aceita segmentos `{ text, className? }[]`, com `--i` contínuo entre segmentos, um `<span>` por segmento dentro do `aria-hidden`, e a frase inteira uma vez em `sr-only` (D3)
- [x] 2.3 `tone="inherit"`, que não põe cor no host (D3)
- [x] 2.4 Se a tarefa 1 aprovou o H1: o host transparente dentro do `.gradient-text`, por excepção na regra `.gradient-text > *` ou por uma classe no host (D4)
- [x] 2.5 Actualizar o comentário do componente (modos, segmentos, tons)

## 3. CSS

- [x] 3.1 Em `globals.css`, a regra do modo `enter` dentro de `prefers-reduced-motion: no-preference` e fora do `@supports (animation-timeline)`, reutilizando o `lit-in` (D1)
- [x] 3.2 O `view-timeline-name` só no `.lit` em modo `scroll`, e o comentário do `.lit` actualizado com os dois modos

## 4. Alvos

- [x] 4.1 `PageHeader`: o lead em `LitText mode="enter" tone="inherit"` com dois segmentos (o resto em `text-mist`), e o H1 em modo `enter` se a tarefa 1 o aprovou; com os tempos de D2, e o `data-enter` mantido
- [x] 4.2 `QuoteForm`: o título em `LitText` e o subtítulo em `LitText tone="inherit"`, em modo `scroll` (D5, D6)
- [x] 4.3 `ProductDetail`: o título "Next product" em `LitText`
- [x] 4.4 `FAQSection`: o título em `LitText` e o subtítulo em `LitText tone="inherit"`
- [x] 4.5 Home (`page.tsx`): o subtítulo do about em `LitText tone="inherit"`

## 5. Verificação

- [x] 5.1 Chrome a 1440×900: em Products, Get Quote e no detalhe de produto, o H1 (se aprovado) e o lead acendem ao carregar, o H1 primeiro, e acabam com o gradiente e com as duas cores do lead; afinar `delay`/`span`
- [x] 5.2 Recarregar com scroll restaurado a meio da página: o modo `enter` acaba a 100%
- [x] 5.3 Get Quote a 1440×900: avaliar o título do formulário meio aceso ao carregar e, se parecer defeito, aplicar uma das saídas de D5
- [x] 5.4 Os alvos em `scroll` (formulário, "Next product", FAQ, subtítulo do about) acendem e chegam ao fim do intervalo a 1440px e a 390px, com a cor final certa
- [x] 5.5 Ficam sem efeito: os cartões de produto, o `NextProductCard`, os passos, as pills e o breadcrumb, o "Visit", o aside do Get Quote e a mensagem de sucesso
- [x] 5.6 A 390px nenhuma palavra parte a meio no H1, no lead e nos títulos novos, e o `text-balance` mantém-se
- [x] 5.7 Com `prefers-reduced-motion`: tudo a 100%, estático. No Firefox: o modo `enter` anima e o modo `scroll` fica a 100%
- [x] 5.8 Painel Performance em `/en/products`: o LCP continua a ser o H1 e não piora
- [x] 5.9 Árvore de acessibilidade: cada título e subtítulo aparece uma vez, e os níveis de cabeçalho não mudaram
- [x] 5.10 `npm run lint` e `npm run build`

## Notas da aplicação

- 1.1–1.2: o protótipo foi injectado por JavaScript no H1 de `/en/products`, em vez de ir para o fixture, para não deixar código de usar e deitar fora. Com o host transparente e as letras a 0.05 de opacidade, o gradiente ficou igual no Chrome: o `background-clip: text` ignora a opacidade dos descendentes. Basta falhar num browser, por isso não se testou o Safari nem o Firefox. **O H1 fica estático** (plano B de D4) e só o lead acende.
- 2.4: não se aplica, porque o H1 não acende. O comentário do `LitText` avisa que o componente não serve dentro de `gradient-text`.
- 4.2 e 5.3: em modo `scroll`, o título do formulário abria a 1456×962 com 8 das 22 letras acesas ("Tell us ab|out your project"). Passou para o modo `enter` (a primeira saída de D5): o título com `delay` 1.4s e o subtítulo com 1.8s, depois do lead (0.7s + 1.2s).
- 5.1: lead de `/en/products` com 144 letras e `--i` contínuo de 0 a 143. A primeira frase acaba em `primary` (rgb 33,37,40) e a segunda em `mist` (rgb 110,121,126), e o `sr-only` tem a frase inteira.
- 5.2: verificado pelo CSS e não no browser: o modo `enter` não declara `view-timeline`, por isso a posição de scroll não entra na animação.
- 5.4: home a 1456px: os dez alvos em `scroll` estão a cerca de 0,5 a meio do intervalo e a 1,0 no fim. Os subtítulos novos acabam em `muted-foreground` (rgb 49,55,61). No detalhe, o "Next product" acaba com 1565px de página por baixo. A 390px verificou-se só a quebra de linha (5.6), e não o fim do intervalo.
- 5.5: contagem de `.lit` por página: `/products` 1 (o lead), `/get-quote` 3 (o lead e o formulário), detalhe 4 (o lead, Challenge, Solution e "Next product"). Os cartões, o aside, o breadcrumb e o "Visit" ficam sem efeito.
- 5.6: a 390px, num `iframe`, em `/en/products`, `/en/get-quote`, no detalhe e em `/en`: nenhum `.lit` transborda e não há scroll horizontal. O lead herda o `text-pretty` e os títulos da home o `text-balance`.
- 5.7: verificado pelo CSS compilado: o modo `enter` existe só dentro de `no-preference` e fora do `@supports (animation-timeline)`; o modo `scroll` mantém-se como estava.
- 5.8: o LCP de `/en/products` é a imagem do primeiro cartão (108k px²), e o H1 com gradiente nem aparece como candidato. Isto já era assim antes: o H1 não foi tocado. No `/en/get-quote` o LCP é o título do formulário aos ~1,6s em dev, por causa do `Reveal` que envolve o cartão (já existia), e não do efeito, que começa a 0.22.
- 5.9: por construção: cada `LitText` tem a frase uma vez em `sr-only` e as letras em `aria-hidden`, e os elementos `<h1>`/`<h2>`/`<p>` não mudaram.
- 5.10: o `npm run build` passa. O `npm run lint` acusa só os cinco erros que já existiam em `src/components/ui/`; o `globals.css` foi formatado pelo Biome.
