## Why

O disco do cursor é sólido nos modos `button` e `text`: sobre um botão tapa o rótulo, e sobre uma capa tapa 80 px da imagem. Ao mesmo tempo, duas capas prometem um clique que não existe: a capa do `Card` da home (cursor "Explore" e chip de seta ↗) e a capa do detalhe do produto (cursor "Explore"). O clique em nenhuma delas faz nada, e o único caminho é o link por baixo ou o botão "Visit" por cima.

## What Changes

- O disco do cursor fica translúcido nos modos `button` (≈0.6) e `text` (≈0.85). A opacidade aplica-se só ao disco: o rótulo do modo `text` ("Explore", "View") continua opaco.
- A capa do `Card` da home passa a ser clicável, com o mesmo destino do "Discover More" do cartão: o detalhe quando o projecto tem slug, o site do projecto num separador novo quando não tem.
- A capa do detalhe do produto passa a ser clicável e leva a `product.url` num separador novo, como o botão "Visit".
- As capas ligadas são só para o rato: o teclado e os leitores de ecrã continuam a ter um único link por destino (o "Discover More" e o "Visit").
- Fica de fora: a galeria do detalhe ("View"), que ganha um lightbox na change `v3-product-gallery-lightbox`.

## Capabilities

### New Capabilities
- `clickable-covers`: uma capa que mostra um cursor de acção ("Explore") leva ao destino do seu produto, sem duplicar o link para teclado e leitores de ecrã.
- `cursor-disc-translucency`: o disco do cursor é translúcido sobre botões e capas, e o rótulo continua legível.

### Modified Capabilities
<!-- Nenhuma em `openspec/specs/`. `cursor-hover-tone` ainda está na change aberta `v3-cursor-hover-tone`, e o tom não muda: muda só a opacidade do disco. -->

## Impact

- **Código**: `src/app/(app)/globals.css` (`.cursor-dot` nos modos `button` e `text`), `src/components/Card/index.tsx`, `src/components/ProductDetail/index.tsx` (a capa sob o `PageHeader`).
- **Sem mudanças** em conteúdo, hcms, dependências, `Cursor.tsx` ou no custo de runtime do cursor.
- **Coordenação**: a regra `.cursor-dot[data-mode="button"]::before` é a mesma que `v3-cursor-hover-tone` alterou (a transição de 500 ms), e esta change acrescenta-lhe a opacidade.
