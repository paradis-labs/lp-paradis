# hcms — o CMS de destino

O conteúdo deste site vai passar a vir do **hcms** (`hcms.paradis.host`), um Directus 11 **partilhado por vários sites** ("Paradis CMS"). O site "Paradis" já lá está modelado, com conteúdo em `en-US` e `pt-AO`. A migração e as suas fases estão em `openspec/changes/migrate-cms-to-directus/`.

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

## Verificar o conteúdo

```sh
npm run cms:verify
npm run --silent cms:verify > cms/hcms/reports/AAAA-MM-DD.txt   # guardar o relatório
```

Compara o conteúdo do hcms com o que o Payload serve hoje e sai com código 1 enquanto houver:

1. **textos de exemplo**: qualquer campo traduzido com `[EXEMPLO]`. Nunca são aceitáveis;
2. **traduções em falta**: campos preenchidos num idioma e vazios no outro;
3. **diferenças face ao Payload**, campo a campo e por locale. Antes de comparar, normaliza os espaços, as aspas tipográficas, o rich text e o prefixo de locale dos URLs. As listas são emparelhadas por slug ou título, e uma ordem diferente aparece à parte, sem contar como falha;
4. campos do mapeamento que não existem nos registos do hcms, e exceções inválidas.

O que o hcms **acrescenta** e o Payload nunca teve (um valor vazio no Payload, ou o texto inglês copiado para `pt`) aparece numa secção própria e não conta como falha. É para isto que o Payload se lê sem fallback de locale.

As diferenças intencionais entram por PR em `accepted-differences.json`:

```json
{
  "differences": [{ "field": "quotePage.form.emailLabel", "locale": "en-US", "reason": "capitalização revista no hcms" }],
  "pairs": [{ "list": "homepage.services.items", "payload": "api-integrations", "hcms": "api-and-integrations", "reason": "slug renomeado" }]
}
```

`field` é o identificador que o relatório imprime. Sem `locale`, a exceção vale para os dois idiomas. `pairs` emparelha à mão itens de uma lista cuja identidade mudou. Uma exceção sobre um campo com `[EXEMPLO]` é rejeitada.

**Só leitura nos dois CMS.** O hcms é lido com `TOKEN_SECRET_READ`. O Payload é lido pela Local API, só com `find`/`findGlobal` e com o `push` de schema do adaptador desligado. Corre com `payload run` (Local API e `.env` no mesmo processo). Os relatórios ficam em `reports/`.
