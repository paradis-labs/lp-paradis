## Context

- A galeria vive no `ProductDetail` (server component), como uma grelha de `<div data-cursor-text="View">` com `next/image` `fill`. A primeira imagem ocupa as duas colunas. Os dados são `product.gallery: Media[]` (`url`, `alt`, `width`, `height`).
- O scroll suave é o Lenis (`SmoothScroll`, `lenis/react`), conduzido pelo frameloop do Motion. O `useLenis()` dá a instância a qualquer componente dentro do `ReactLenis`.
- O `radix-ui` (umbrella) já é dependência e inclui o `Dialog`, que trata do foco preso, do `Esc`, do `aria-modal`, do `aria-hidden` no resto da página e do retorno do foco. O bloqueio de scroll dele (`react-remove-scroll`) trava o scroll nativo, mas o Lenis não respeita esse bloqueio.
- O cursor dá prioridade a `[data-cursor-text]`, por isso trocar o `<div>` por `<button>` mantém o "View".

## Goals / Non-Goals

**Goals:**
- Ver cada imagem inteira, navegar entre elas e fechar, com teclado, foco e leitores de ecrã correctos.
- Não mexer no HTML de servidor da grelha mais do que trocar `<div>` por `<button>`.

**Non-Goals:**
- Swipe por gesto, zoom com pinça ou pan na imagem. As setas e os botões chegam por agora.
- Legendas a partir do hcms (não há campo para isso).
- Usar o lightbox noutras páginas.

## Decisions

### D1. A ilha de cliente é a galeria inteira, e o servidor passa os dados

`GalleryLightbox` (`"use client"`) recebe `shots: Media[]`, `title` e `locale`, e renderiza a grelha (os `<button>` com `next/image`, as mesmas classes de hoje) e o `Dialog`. O `ProductDetail` troca o `.map` por `<GalleryLightbox …/>` dentro do `Reveal`.

- *Alternativa: grelha no servidor, e só o diálogo no cliente, com `onClick` delegado por `data-index`.* Pouparia hidratar os `<button>`, mas o `Dialog.Trigger` e o retorno do foco precisam de refs para os botões. Fazê-lo à mão é reimplementar o que o Radix dá. A grelha tem poucas imagens, e o HTML continua a vir prerenderizado de qualquer forma.
- *Alternativa: biblioteca de lightbox (`yet-another-react-lightbox`).* É uma dependência nova para um caso que o `Dialog` cobre quase todo.

### D2. Radix `Dialog`, controlado por um índice

O estado é `index: number | null` (`null` = fechado), com `Dialog.Root open={index !== null}`. O retorno do foco ao fechar é feito em `onCloseAutoFocus`: `preventDefault()` e foco no botão `refs[index]`, para o foco voltar à imagem **visível** e não à que abriu (cenário "Esc depois de navegar"). As setas do teclado são tratadas num `onKeyDown` do `Dialog.Content`, com `(i ± 1 + n) % n`.

O nome acessível do diálogo vem de um `Dialog.Title` visualmente escondido com o título do produto. O contador e os botões têm rótulos localizados (`Record<Locale, …>`, a convenção do repo).

### D3. O Lenis é parado enquanto o diálogo está aberto

Um efeito chama `lenis?.stop()` quando `index !== null` e `lenis?.start()` no cleanup. O `react-remove-scroll` do Radix fica activo para o scroll nativo e o toque. Os dois juntos cobrem a roda, o touchpad e o toque.

- *Alternativa: `data-lenis-prevent` no conteúdo do diálogo.* Isso só impede o Lenis de tratar eventos **dentro** do elemento. A roda sobre o overlay continuava a rolar a página.

### D4. Imagem e animação

- No lightbox, a imagem é `next/image` com o `width`/`height` do `Media` e `h-auto w-auto max-h-full max-w-full`, `sizes="100vw"`, centrada num palco flex. Na implementação substituiu o `fill` previsto: com `fill` a caixa da imagem ocupava o palco inteiro, e um clique ao lado da foto caía no letterbox da imagem e não fechava. Sem `priority`: só carrega ao abrir. Ao abrir, o `src` da grelha já está em cache para a variante pequena, e a variante grande carrega depois.
- A animação usa CSS sobre os `data-state` do Radix (`data-[state=open]:animate-…`), com fade e escala de 0.96 → 1 em 200–250 ms com `--ease-soft`. A troca de imagem é um fade com `key={index}`. `motion-reduce:animate-none`, para não puxar o `motion` para o chunk.

### D5. O chunk só vai para a rota do detalhe

Basta o `GalleryLightbox` ser importado só pelo `ProductDetail`. O Next divide o código de cliente por rota. Não é preciso `dynamic()`, porque a grelha tem de estar no HTML inicial.

## Risks / Trade-offs

- [A grelha passa a hidratar no detalhe] → Poucas imagens, sem estado por frame. Verificar o chunk no build (`client-bundle-budget`).
- [O `aria-hidden` do Radix no resto da página e o cursor personalizado] → O cursor é `aria-hidden` e `pointer-events: none`, e fica acima do overlay (`z-index: 9999`), por isso continua a seguir o rato dentro do lightbox. Os botões do lightbox põem-no em modo `button`, com tom `light` declarado no `Dialog.Content` (fundo escuro).
- [O scroll horizontal de largura de barra ao bloquear o scroll] → O `react-remove-scroll` compensa a largura da barra. Verificar que o header fixo não salta.
- [O `onCloseAutoFocus` com o ref de um botão que entretanto saiu do DOM] → A galeria não muda enquanto o diálogo está aberto. Usar um fallback para o comportamento por omissão se o ref for nulo.

## Open Questions

- Nenhuma que bloqueie. O swipe em mobile fica para uma change seguinte, se for pedido.
