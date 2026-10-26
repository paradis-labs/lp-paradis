# Cutover: Payload → hcms

> **Histórico.** O Payload saiu do site na fase 5 (`cms-phase-5-remove-payload`). `CMS_PROVIDER`, `PAYLOAD_READ_ONLY`, `cms:verify`, `cms:parity`, `cms:export-leads` e `cms:import-submissions` já não existem neste código; estão no git em `c7e1d20`. Fica como registo de como a troca foi planeada.

Runbook da fase 4 de `migrate-cms-to-directus`. Leva o site de produção a ler e escrever no hcms (`hcms.paradis.host`), com o Payload congelado e intacto durante uma janela de rollback de 7 dias.

O cutover é configuração, não deploy: o código das fases 0–3 já está em produção com `CMS_PROVIDER=payload`.

> Ensaiar este runbook completo em staging, rollback incluído, antes de marcar a data.

## Papéis

| Papel | Quem |
|---|---|
| Executa | _a definir_ |
| Revê (segunda pessoa durante a janela) | _a definir_ |
| Administra o hcms (`revalidate_url` do site, exportação de submissões, acesso dos editores) | _a definir_ |
| Editores de conteúdo | _a definir_ |

## Variáveis de ambiente do site

| Variável | Antes | Depois do cutover | Rollback |
|---|---|---|---|
| `CMS_PROVIDER` | `payload` | `hcms` | `payload` |
| `PAYLOAD_READ_ONLY` | `false` | `true` | `false` |
| `CMS_REVALIDATE_SECRET` | definido | definido | definido |
| `CMS_URL`, `TOKEN_SECRET_READ`, `TOKEN_SECRET_FORM` | definidos | definidos | definidos |

Com `CMS_PROVIDER=hcms` e alguma das três últimas em falta, o site recusa arrancar (de propósito: falha no restart, não no primeiro visitante).

Os comandos `npm run cms:*` correm numa máquina com o `.env` de **produção**: `DATABASE_URL` da base de produção do Payload, `CMS_URL` e tokens. Todos são só de leitura, exceto `cms:import-submissions`.

## Pré-condições (T-7 dias)

- [ ] O código das fases 0–3 está em produção, com `CMS_PROVIDER=payload` e sem efeito visível.
- [ ] `npm run cms:check` = 0 (forma do hcms).
- [ ] `npm run cms:verify` = 0, ou só exceções aceites em `cms/hcms/accepted-differences.json` (conteúdo).
- [ ] `npm run cms:parity` = 0, ou só diferenças aceites (domínio).
- [ ] A forma de `form_submissions` está confirmada (fase 3, tarefa 1.7) e uma submissão de teste com `CMS_PROVIDER=hcms` em staging chegou ao hcms.
- [ ] `testimonials` e `faqs` estão visíveis ao token de leitura (fase 2, tarefa 3.1).
- [ ] O site Paradis no hcms tem `revalidate_url` e `revalidate_secret` a apontar para staging (`cms/hcms/FLOW.md`), testados.
- [ ] Cada editor confirmou que acede e edita o site "Paradis" no hcms.
- [ ] Quem administra o hcms sabe exportar `form_submissions` do formulário `quote_request` em JSON (é o que o rollback precisa) e está contactável durante a janela.
- [ ] Editores avisados: data, e que a partir do congelamento se edita **só** no hcms.

O congelamento pode começar logo que `cms:verify` dá 0: impede edições no Payload que criariam diferenças novas antes do dia.

## Dia do cutover

Registar a hora de cada passo. A hora do passo 3 é a **hora do cutover**, usada no rollback.

### 1. Congelar o Payload

1. `PAYLOAD_READ_ONLY=true` + restart.
2. Um editor tenta gravar uma global no `/admin` → **recusado**.
3. Submeter o formulário em `/en/get-quote` com o nome `TESTE CUTOVER` → aparece em `quote-requests` no `/admin`. Apagar depois.

### 2. Portão triplo, contra produção

