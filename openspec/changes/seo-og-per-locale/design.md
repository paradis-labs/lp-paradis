## Context

A `seo-metadata` lê o SEO do `sites` com `getSiteSeo(locale)`:
- a `image` é o `sites.og_image`;
- o `alt` vem do `og_image_alt` do idioma.

O template acrescenta `sites_translations.og_image` (`paradis-og-per-locale`), com o OG EN na tradução `en-US` e o OG PT na `pt-AO`. O `sites.og_image` fica como imagem por omissão.

O `readSite` pede `translations.*`. Para uma relação, isso devolve só o id do ficheiro. O `rawFile` aceita um id, mas sem `filename_download` nem dimensões, e as dimensões são o que dá o `og:image:width`.

## Goals / Non-Goals

**Goals:**
- `/pt` e `/en` com a imagem do seu idioma;
- fallback seguro quando falta a imagem traduzida.

**Non-Goals:**
- imagem por idioma nas páginas de produto (são a capa);
- `pages.og_image`.

## Decisions

### D1. Pedir o ficheiro da tradução com os campos de ficheiro
- **Decisão:** acrescentar `...fileFields("translations.og_image")` ao `readSite`, ao lado do `translations.*`.
- **Resultado:** o Directus junta as duas seleções, e cada tradução traz o `og_image` como objeto, com id, nome, dimensões e descrição.
- **Porquê no `readSite`:** a leitura do site é uma só e está cacheada por leitura. Uma leitura separada para um campo seria um pedido a mais por página.

### D2. `trFile`, o fallback campo a campo para ficheiros
- **Decisão:** ao lado do `tr`, um `trFile(record, field, language)` que percorre a mesma `chain(language)` e devolve o primeiro `rawFile.parse(row[field])` não nulo.
- **Ordem em `getSiteSeo`:** `trFile(site, "og_image", language) ?? site.og_image`. O alt fica como hoje: `tr(site, "og_image_alt", language) ?? file.alt`.
- **Porquê:** é a regra que o provider já aplica aos textos ("fallback campo a campo para `en-US`"). Uma tradução PT sem imagem não deve dar uma partilha sem imagem.

### D3. Ordem de deploy
- **O risco:** pedir um campo que não existe faz o Directus recusar o pedido inteiro, e o `readSite` serve a navbar, o footer, o contacto e o SEO.
- **Mitigação:**
  - O `cms:check` passa a verificar `translations.og_image`, e é o passo antes do deploy.
  - O código não tenta detetar o campo em runtime: um pedido extra a cada leitura para cobrir uma janela de deploy não compensa.

## Risks / Trade-offs

- **[Risco] Deploy antes do schema em produção** → site sem navbar e footer.
  - Mitigação: D3 e a ordem nas tasks (o `cms:check` contra produção antes do deploy).
- **[Trade-off] O `/en` passa a ler a imagem da tradução EN, e não o `sites.og_image`.**
  - Hoje são o mesmo ficheiro (seed do template).
  - Se um editor mudar só o `sites.og_image`, o `/en` não muda. A nota do campo no Studio explica a regra.
