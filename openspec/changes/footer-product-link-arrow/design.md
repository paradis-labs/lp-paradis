## Context

- **Estado atual:** em `src/components/Footer/index.tsx`, cada link de `linkGroups` renderiza `<ExternalArrow />` só com `link.isExternal`, que o provider lê de `open_in_new_tab` (`src/content/providers/hcms.ts`, `getFooter`).
- **Conteúdo no hcms** (lido em 2026-11-01): a coluna Products tem `Kitenda`, `Ficha Segura`, `Génesis Sport Club` e `Talama & Soba`, todos `type: url` com `/products/<slug>` e `open_in_new_tab = false`. A coluna Quick Links tem `Kitenda` e `Ficha Segura` com o mesmo destino, e também `Products` → `/products`.
- **O `href` que chega ao footer** é o `url` authorado tal como está (`navTarget`, ramo `type === "url"`). O prefixo de locale só é aplicado no `FooterHref`. A regra trabalha, portanto, sobre o caminho sem locale.
- **Restrição:** o campo `variant` de `navigation_items` é um dropdown fechado (`link`, `button_primary`, `button_secondary`), e este repo não escreve no schema do hcms. Por isso a seta não pode ser authorada.
- **Precedente:** a seta e o hover já existem (`ExternalArrow` + `.roll-arrow`, spec `external-link-arrow`). Esta change só alarga a condição.

## Goals / Non-Goals

**Goals:**
- Os links do footer para páginas de detalhe de produto mostram a `↗` do canvas, sem deixarem de ser links internos.
- Um produto novo acrescentado ao footer pelos editores recebe a seta sem trabalho de código.

**Non-Goals:**
- Pôr a seta noutros sítios (navbar, cartões, `NextProductCard`).
- Tornar a seta authorável no hcms (exigiria mudar o schema, no `Template-multisite-tenant`).
- Mudar o desenho, o tamanho ou o hover da seta, ou o componente `ExternalArrow`.
- Validar que o `<slug>` corresponde a um produto existente.

## Decisions

### D1. A regra é pela rota, no `Footer`
Uma função pura no `Footer`, ao lado de `isRoutedHref`, decide se um `href` é a página de detalhe de um produto: o caminho é `/products/` seguido de exatamente um segmento não vazio, e pode ter `/` final, `?query` ou `#hash`. A condição da seta passa a ser `link.isExternal || isProductDetailHref(link.href)`.
- *Alternativa:* calcular um campo de domínio (por exemplo `arrow: boolean`) no provider. Rejeitada: a regra diz respeito a uma rota do site e à apresentação do footer, e não ao conteúdo. O `Footer` já decide outras coisas pelo `href` (`isRoutedHref`), e mexer em `types.ts` obrigaria a atualizar as fixtures e o contrato sem ganho nenhum.
- *Alternativa:* confirmar o slug contra a lista de produtos. Rejeitada: obrigaria a uma leitura extra num componente que hoje recebe só props, e um slug inexistente já dá 404 de qualquer maneira.
- *Alternativa:* aplicar a seta por coluna (todos os links do grupo "Products"). Rejeitada: o título do grupo é texto authorado e localizado, e o canvas também põe a seta nos produtos de Quick Links.

### D2. A seta dos links de produto reutiliza `ExternalArrow` tal como está
Mantém o mesmo SVG, a mesma classe `.roll-arrow`, o deslocamento diagonal e o `aria-hidden`, como no canvas, onde os dois tipos de link usam a mesma `.flip-arrow`. O nome do componente fica a dizer "external" quando agora também serve um link interno. Fica assim: renomear tocaria em mais dois sítios (`ProductDetail`, `QuoteContactAside`) sem mudar comportamento. O comentário no `Footer` explica a exceção.

### D3. O `FooterHref` não muda
A decisão entre `target`/`rel` e o prefixo de locale continua a depender só de `isExternal`/`isRoutedHref`. A seta é ortogonal: um link de produto passa pelo ramo interno (`Link` com `/${locale}/products/<slug>`) e só ganha o filho `<ExternalArrow />`.

## Risks / Trade-offs

- **A `↗` num link interno deixa de significar "sai do site"** → é a escolha do canvas, aceite pelo utilizador. Os externos continuam a distinguir-se por abrirem noutra aba.
- **Um editor que escreva o URL com locale** (`/en/products/kitenda`) não recebe a seta, e o `FooterHref` já duplicaria o prefixo → não acontece no conteúdo atual, e o problema já existia antes desta change. A regra não tenta aceitar esse formato.
- **Uma rota futura com o prefixo `/products/` e mais de um segmento** (por exemplo `/products/kitenda/gallery`) não recebe a seta → é intencional, só a página de detalhe a recebe.