```sh
npm run cms:check
npm run --silent cms:verify > cms/hcms/reports/AAAA-MM-DD-cutover.txt
npm run cms:parity
```

Os três têm de sair com código 0. **Se algum falhar: abortar.** `PAYLOAD_READ_ONLY=false` + restart, avisar os editores, e corrigir antes de remarcar. Nada mudou para os visitantes.

### 3. Trocar o provider

1. `CMS_PROVIDER=hcms` + restart. **Anotar a hora** (hora do cutover).
2. Pedir a quem administra o hcms que o `revalidate_url` do site Paradis passe a `https://paradis.host/api/cms/revalidate` (e o `revalidate_secret` ao `CMS_REVALIDATE_SECRET` de produção).

A cache não precisa de ser limpa: o provider faz parte da chave da cache, por isso as entradas do Payload não servem o hcms.

### 4. Fumo

- [ ] `/en`, `/pt`, `/en/get-quote` e `/pt/get-quote`: 200, sem erros nos logs do servidor, logos e imagens visíveis, links da navegação a funcionar a partir de `/get-quote`.
- [ ] Submeter o formulário com o nome `TESTE CUTOVER` → quem administra o hcms confirma um `form_submissions` novo (o site não o consegue ler, de propósito).
- [ ] Editar no hcms o título de um projeto → o pedido seguinte a `/en` mostra-o, e os logs do site mostram `[cache] revalidado pelo hcms`. Repor o título.

Sem a revalidação configurada, o conteúdo atualiza na mesma, mas só ao fim de 1 h. Registar e seguir: não é motivo para rollback.

### 5. Fecho

- Avisar os editores: o site lê do hcms.
- Exportar as submissões antigas para a equipa comercial (dados pessoais: o ficheiro fica fora do repo):
  ```sh
  npm run cms:export-leads -- ~/leads-AAAA-MM-DD.csv
  ```

## Janela de rollback (7 dias)

O Payload e a sua base ficam intactos e congelados.

- Todos os dias: erros nos logs do servidor, e com quem administra o hcms as submissões do dia.
- Edições no hcms durante a janela **perdem-se num rollback** (são refeitas à mão no Payload). Pedir aos editores edições mínimas.
- No fim: registar a decisão de seguir para a fase 5 (remoção do Payload).

## Rollback

Por esta ordem, para não haver intervalo em que as submissões vão para o sítio errado:

1. `CMS_PROVIDER=payload` + `PAYLOAD_READ_ONLY=false` + restart. **Anotar a hora**: a partir daqui as submissões voltam ao Payload.
2. Revalidar a cache:
   ```sh
   CMS_REVALIDATE_SECRET=… npm run cms:revalidate -- https://paradis.host
   ```
3. Pedir a quem administra o hcms a exportação JSON de `form_submissions` do formulário `quote_request`, entre a hora do cutover e a hora do passo 1.
4. Repor as submissões no Payload (idempotente: pode correr outra vez com o mesmo ficheiro sem duplicar):
   ```sh
   npm run cms:import-submissions -- ~/form-submissions.json
   ```
   Apagar o ficheiro depois (dados pessoais).
5. Limpar o `revalidate_url` do site no hcms, ou deixá-lo: com o Payload ativo, as revalidações só fazem o site voltar a ler.
6. Avisar os editores: voltam a editar no Payload e refazem à mão as edições feitas no hcms desde o cutover (histórico de revisões do hcms).

## Comandos

| Comando | O quê |
|---|---|
| `npm run cms:check` | Forma do hcms (fase 1) |
| `npm run cms:verify` | Conteúdo do hcms face ao Payload (fase 2) |
| `npm run cms:parity` | Domínio: os dois providers lado a lado (fase 3) |
| `npm run cms:revalidate -- <url>` | Revalidação total da cache de um site em execução |
| `npm run cms:export-leads -- <ficheiro>` | CSV das submissões antigas do Payload |
| `npm run cms:import-submissions -- <ficheiro>` | Exportação do hcms → `quote-requests` no Payload |
