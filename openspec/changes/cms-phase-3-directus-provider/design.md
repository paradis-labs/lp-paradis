## Context

```
                         CMS_PROVIDER
                              │
  @/content ── index.ts ──────┼───────────────┐
     (cache + tags)           ▼               ▼
                     providers/payload   providers/hcms
                         Local API         @directus/sdk → hcms.paradis.host
                                             TOKEN_SECRET_READ  (leitura)
                                             TOKEN_SECRET_FORM  (create form_submissions)
                                                  ▲
  /api/cms/revalidate ◄── Flow no hcms (criado pelo admin do hcms) ┘
     revalidateTag(tags de cache-tags.ts)
```

O hcms é um construtor de páginas partilhado. O mapeamento campo a campo, as decisões de rotas fixas e composição fixa, e a tabela de idiomas estão no design de `cms-phase-1-hcms-alignment`. Este documento trata de como o provider os implementa.

## Goals / Non-Goals

**Goals:**
- Com o mesmo conteúdo, os dois providers produzem objetos de domínio iguais.
- Trocar de provider é só uma variável de ambiente e um restart.
- Publicar no hcms invalida o cache do site.

**Non-Goals:**
- Renderizar páginas a partir da lista de blocos.
- Slugs traduzidos nas rotas do site.
- Draft mode / pré-visualização.

## Decisions

### Poucas leituras por página, com `fields` explícitos
Uma leitura de domínio corresponde a poucos pedidos ao hcms:
- `getNavBar`/`getFooter`: o site (com traduções, logos, e-mail e redes), mais as navegações por `key`, com itens, filhos e traduções, num `readItems` filtrado pelo site;
- `getHomepage`: a página `home` com `page_blocks` e o `item` de cada bloco expandido (M2A), mais as coleções de que os blocos `block_collection` dependem (`offerings`, `projects`, `testimonials`, `faqs`) filtradas pelo site e ordenadas por `sort`;
- `getQuotePage`: a página `contact`, o seu `block_form` com o formulário `quote_request`, os campos e as traduções, e as `offerings` para os interesses.

O `deep` das traduções filtra `languages_code ∈ {pedido, en-US}`.

### Resolução de links das navegações
`type=page` → a rota fixa da `key` da página (`home` → `/`, `contact` → `/get-quote`); `type=anchor` → a rota dessa página + `#anchor`; `type=url` → o `url` tal como está. O resultado passa pelo `localizedHref` existente, por isso continua a não haver barra a mais antes do `#` (#13). Uma página sem rota conhecida descarta o link, com log.

### `slug` de serviço estável entre idiomas
O formulário envia os interesses por slug, e a grelha de serviços tem ícones e layout por slug. No hcms o slug das `offerings` é traduzido. O domínio usa o slug **de `en-US`**, em todos os locales, porque é o que coincide com o slug do Payload (`ui-ux-design`). `findServicesBySlugs` filtra pela tradução `en-US`.

### Submissão como `form_submissions`
`createQuoteRequest` cria um `form_submissions` ligado ao formulário `quote_request` do site, com os valores por nome de campo (`name`, `email`, `interests` como lista de slugs, `message`) e o locale do hcms. A forma exata do payload é confirmada na tarefa 1.7 com um envio em ambiente de desenvolvimento, porque o token de leitura não tem acesso a `directus_fields`. A Server Action mantém zod, honeypot, tempo mínimo e `is_active`.

### Seleção num único ponto, resolvida no arranque
`index.ts` lê `CMS_PROVIDER` uma vez. Um valor inválido rebenta no arranque. A cache (fase 0b) envolve as funções do provider escolhido, e as tags não mudam.

### Paridade por script
`cms/parity/` importa os dois providers sem cache, chama cada leitura para `en` e `pt` e faz um diff profundo, com o caminho de cada campo. Corre com `payload run`.

A primeira corrida deu 193 diferenças, e quase todas não eram defeitos: o provider Payload lê com o fallback de locale do Payload, por isso em `pt` devolvia o inglês onde o hcms tem a tradução. A regra segue a do `cms:verify` da fase 2:
- **Normaliza** o que só muda na forma: a `key` opaca, o URL das imagens, espaços, aspas tipográficas, `""` igual a `null`, e o prefixo de locale e `#secção` ≡ `/#secção` nos URLs internos.
- **Acrescenta** (listado, não falha): o Payload não tinha o valor, ou em `pt` tinha o mesmo de `en`, e o hcms preenche.
- **Aceite** (listado, não falha): o caminho está em `cms/parity/accepted-differences.json`, com o motivo. São as diferenças por natureza ou por desenho: dimensões e alt dos SVG, nomes acessíveis das redes derivados da plataforma, datas de edição de cada CMS, e os interesses do formulário (as mesmas `offerings` da grelha, com uma só ordem no hcms). Os caminhos aceitam `(*)` para o locale, `[*]` para o índice e `**` para o resto.
- **Falha**: tudo o resto, incluindo a ordem das listas.

Alternativa considerada: ler o Payload sem fallback, como o `cms:verify`. Rejeitada porque a paridade compara o que cada provider **entrega ao site**, e o site com o Payload mostra mesmo o inglês em `pt`.

### Invalidação: endpoint no site, Flow no hcms
`POST /api/cms/revalidate`, chamado pelo flow **"Revalidate site"** que o template do hcms já traz (`Template-multisite-tenant/tooling/flows.mjs`): depois de cada alteração de conteúdo, o flow faz um POST ao `revalidate_url` de cada site, com o header `x-revalidate-secret` (o `revalidate_secret` do site, comparado em tempo constante) e o corpo `{ site, event, collection, keys }`, validado com zod. Não é preciso um Flow próprio: basta preencher os dois campos no item `sites` → Paradis (`cms/hcms/FLOW.md`). O mapa coleção do hcms → tags fica em `cache-tags.ts`: `sites`, `navigations` e `navigation_items` → navbar e footer; `pages`, `page_blocks` e `block_*` → as leituras de página; `offerings` → serviços; `projects`, `testimonials`, `faqs`, `forms` e `form_fields` → as respetivas; `directus_files` → media. Como o flow notifica todos os sites de todas as alterações, uma coleção sem mapeamento responde 200 sem invalidar nada (um 400 encheria o registo do flow de falhas), e um `site` diferente de `paradis` responde 400 (é um erro de configuração). Custo aceite: uma edição de outro site também invalida a cache da Paradis.

### Imagens do hcms
`Media.url = ${CMS_URL}/assets/<id>`, com `width`/`height` de `directus_files`, e o host em `images.remotePatterns`. O spec `cms-content-source` deixa de exigir `/cdn/`.

## Risks / Trade-offs

- [O hcms em baixo com `CMS_PROVIDER=hcms`] → O cache serve o último conteúdo bom enquanto não expirar. Os erros de transporte propagam-se (fase 0a).
- [Latência maior do que a da Local API] → Mitigado pelo cache. Medir a primeira renderização a frio.
- [O admin do hcms não criar o Flow] → O conteúdo atualiza na mesma, pela expiração máxima (1 h). A fase 4 exige o Flow ativo antes do cutover.
- [O Cloudflare do hcms bloquear o cliente do servidor (erro 1010)] → O cliente envia um `User-Agent` explícito. Verificar a partir do servidor de produção, não só localmente.

## Migration Plan

Deploy com `CMS_PROVIDER=payload` em produção (sem efeito visível). Em staging/dev: `CMS_PROVIDER=hcms`, paridade a zero, Flow ativo e uma edição no hcms a refletir-se no site. Rollback: `CMS_PROVIDER=payload`.
