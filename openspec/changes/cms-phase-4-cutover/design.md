## Context

```
 T-7d   acesso dos editores ao site no hcms · Flow criado (URL de staging) · ensaio completo em staging
 T-0    ┌ PAYLOAD_READ_ONLY=true + restart ───────────────── congelamento do Payload
        │ cms:check   (fase 1, forma)    = 0 ─┐
        │ cms:verify  (fase 2, conteúdo) = 0  ├─ portão: falha → descongelar Payload, abortar
        │ parity      (fase 3, domínio)  = 0 ─┘
        │ CMS_PROVIDER=hcms + restart
        │ Flow do hcms a apontar para o URL de produção
        │ fumo: /en /pt /get-quote, submissão, edição no hcms → revalidação
        └ editores passam a editar só no hcms
 T+7d   fim da janela de rollback → fase 5 pode começar
```

Ao contrário do plano original, não há migração delta: o conteúdo já vive no hcms, e o que se garante no dia é que ele continua igual ao do Payload congelado.

## Goals / Non-Goals

**Goals:**
- Nenhuma alteração editorial perdida no cutover.
- Nenhuma submissão de cliente perdida, com ou sem rollback.
- Rollback em minutos durante a janela.

**Non-Goals:**
- Importar as submissões antigas do Payload para o hcms.
- Sincronizar de volta as edições de conteúdo feitas no hcms durante a janela.
- Remover o Payload (fase 5).

## Decisions

### Congelar o Payload, porque a verificação compara com ele
A fase 2 compara o hcms com o Payload. Uma edição feita no Payload depois disso cria uma diferença que só aparece no portão do dia, e os editores têm de passar a editar num só sítio. `PAYLOAD_READ_ONLY=true` faz as regras de escrita do conteúdo devolverem `false`. O formulário não é afetado, porque grava pela Local API com `overrideAccess: true`. Na prática, o congelamento pode começar logo que a fase 2 dá zero, e não só no dia.

### Portão triplo contra produção
Forma (`cms:check`), conteúdo (`cms:verify`) e domínio (paridade), os três contra os dados de produção. Se qualquer um falhar, o Payload é descongelado e o cutover aborta sem efeito para os visitantes.

### Submissões no rollback: a partir de uma exportação, não de um token
Com `CMS_PROVIDER=hcms`, as submissões novas vão para `form_submissions`. Ler essas submissões exige um token que as leia, e esse token não deve existir no ambiente do site. O rollback usa então uma exportação JSON de `form_submissions` (filtrada pelo formulário `quote_request` e pela data do cutover), feita no app do hcms por quem o administra. `cms/hcms/import-submissions.ts <ficheiro>` cria cada uma em `quote-requests` no Payload com o `createdAt` do hcms, e é idempotente por e-mail + mensagem + `createdAt`: uma `quote-request` igual nesses três já conta como importada.

Alternativa considerada: um campo de origem com o id da submissão no hcms. Rejeitada porque este repo não tem migrações do Payload (o schema só chega à base pelo `push` do modo de desenvolvimento): o deploy de um campo novo partiria a gravação de `quote-requests`, e o formulário com ela, enquanto a coluna não existisse em produção. O custo da chave natural é aceite: duas submissões idênticas no mesmo milissegundo contariam como uma.

### Rollback é configuração
`CMS_PROVIDER=payload`, `PAYLOAD_READ_ONLY=false` e restart. A cache guarda conteúdo do hcms até expirar ou ser invalidada, por isso o runbook inclui revalidar todas as tags (`POST /api/cms/revalidate` com cada coleção mapeada).

## Risks / Trade-offs

- [O Flow não estar ativo no dia] → O portão inclui editar no hcms e ver a alteração no site. Sem Flow, o conteúdo só atualiza pela expiração (1 h), o que é aceitável mas fica registado.
- [Editores sem acesso ao site no hcms] → Confirmado por cada editor na semana anterior.
- [Edições no hcms perdidas num rollback] → Aceite e comunicado. São refeitas à mão no Payload a partir do histórico de revisões do hcms. A comunicação pede edições mínimas na primeira semana.
- [A exportação do hcms falhar no momento do rollback] → O ensaio em staging inclui exportar e importar.

## Migration Plan

O próprio runbook. Ensaio completo em staging, incluindo o rollback com exportação e importação de submissões, antes de marcar a data.

## Open Questions

- Data e hora da janela; quem executa e quem revê.
- Quem, do lado do hcms, faz a exportação de `form_submissions` num rollback.
