## Context

- **Referência:** `openspec/design/v3 · Products (EN)-html/Products.dc.html`. No canvas há também o artboard "v3 · Product detail — Kitenda" (`project/Product.dc.html`), que não faz parte desta change.
- **Modelo do hcms:** as páginas escolhem-se por `key` com rotas fixas (`home` → `/`, `contact` → `/get-quote`), e os blocos encontram-se por coleção + âncora. O bloco `block_collection #products` da `home` tem `eyebrow/title/lead` traduzidos e uma CTA. Os `projects` têm `title`, `summary`, `image` e `url`, e mais nada (`hcms.ts`, `readCollection("projects", …)`).
- **Links:** `siteUrl` deixa passar um caminho que não é slug de página (`/products`), e `localizedCtaHref` prefixa-o com o locale. Chega por isso que o editor authore `/products`, sem código novo de roteamento.
- **Cache:** uma função `"use cache"` por leitura em `index.ts`, com as tags de `cache-tags.ts` e o mapa `HCMS_COLLECTION_TAGS` para a invalidação.

## Goals / Non-Goals

**Goals:**
- Uma listagem de produtos com o aspeto do v3, alimentada pelo conteúdo que já existe.
- Uma leitura própria, para a página não depender do custo da `homepage` (testemunhos, FAQs, hero).

**Non-Goals:**
- Categoria e tags nos cartões, e a página de detalhe `/products/[slug]`. Ambas precisam de campos novos nos `projects` (slug, categoria, tags, pitch, mercado, plataforma, desafio, solução, passos, galeria, testemunho relacionado), que têm de ser propostos ao `Template-multisite-tenant`.
- Criar uma página `products` no hcms.
- Editar o conteúdo do hcms a partir do código. A mudança dos links é feita por um editor.

## Decisions

### D1. O cabeçalho reutiliza o bloco `#products` da `home`
O texto do mockup (eyebrow "Our Products", H1 e lead) é exatamente o da secção da home. Reutilizar o bloco evita uma página nova no hcms e uma segunda cópia do mesmo texto, que divergiria.
- *Alternativa:* uma página `products` no hcms com um `block_hero`. Rejeitada: obrigaria a mexer no seed do template para uma página só com cabeçalho, e o site trata as páginas por `key` com rota fixa (seria preciso uma `key` nova).
- *Consequência:* `hide_block` no bloco esconde a secção da home mas não a página (especificado).

### D2. Leitura nova `getProductsPage`
- O domínio é `ProductsPage = { eyebrow: string | null; title: string | null; lead: string | null; items: Project[] }`.
- O provider lê `pages` (`key = home`, só os campos do bloco `block_collection`) e `projects` em paralelo, e reutiliza o mapeamento de `Project` da homepage (fator comum extraído, não copiado).
- Cache: `ContentRead` ganha `"products-page"`, com `READ_COLLECTIONS["products-page"] = ["projects", "media"]`, e `PAGE_READS` passa a incluir `readTag("products-page")`.
- *Alternativa:* chamar `getHomepage` e usar `projects`. Rejeitada: a página pagaria testemunhos, FAQs e hero, e invalidaria por coleções que não usa.

### D3. O cartão inteiro é uma âncora externa
Como no mockup. O nome acessível é o título (o número e a descrição ficam no conteúdo, e o `<h2>` dá a estrutura). A indicação de novo separador é um texto só para leitores de ecrã, localizado. O destino é o `url` do projeto, o mesmo da home: o mockup não liga a listagem ao detalhe.

### D4. Numeração derivada da posição
`01`, `02`, … a partir do índice depois de o provider descartar os inválidos, para nunca haver buracos. Não é um campo do CMS.

### D5. Estado ativo da navbar por pathname
O `NavActiveContext` já decide o link corrente. Passa a reconhecer um link cujo `href` (sem locale) é igual ao pathname corrente (sem locale), além das âncoras da home. Fica restrito a correspondência exata, para `/products` não ativar outros links.
- *Acrescentado na implementação:* um link de página só é corrente quando nenhuma secção está ativa. Assim, na home, "Home" fica marcado no topo (como no mockup) e deixa de o estar quando uma secção chega a meio do ecrã. Apareceram também dois defeitos que já existiam no provider. Procurava as secções uma única vez, e quando o header hidratava antes da página não observava nada: o link corrente nunca mudava. Além disso, nunca voltava a "nenhuma secção". Passou a vigiar o DOM até as secções chegarem, a voltar a ligar-se a cada mudança de rota, e a limpar a secção ativa acima da primeira.

## Risks / Trade-offs

- **Até um editor mudar os links no hcms, a página fica escondida** → a tarefa de conteúdo está listada, e a página funciona por URL entretanto.
- **O mockup mostra categoria e tags, a implementação não** → é uma diferença visual consciente e registada. Os cartões ficam mais curtos. Volta-se a ela com o schema novo.
- **Reutilizar o bloco da home acopla as duas páginas** → editar o título da secção muda o H1 de `/products`. É o comportamento pretendido (é o mesmo texto), e fica documentado no comentário da leitura.

## Migration Plan

1. Merge depois de `v3-home-reskin`.
2. Depois do deploy, um editor aponta para `/products` o item "Products" (`header`), o link do footer e a CTA do bloco `#products`. O Flow de revalidação invalida o navbar, o footer e a homepage.
3. Rollback: reverter o merge e repor os links no hcms (para `#products`).

## Open Questions

- O link "Products" da navbar deve ir para `/products` em todas as rotas, ou continuar a ser âncora (`#products`) na home e ir para `/products` só fora dela? Por omissão: `/products` em todas, como no mockup das outras páginas.
- A cópia do estado vazio ("No products yet." / "Ainda não há produtos.") precisa de aprovação?
