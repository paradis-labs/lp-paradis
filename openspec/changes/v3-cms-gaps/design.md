## Context

- **Origem:** o grupo C da comparação de 2026-11-01 entre o canvas do v3 e o código. Já não contém o que o utilizador decidiu: o "Next product" segue a ordem da lista e cada produto tem um só URL ao vivo.
- **O que o schema do template já tem** (`Template-multisite-tenant/tooling/schema.mjs`, commit `853b3c3`):
  - `forms.translations`: `title`, `submit_label`, `success_title`, `success_again_label`, `success_message`, `error_message`, `privacy_note`, … O site lê `title` (como eyebrow), `submit_label`, `success_message`, `error_message` e `privacy_note`.
  - `form_fields.translations`: `label`, `placeholder`, `help`, `choices`, `messages`. O site lê `label` e `messages`.
  - `block_media_text`: `image`, `media` (vídeo), `gallery`. O site lê só `media` do bloco `#about-us` (o vídeo dos serviços; ver a correção `#about-us`/`#services` em `hcms.ts`).
  - `projects.translations.steps[].icon`: `select` fechado com 6 valores (`swap`, `trend`, `shield`, `calculator`, `globe`, `clock`). Não há campo de nome curto. `link_label` existe, mas é o rótulo do link do cartão, e reaproveitá-lo para o "Visit" misturava dois papéis.
- **O seed** (`tooling/seed/paradis.mjs`) não preenche `success_title`, `success_again_label` nem placeholders, e o formulário tem `title: 'Get a Quote'`.
- **Restrições:**
  - Este repo nunca escreve no schema do hcms.
  - Pedir ao Directus um campo que não existe é um erro (400/403) que derruba a leitura toda. Um campo novo só pode ser lido depois de o schema o ter.
  - O provider valida com zod, faz o fallback por campo para `en-US` e descarta ícones desconhecidos (`productIcon`).

## Goals / Non-Goals

**Goals:**
- Ler os campos que o hcms já oferece e que o v3 mostra.
- Deixar os ícones do canvas prontos no site antes de o schema os oferecer.
- Definir a entrega do único campo novo (`short_name`) sem partir o site em nenhuma ordem de deploy.

**Non-Goals:**
- Campos de schema para microcópia de UI (cartão do formulário, "(optional)", cartão de chamada).
- Mudar o sentido de `forms.title`, que hoje é o eyebrow da página.
- Implementar a change do template a partir daqui.

## Decisions

### D1. Duas fases, separadas pelo deploy do schema
A fase 1 usa só campos existentes e entra já. A fase 2 lê `short_name` e só entra depois de o schema do template ter sido aplicado ao hcms de produção, confirmado com `npm run cms:check`. As tarefas da fase 2 ficam bloqueadas por essa confirmação.
- *Alternativa:* ler `short_name` com tolerância a erro. Rejeitada: o Directus falha o pedido inteiro, não o campo, e o provider teria de repetir a leitura sem ele. É complexidade para um estado transitório.
- *Alternativa:* uma change só, depois do schema. Rejeitada: atrasava os textos do get-quote e o poster, que não dependem de nada.

### D2. Os textos do get-quote entram no domínio
`QuotePage.form` ganha `successTitle`, `successAgainLabel` e `messagePlaceholder` (`string | null`), lidos com `tr(form, …)` e `tr(field("message"), "placeholder", …)`. O `GetQuote` resolve-os com `textOr(campo, FALLBACK[locale].…)`, como já faz com os outros. O piso do título continua o de `v3-finish-pages`.
- *Alternativa:* `forms.title` como título do cartão. Rejeitada: é hoje o eyebrow ("Get a Quote"), e mudar-lhe o sentido exige editar o conteúdo e o seed ao mesmo tempo, com uma janela em que a página mostra o texto errado.

