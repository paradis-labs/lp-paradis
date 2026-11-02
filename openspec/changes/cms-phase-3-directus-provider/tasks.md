## 1. Provider hcms

- [x] 1.1 `@directus/sdk` como dependência de runtime; validar `CMS_URL`, `TOKEN_SECRET_READ` e `TOKEN_SECRET_FORM` no arranque; cliente com `User-Agent` explícito (validadas ao carregar `@/content`, só com `CMS_PROVIDER=hcms`)
- [x] 1.2 Criar `src/content/providers/hcms.ts`: tabela de idiomas (`en`↔`en-US`, `pt`↔`pt-AO`) e helper de tradução com fallback campo a campo para `en-US`
- [x] 1.3 `getNavBar` e `getFooter`: site + navegações por `key`; resolução de links `page`/`anchor`/`url` para as rotas fixas; o nome acessível das redes derivado da plataforma
- [x] 1.4 `getContact` (`sites.email`) e a faixa de contacto a partir do `block_contact` da página `contact`
- [x] 1.5 `getHomepage`: a página `home` e os blocos por coleção e âncora, com `hide_block` → `enabled: false`; `offerings`/`projects`/`testimonials`/`faqs` do site por `sort`; o slug de serviço é o de `en-US` (mapeamento `#about-us`/`#services` corrigido como na fase 2; os campos de `testimonials`/`faqs` estão por confirmar, porque o token não os vê)
- [x] 1.6 `getQuotePage` e `isQuoteFormEnabled`: `block_form` + formulário `quote_request` (rótulos, mensagens por código, `is_active`) + `offerings` para os interesses
- [x] 1.7 `findServicesBySlugs` e `createQuoteRequest` (`form_submissions` com `TOKEN_SECRET_FORM`); confirmar a forma do payload com um envio em ambiente de desenvolvimento. Contrato do template do hcms (`Template-multisite-tenant/docs/api/forms.md`): `form` (id), `site`, `languages_code` e `data`, com `fields: ["id"]` (204). Confirmado a 2026-10-26 com um envio de teste: sem `site` o guard do hcms recusa (`FORM_NOT_ACCEPTING_SUBMISSIONS`); com ele, 204. O registo de teste ("TESTE lp-paradis — APAGAR", 15:39:31 UTC) tem de ser apagado por quem administra o hcms
- [x] 1.8 Media: `${CMS_URL}/assets/<id>` + `images.remotePatterns` em `next.config.ts` (com o nome do ficheiro no URL, `/assets/<id>/<nome>`: sem `.svg` no caminho, o `next/image` recusa os logos com 400)
- [x] 1.9 Schemas zod de cada resposta, com as mesmas regras de descarte e propagação do provider Payload
- [x] 1.10 `Project.linkLabel` no domínio (Payload: `null`; hcms: `link_label`) e o `ProductsSection` a usá-lo, com piso "Discover More"

## 2. Seleção de provider

- [x] 2.1 `CMS_PROVIDER` (`payload` | `hcms`) lido uma vez em `src/content/index.ts`; valor inválido rebenta no arranque
- [x] 2.2 A camada de cache da fase 0b envolve o provider escolhido, sem mudar as tags (o nome do provider entra na chave, para que a troca não sirva entradas do outro a partir de `.next`)

## 3. Paridade de domínio

- [x] 3.1 `cms/parity/`: os dois providers sem cache, leituras em `en` e `pt`, diff profundo com o caminho de cada campo; normalizar a `key` opaca e o URL das imagens (`npm run cms:parity`)
- [ ] 3.2 Correr até 0 diferenças, corrigindo o provider (código) ou o conteúdo no hcms (fase 2). Regra de paridade fechada (spec e design): normalização da fase 2, "acrescenta" para o que o Payload não tinha, e exceções versionadas em `cms/parity/accepted-differences.json`. Estado a 2026-10-26: 3 falhas, todas de conteúdo (slug en-US da oferta de API e duas respostas de FAQ que no Payload estavam numa citação), 65 aceites, 97 acrescentadas

## 4. Invalidação pelo hcms

- [x] 4.1 Mapa coleção do hcms → tags em `src/content/cache-tags.ts`
- [x] 4.2 `src/app/api/cms/revalidate/route.ts`: segredo em tempo constante, corpo zod, 401/400/200 (testado localmente: sem segredo e segredo errado → 401, corpo inválido e `form_submissions` → 400, `projects`/`offerings_translations`/`block_hero` → 200 com as tags certas)
- [x] 4.3 `cms/hcms/FLOW.md`: configuração do Flow (gatilho, coleções, condição por site, URL e header) para quem administra o hcms Revisto: o template do hcms já traz o flow "Revalidate site"; o FLOW.md passou a explicar como preencher `revalidate_url`/`revalidate_secret` no site, e o endpoint fala o contrato do template (`x-revalidate-secret`, coleção sem mapeamento → 200)
- [ ] 4.4 Com o Flow criado, editar no hcms e confirmar que o site mostra a alteração no pedido seguinte

## 5. Verificação

- [ ] 5.1 `CMS_PROVIDER=hcms` localmente: `/en`, `/pt`, `/en/get-quote` e `/pt/get-quote` sem erros e visualmente iguais ao Payload. As quatro dão 200 sem erros do provider e com links e logos certos; "visualmente iguais" espera pelo conteúdo da fase 2
- [ ] 5.2 Submeter o formulário com `CMS_PROVIDER=hcms` → `form_submissions` criado; o token de formulário não lê conteúdo. Parcial: o envio direto com o payload do provider deu 204, e os dois tokens dão 403 a ler conteúdo e submissões; falta o envio pelo formulário do site, em staging
- [ ] 5.3 Primeira renderização a frio contra o hcms: medir e registar, também a partir do servidor de produção (Cloudflare). Local (build de produção): 5,8–6,9 s a frio e 20–30 ms com a cache quente. Falta a medição a partir do servidor de produção
- [ ] 5.4 Produção continua com `CMS_PROVIDER=payload`; deploy sem efeito visível
- [x] 5.5 `npm run lint` e `npm run build`; atualizar `CLAUDE.md` (provider, env vars). O build passa; o lint não tem erros nos ficheiros desta mudança (os 31 que reporta já existiam, em ficheiros gerados ou do Payload)
