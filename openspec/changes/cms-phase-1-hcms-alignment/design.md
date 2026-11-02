## Context

Levantamento feito a 2026-10-23 com o token de leitura (`TOKEN_SECRET_READ`), sem escritas.

- **Instância:** `hcms.paradis.host`, Directus 11.17.4, partilhada por vários sites. O token de leitura não consegue ler `directus_fields` nem `directus_collections`, por isso o schema conhece-se pelos registos e não pela introspeção.
- **Site:** `sites` `e87e1584…`, slug `paradis`, domínios `paradis.host` (produção) e `paradis.localhost` (desenvolvimento), `default_language: en-US`, idiomas `en-US` e `pt-AO`.
- **Páginas** (`pages`, por `key`):
  - `home`: `block_hero` → `block_collection` (offerings, marquee) → `block_media_text` `#about-us` → `block_collection` `#services` (offerings, bento) → `#products` (projects, grid) → `#testimonials` (marquee) → `#faqs` (accordion)
  - `contact` (slug `get-quote` / `pedir-orcamento`): `block_form` (form `quote_request`) → `block_contact`
- **Dados visíveis ao token:** 7 `offerings` e 2 `projects`, todos publicados. `testimonials` e `faqs` dão 0, mas a permissão de leitura nessas coleções é *partial* (com filtro), e o conteúdo pode existir fora do filtro. Ver a fase 2.
- **Textos de exemplo:** o hero, o "about", a descrição da grelha de serviços e os resumos dos projetos ainda têm `[EXEMPLO] … Replace with … from Payload`. A fase 2 tem de os encontrar.
- **Ficheiros:** `/assets/<id>` é público (200 sem token).

## Goals / Non-Goals

**Goals:**
- Um mapeamento sem ambiguidade de cada campo do domínio para o hcms.
- Um contrato verificável por script, que falha antes do cutover se o hcms mudar.

**Non-Goals:**
- Alterar o schema do hcms a partir deste repo.
- Escrever o provider (fase 3) ou verificar o conteúdo campo a campo contra o Payload (fase 2).
- Renderizar páginas a partir da lista de blocos (page builder genérico) — ver Decisões.

## Decisions

### Mapeamento domínio → hcms

`tr(x)` = campo da tradução do locale pedido, com fallback para `en-US`.

| Domínio (`@/content`) | hcms |
|---|---|
| **NavBar**.logo | `sites.logo` (e `logo_inverse` para o menu móvel) |
| NavBar.links[] | `navigations[key=header].items` → `tr(label)`, `type` (`page`/`anchor`/`url`), `open_in_new_tab` |
| NavBar.buttons[] | `navigations[key=header_actions].items` → `variant` `button_primary`/`button_secondary` → `primary`/`outline` |
| **Footer**.logo | `sites.logo_inverse` |
| Footer.tagline, copyrightText | `tr(sites.tagline)`, `tr(sites.copyright_text)` |
| Footer.linkGroups[] | `navigations[key=footer_columns].items` (tipo `group`) → `children` |
| Footer.cta | `navigations[key=footer_actions]`: o grupo dá o `heading`, e os itens `button_primary`/`button_secondary` dão os dois botões |
| Footer.socialLinks[] | `sites.social_links` (`platform`, `url`, `state=live`). **Não tem `label`**: o nome acessível passa a ser derivado da plataforma |
| **FooterContactBand** | `block_contact` da página `contact`: `tr(title)` → `reachHeading`, `tr(social_label)` → `socialHeading`, `sites.email` → `email` |
| **Homepage**.hero | `block_hero`: `tr(title)` → `headline`, `tr(eyebrow)` → `subheadline`, `tr(lead)` → `description`, `tr(buttons)[0..1]` → `primaryCta`/`secondaryCta`, `image` → `backgroundImage` |
| Homepage.services (marquee + grelha) | `block_collection` com `source=offerings` → `tr(eyebrow/title/lead)`, os itens são `offerings` do site por `sort`: `tr(title)`, `tr(slug)`, `tr(summary)` → `shortDescription` |
| Homepage.services.ourServicesCT | `block_media_text` `#about-us`: `tr(title)`, `tr(lead)`, `media` → `backgroundVideo`, `tr(buttons)[0]` → `primaryCta` |
| Homepage.projects | `block_collection` `#products` (`source=projects`) → título/subtítulo/CTA; itens `projects`: `tr(title)`, `tr(summary)` → `description`, `image` → `coverImage`, `url` |
| Homepage.testimonials | `block_collection` `#testimonials` + `testimonials` (campos por confirmar, ver Lacunas) |
| Homepage.faqs | `block_collection` `#faqs` + `faqs` (campos por confirmar) |
| **QuotePage**.hero | `block_form` (página `contact`): `tr(title)` → `headline`, `tr(lead)` → `intro` |
| QuotePage.availability | `tr(block_form.highlights)`: `[0]` → `label`, `[1]` → `location`; sem highlights → `enabled: false` |
| QuotePage.form | `forms[key=quote_request]`: `tr(title)` → `eyebrow`, `tr(submit_label)`, `tr(privacy_note)`, `tr(success_message)`/`tr(error_message)`; por campo, `tr(label)` e `tr(messages[code])` (`required`, `invalid`, `too_long`); `is_active` → `enabled` |
| QuotePage.form.interests | campo `interests` com `choices_source=offerings` → `offerings` do site |
| QuotePage.seo | `tr(pages.seo_title)`, `tr(pages.seo_description)` da página `contact` |
| **createQuoteRequest** | `POST /items/form_submissions` com `TOKEN_SECRET_FORM` (forma do payload a confirmar, ver Lacunas) |
| **Media** | `{ url: ${CMS_URL}/assets/<id>, alt, width, height }` a partir de `directus_files` |