### D3. O poster é o `image` do bloco do vídeo
`ourServicesCT` ganha `backgroundPoster: Media | null`, lido de `blocks.item:block_media_text.image` (acrescentado a `fileFields`), e a home passa `poster={backgroundPoster?.url}` ao `<video>`. É o mesmo bloco e a mesma relação do vídeo: o editor encontra os dois juntos, e o schema já descreve o `media` como "frontends show it instead of, or behind, the image".
- O `next/image` não entra: o `poster` é um atributo do `<video>`. A imagem deve ser leve, porque não passa pelo otimizador. Fica uma nota na tarefa de conteúdo: WebP ou AVIF, cerca de 1200px de largura.
- *Alternativa:* um poster estático em `public/`. Rejeitada: o vídeo vem do CMS, e o poster tem de mudar com ele.

### D4. Ícones: lista fechada alargada no site primeiro
`PRODUCT_ICONS` ganha os 8 valores, e `FEATURE_ICON_PATHS` os traços dos artboards:

| ícone | traço | artboard |
|---|---|---|
| `chart` | `M4 20V10M10 20V4M16 20v-7M22 20H2` | Génesis |
| `heart` | `M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z` | Génesis |
| `calendar` | `M3 5h18v14H3zM3 10h18M8 3v4M16 3v4` | Génesis |
| `filter` | `M4 6h16M7 12h10M10 18h4` | Ficha Segura |
| `calculator` (novo traço) | `M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2` | Ficha Segura |
| `bank` | `M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6` | Ficha Segura |
| `chat` | `M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z` | Talama & Soba |
| `leaf` | `M12 21c-4 0-7-3-7-7 0-5 4-9 7-11 3 2 7 6 7 11 0 4-3 7-7 7zM12 21V10` | Talama & Soba |
| `bag` | `M3 9h18l-2 11H5L3 9zM8 9V6a4 4 0 0 1 8 0v3` | Talama & Soba |

O `z.enum(PRODUCT_ICONS)` do provider passa a aceitar os novos, e o `productIcon` continua a dar `null` aos desconhecidos. No template, os mesmos 8 nomes entram no `select('icon')`, por esta ordem. Os nomes são o contrato entre os dois repos.

### D5. `short_name` ao nível do projeto, não traduzido
Um nome de marca não muda de idioma ("Génesis"), por isso vive em `projects` e não em `projects.translations`. Para o seed: só a Génesis precisa dele ("Génesis"); os outros três ficam vazios e caem no título. No domínio, `ProductDetail.shortName: string | null`, e não `Project`: o campo entra só em `PRODUCT_FIELDS`, como os outros do detalhe, para a home e a listagem não o pedirem. O "Visit" usa `shortName ?? title`. O `check-contract.ts` passa a listar `projects.short_name`.

## Risks / Trade-offs

- **Deploy do site antes do schema na fase 2** → o pedido aos `projects` falha e as páginas de produto partem-se. Mitigação: as tarefas da fase 2 estão bloqueadas pelo `cms:check` contra produção, e o check falha sem o campo.
- **Poster pesado** → não passa pelo `next/image`. Mitigação: a nota de formato na tarefa de conteúdo, e o `preload="none"` mantém-se.
- **Os nomes dos ícones divergirem entre os repos** → um ícone escolhido no hcms com um nome que o site não conhece aparece sem ícone, sem partir nada. Mitigação: a tabela de D4 é a referência para a change do template.

## Migration Plan

1. **Fase 1:** merge e deploy do site. Depois, um editor preenche `success_title`, `success_again_label` e o placeholder em en/pt, e carrega o poster no bloco `#about-us`. A revalidação do Flow invalida as páginas.
2. **Template:** change no `Template-multisite-tenant` com os ícones no `select`, `projects.short_name` e o seed. Aplicada ao hcms de produção pelo processo de lá.
3. **Fase 2:** `npm run cms:check` contra produção passa com `short_name`. Só então merge e deploy da fase 2, e o editor escolhe os ícones e preenche o nome curto da Génesis.
4. **Rollback:** fase 1 e fase 2 revertem-se cada uma com o seu merge. O schema do template pode ficar, porque campos a mais não incomodam o site.

## Open Questions

- O seed do template deve passar a preencher `success_title` e `success_again_label` (com os pisos daqui), para um hcms novo já sair completo? Por omissão: sim, na mesma change do template.
