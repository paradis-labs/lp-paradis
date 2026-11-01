## 1. Cursor

- [x] 1.1 Em `src/app/(app)/globals.css`, dar `opacity: 0.6` a `.cursor-dot[data-mode="button"]::before`, mantendo a transição de `v3-cursor-hover-tone` (D1)
- [x] 1.2 Dar `opacity: 0.85` a `.cursor-dot[data-mode="text"]::before`, sem tocar em `.cursor-dot-label`

## 2. Capas

- [x] 2.1 Em `src/components/Card/index.tsx`, extrair a bifurcação `Link`/`<a target="_blank">` para um componente local partilhado pela capa e pelo "Discover More" (D2)
- [x] 2.2 Fazer da capa do `Card` uma âncora com `tabIndex={-1}` e `aria-hidden="true"`, mantendo `data-cursor-text`, `group/cover`, o chip ↗ e o fallback sem imagem
- [x] 2.3 Em `src/components/ProductDetail/index.tsx`, envolver o conteúdo da capa numa `<a href={product.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">` a ocupar o `Reveal` inteiro (D3)

## 3. Verificação

- [x] 3.1 No `npm run dev`, na home, clicar na capa de um produto com slug (vai para o detalhe) e de um sem slug (abre o site num separador novo) — verificado o caminho com slug (clique na capa → `/en/products/genesis-sport-club`); os três produtos da home têm slug, por isso o ramo externo só ficou coberto pelo código partilhado com o "Discover More"
- [x] 3.2 Na home, percorrer a secção de produtos com Tab: um foco por cartão, no "Discover More" — pelo DOM: cada cartão tem 1 link focável (o "Discover More"); a capa é `tabIndex=-1` + `aria-hidden`, com o mesmo `href`
- [x] 3.3 No detalhe de um produto, clicar na capa: o site abre num separador novo, e o `grow` do `Reveal` continua a funcionar — pelo DOM: a capa é `<a target=_blank rel="noopener noreferrer">` para o mesmo URL do "Visit"; o separador externo não foi aberto
- [x] 3.4 Sobre botões e capas, afinar as opacidades a olho: o rótulo do botão vê-se através do disco, e o "Explore" lê-se sobre fotos claras e escuras — 0.6 no "Visit" (rótulo legível através do disco escuro) e 0.85 na capa da home (imagem nota-se, "Discover" legível); valores mantidos
- [x] 3.5 `npx tsc --noEmit` e `npx biome check` nos ficheiros alterados