### Rotas fixas em código; a página é escolhida pela `key`
O hcms tem slugs traduzidos (`get-quote` / `pedir-orcamento`), mas o site tem a rota `/[locale]/get-quote` fixa e specs que dependem dela. Nesta migração, o provider escolhe a página pela `key` (`home`, `contact`) e ignora o slug. Os links do tipo `page` nas navegações são resolvidos pela tabela `{ home: "/", contact: "/get-quote" }` em código, e os do tipo `anchor` por essa mesma rota mais `#anchor`. Passar o site a usar slugs traduzidos é uma mudança de routing, que fica para depois do cutover.

Alternativa considerada: seguir os slugs do CMS. Rejeitada nesta migração, porque mudaria URLs públicas (SEO, links partilhados) ao mesmo tempo que muda o CMS. Duas mudanças de risco ao mesmo tempo tornam o rollback ambíguo.

### Composição da home fixa em código, blocos como fonte de conteúdo
O hcms é um construtor de páginas: o editor pode reordenar, esconder (`hide_block`) e acrescentar blocos. O site atual tem a composição desenhada em código (formas entrelaçadas, vídeo de fundo, ordem fixa). Nesta migração o provider **procura os blocos de que a home precisa**, por coleção e âncora, e ignora os outros. `hide_block` é respeitado e desliga a secção, como o `enabled` fazia no Payload.

Alternativa considerada: renderizar a página a partir da lista de blocos. É o uso natural do hcms, mas é uma reescrita da home. Fica registada como evolução possível, não como parte do cutover.

### Idiomas
`en` ↔ `en-US`, `pt` ↔ `pt-AO`, numa tabela única do provider. O fallback é campo a campo para `en-US`, igual ao do contrato de `@/content`.

### Imagens servidas pelo hcms
`/assets/<id>` é público, por isso `Media.url` passa a `${CMS_URL}/assets/<id>`, com o host em `images.remotePatterns` do `next.config.ts`. A rota `/cdn` e o bucket S3 continuam a servir o Payload até à fase 5.

### Verificação do contrato por script, só leitura
`cms/hcms/check-contract.ts`: usa o `@directus/sdk` com `TOKEN_SECRET_READ`, resolve o site pelo slug `paradis` e verifica a presença de cada peça do mapeamento acima. Não confirma o conteúdo (isso é a fase 2), só a forma. Corre à mão e antes do cutover.

## Lacunas (para quem administra o hcms)

| Lacuna | Efeito no site enquanto faltar |
|---|---|
| `testimonials` e `faqs` não visíveis ao token de leitura (0 itens com permissão *partial*) | As secções ficam vazias. A fase 2 confirma se é o filtro ou falta de dados |
| Os campos de `testimonials` e `faqs` não são conhecidos (sem acesso a `directus_fields`) | O mapeamento destas duas coleções fica por fechar na fase 3 |
| `projects` sem "abrir em nova aba" (#22 opção B) | Nova aba sempre, como na onda 0 |
| `sites.social_links` sem `label` | O nome acessível é derivado da plataforma ("Paradis on Instagram") |
| A forma do payload de `form_submissions` não é conhecida | A fase 3 confirma-a com um envio de teste em ambiente de desenvolvimento |
| `offerings.icon` é um nome livre (`palette`), e a grelha do site usa ícones próprios por slug | A grelha mantém os seus ícones. O campo fica por usar |

## Risks / Trade-offs

- [Outro site ou um administrador alterar o modelo partilhado] → O script de contrato falha. Corre antes de cada deploy até ao cutover.
- [O token de leitura ter um filtro que esconde conteúdo] → A fase 2 confirma com quem administra o hcms. O site lê exatamente o que esse token vê.
- [Os slugs traduzidos ficarem sem uso] → É uma decisão consciente e registada. O hcms mantém-nos, e uma mudança futura pode adotá-los.

## Open Questions

- Quem administra o hcms e é dono da lista de lacunas?
- O filtro da permissão de leitura em `testimonials`/`faqs` (estado? site?).
