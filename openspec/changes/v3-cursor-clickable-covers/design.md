## Context

- O cursor (`Cursor.tsx`) dá prioridade a `[data-cursor-text]` sobre `a`/`button`. Uma capa com `data-cursor-text` dentro de um `<a>` continua, portanto, em modo `text`.
- Em `globals.css`, o `::before` do `.cursor-dot` tem opacidade 1 em `button` e `text`, e 0.16 em `link`. O rótulo é um `<span>` irmão do `::before`.
- O `Card` (`src/components/Card/index.tsx`) recebe `anchor: { href, external, label, newTabHint }` e renderiza o "Discover More" como `<Link>` (interno) ou `<a target="_blank">` (externo). A capa é um `<div data-cursor-text>` com o chip ↗, sem link.
- No `ProductDetail`, a capa é um `<Reveal grow cursorText="Explore">` com a imagem `priority`. O botão "Visit" (`product.url`, `openInNewTab`) está no `PageHeader`, logo acima.

## Goals / Non-Goals

**Goals:**
- O disco deixa ver o que está por trás, sem perder contraste nem tornar o rótulo ilegível.
- Cada capa com "Explore" leva a algum lado, e leva ao mesmo sítio que o link visível ao lado.

**Non-Goals:**
- O lightbox da galeria (`v3-product-gallery-lightbox`).
- Tornar o cartão inteiro clicável, ou mudar o `ProductCard`/`NextProductCard`, que já são âncoras inteiras.

## Decisions

### D1. A opacidade é posta no `::before`, por modo

```css
.cursor-dot[data-mode="button"]::before { transform: scale(0.4); opacity: 0.6; /* + transição de v3-cursor-hover-tone */ }
.cursor-dot[data-mode="text"]::before   { transform: scale(1);   opacity: 0.85; }
```

A `opacity` já está na lista de `transition` do `::before` (0.35 s), por isso a mudança de modo anima sem regra nova. O rótulo não é tocado.

- *Alternativa: cor com alfa (`rgb(… / .6)`).* Faria o mesmo, mas obrigava a duplicar as cores dos dois tons. A `opacity` é uma linha por modo.
- *Alternativa: `backdrop-filter: blur`.* Rejeitada: recompõe a página a cada frame enquanto o disco se move, o mesmo motivo por que o `mix-blend-difference` saiu.

### D2. Capa ligada = âncora irmã escondida a tecnologias assistivas

No `Card`, o `<div>` da capa passa a ser o elemento de link (`Link` ou `<a target="_blank" rel="noopener noreferrer">`, pela mesma bifurcação de `anchor.external`), com `tabIndex={-1}` e `aria-hidden="true"`, e mantém `data-cursor-text`, `group/cover` e as classes. A bifurcação passa a ser partilhada pela capa e pelo "Discover More": um componente local `CardAnchor` (ou uma função) que recebe `className`/`children` e escolhe `Link` ou `<a>`, para os dois links nunca divergirem de destino.

- *Alternativa: stretched link (`after:inset-0` no "Discover More").* Cobriria o texto da descrição, que deixaria de se poder seleccionar, e o cursor "Explore" não apareceria sobre o texto, criando uma zona clicável sem sinal.
- *Alternativa: cartão inteiro como âncora (como o `ProductCard`).* O `Card` tem o "Discover More" como link visível, e um link dentro de outro link é inválido.

`aria-hidden` num elemento focável é um erro quando o elemento pode receber foco. Com `tabIndex={-1}`, só recebe foco por clique, e o foco por clique numa âncora navega logo. É o padrão aceite para "link redundante de rato".

### D3. A capa do detalhe é a mesma ideia, à volta da imagem

O `Reveal` continua a ser o invólucro, porque é ele que faz o `grow`. Dentro dele, a imagem passa a estar numa `<a href={product.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className="absolute inset-0 …">`, e o `cursorText` continua no `Reveal`. O link acessível é o "Visit".

- *Alternativa: passar `href` ao `Reveal`.* Alargaria a API de um componente de animação só para isto.

## Risks / Trade-offs

- [Opacidade 0.6 sobre um botão de cor média pode baixar o contraste do disco] → Os botões só têm `#212528` e branco. 0.6 sobre o painel contrário mantém o disco nítido. A afinação fica na verificação (tarefa 3).
- [Utilizadores de leitor de ecrã que usam também o rato ouvem só o "Discover More"] → É o comportamento pretendido: um destino, um nome.
- [Uma `priority` image dentro de um `<a>`] → Sem efeito no LCP. A imagem continua a ser a mesma.

## Open Questions

- Nenhuma que bloqueie. Os valores 0.6/0.85 fecham-se a olho.
