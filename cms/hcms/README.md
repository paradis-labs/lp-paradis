# hcms — o CMS do site

O conteúdo deste site vem do **hcms** (`hcms.paradis.host`), um Directus 11 **partilhado por vários sites** ("Paradis CMS"), com conteúdo em `en-US` e `pt-AO`. O modelo e o conteúdo de exemplo do site são do repositório `Template-multisite-tenant` (`tooling/seed/paradis.mjs`). A migração a partir do Payload está em `openspec/changes/migrate-cms-to-directus/`.

> Instância partilhada: **este repositório nunca escreve no schema do hcms** (coleções, campos, políticas, Flows). O que faltar no modelo é pedido a quem o administra.

## Acessos

| Variável | Para quê | Permissões |
|---|---|---|
| `CMS_URL` | URL base do hcms | — |
| `TOKEN_SECRET_READ` | ler o conteúdo do site | só leitura |
| `TOKEN_SECRET_FORM` | gravar o formulário de orçamento | só `create` em `form_submissions` |

Os ficheiros (`/assets/<id>`) são públicos. O hcms está atrás do Cloudflare, que recusa clientes HTTP sem `User-Agent` reconhecível (erro **1010**). Os clientes deste repo enviam um explícito.

## Como o modelo do site é lido

O hcms é um construtor de páginas: um **site** tem **páginas**, e cada página é uma lista ordenada de **blocos**. O site mantém a composição das páginas em código e usa os blocos como fonte do conteúdo.

| No site | No hcms |
|---|---|
| navbar | `sites.logo`, navegações `header` (links) e `header_actions` (botões) |
| footer | `sites` (tagline, copyright, e-mail, redes, `logo_inverse`), navegações `footer_columns` e `footer_actions` |
| homepage | página `home`: `block_hero`, `block_collection` (marquee de `offerings`), `block_media_text` `#about-us`, `block_collection` `#services`, `#products`, `#testimonials` e `#faqs` |
| `/get-quote` | página `contact`: `block_form` (formulário `quote_request`) e `block_contact` (faixa de contacto) |
| submissão | `form_submissions` do formulário `quote_request` |

Os locales são `en` ↔ `en-US` e `pt` ↔ `pt-AO`. As rotas do site são fixas e escolhem a página pela `key`, não pelo slug traduzido. O mapeamento completo, campo a campo, está em `openspec/changes/cms-phase-1-hcms-alignment/design.md`.

## Verificar o contrato

```sh
npm run cms:check
```

Confirma, só com leituras, que o hcms tem a forma de que o site depende: o site e os idiomas, as páginas e os blocos esperados (por coleção e âncora), as navegações, o formulário e os seus campos, e itens publicados nas coleções da home. Sai com código 1 e nomeia cada peça em falta. Não verifica o conteúdo (isso é `cms-phase-2-content-verification`).

Corre com o Node diretamente (type stripping, Node ≥ 22.18) e lê o `.env` da raiz, se existir.

## Scripts da migração (arquivados)

A verificação de conteúdo contra o Payload (`cms:verify`), a paridade entre os dois providers (`cms:parity`), a importação de submissões para rollback (`cms:import-submissions`) e a exportação das submissões antigas (`cms:export-leads`) usavam a Local API do Payload e saíram com ele na fase 5. Ficam no histórico do git, no commit `c7e1d20` (`cms/hcms/verify-content.ts`, `cms/hcms/import-submissions.ts`, `cms/parity/`, `cms/payload/`). Os relatórios da fase 2 continuam em `reports/`.

`cms:check` fica: só lê o hcms, e é a verificação permanente do contrato.
