## Why

No fim da fase 3 o site sabe ler e escrever no hcms (`hcms.paradis.host`), e o conteúdo lá foi verificado (fase 2), mas produção continua no Payload. O cutover é o momento de maior risco do roadmap. Os riscos são concretos: editores a gravar no Payload depois da verificação, criando divergência; submissões de clientes do lado errado num rollback; o Flow de invalidação por criar no dia. Esta change define um procedimento repetível e reversível, com o mínimo de código. É a fase 4 do roadmap `migrate-cms-to-directus`.

## What Changes

- **Congelamento editorial no Payload:** `PAYLOAD_READ_ONLY=true` torna `create`/`update`/`delete` das globals e coleções de conteúdo indisponíveis no `/admin`. O formulário continua a receber submissões pela Server Action. A partir daqui, as edições de conteúdo fazem-se só no hcms.
- **Runbook** em `cms/CUTOVER.md`: pré-condições, sequência, portão, fumo, rollback e comunicação.
- **Sequência:** congelar o Payload → `cms:check` (fase 1), `cms:verify` (fase 2) e paridade de domínio (fase 3) contra produção → `CMS_PROVIDER=hcms` + restart → confirmar o Flow de invalidação ativo → fumo.
- **Janela de rollback** (7 dias): o Payload e a sua base ficam intactos e só de leitura. O rollback é `CMS_PROVIDER=payload` e um restart, mais a reposição no Payload das submissões recebidas no hcms durante a janela. Essas submissões entram a partir de uma **exportação JSON de `form_submissions` feita no app do hcms**: o token de formulário não as consegue ler, e este repo não deve ter um token que as leia.
- **Submissões antigas:** as que estão em `quote-requests` no Payload não são importadas para o hcms (modelo diferente). Ficam no Payload durante a janela, saem numa exportação CSV para a equipa comercial e no dump final da fase 5.
- **Editores:** confirmar acesso ao conteúdo do site "Paradis" no hcms antes do dia.

## Capabilities

### New Capabilities

- `cms-cutover`: congelamento da origem, portão de verificação, troca de provider em produção e rollback sem perda de submissões.

### Modified Capabilities

_(nenhuma)_

## Impact

- **Código:** o interruptor `PAYLOAD_READ_ONLY` nas regras de acesso de `src/collections/**`; o script `cms/hcms/import-submissions.ts` (exportação do hcms → Payload, idempotente); a exportação CSV das submissões antigas; `cms/CUTOVER.md`.
- **Produção:** env do site (`CMS_PROVIDER`, `CMS_REVALIDATE_SECRET`; `CMS_URL` e os tokens já existem).
- **Fora do repo:** o Flow ativo no hcms com o URL de produção e o acesso dos editores, ambos com quem administra o hcms.
- **Sequência:** depois de `cms-phase-3-directus-provider` em produção (com `CMS_PROVIDER=payload`) e com `cms:verify` a zero.
