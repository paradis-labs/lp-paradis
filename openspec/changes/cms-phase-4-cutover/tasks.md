## 1. Código mínimo

- [x] 1.1 `PAYLOAD_READ_ONLY`: helper de acesso em `src/collections/` que devolve `false` para `create`/`update`/`delete` de conteúdo quando ativo; aplicado a todas as globals e coleções exceto `quote-requests` (`src/collections/access.ts`; verificado avaliando as regras com o congelamento ligado e desligado: conteúdo recusado, `quote-requests` e `users` intactos)
- [x] 1.2 `cms/hcms/import-submissions.ts <ficheiro>`: exportação JSON de `form_submissions` → `quote-requests` no Payload, idempotente por id de origem. Idempotente por e-mail + mensagem + `createdAt` (sem mudar o schema, ver o design). A forma da exportação é um palpite até a fase 3 a confirmar (tarefa 1.7), por isso a validação é estrita e corre antes de qualquer escrita. Testado com dados sintéticos (rejeições e modo `verificar`); a importação real e a repetição ficam para o ensaio em staging (3.2)
- [x] 1.3 Comando de revalidação total (chama `/api/cms/revalidate` para cada coleção mapeada) (`npm run cms:revalidate -- <url>`; testado localmente: 12 coleções, e código 1 com o segredo errado)
- [x] 1.4 Exportação CSV das submissões antigas de `quote-requests` para a equipa comercial (`npm run cms:export-leads -- <ficheiro>`: recusa caminhos dentro do repo, ficheiro com modo 600, proteção contra fórmulas)

## 2. Runbook

- [x] 2.1 Escrever `cms/CUTOVER.md`: pré-condições, sequência com comandos, portão triplo, fumo, rollback com exportação/importação, comunicação aos editores
- [ ] 2.2 Com quem administra o hcms: o Flow com o URL de produção, a exportação de `form_submissions` num rollback, o acesso dos editores ao site

## 3. Ensaio em staging

- [ ] 3.1 Executar o runbook completo em staging, cronometrado
- [ ] 3.2 Executar o rollback em staging, incluindo exportação e importação de submissões e revalidação total
- [ ] 3.3 Corrigir o runbook com o que o ensaio revelar

## 4. Pessoas

- [ ] 4.1 Cada editor confirma que acede e edita o conteúdo do site "Paradis" no hcms
- [ ] 4.2 Comunicar: a partir do congelamento edita-se só no hcms; data e duração da janela
- [ ] 4.3 Marcar a janela; definir quem executa e quem revê

## 5. Dia do cutover

- [ ] 5.1 `PAYLOAD_READ_ONLY=true` + restart; confirmar que um editor não grava e que o formulário grava
- [ ] 5.2 `cms:check`, `cms:verify` e paridade contra produção → 0 (senão abortar: `PAYLOAD_READ_ONLY=false`)
- [ ] 5.3 `CMS_PROVIDER=hcms` + restart; confirmar o Flow do hcms a apontar para produção
- [ ] 5.4 Fumo: `/en`, `/pt`, `/en/get-quote`, `/pt/get-quote`; submissão → `form_submissions`; edição no hcms → revalidação visível

## 6. Janela de rollback (7 dias)

- [ ] 6.1 Monitorizar erros do servidor e submissões diárias no hcms
- [ ] 6.2 No fim da janela, registar a decisão de seguir para a fase 5
