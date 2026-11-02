## 1. Estrutura

- [x] 1.1 Criar `cms/hcms/verify-content.ts`, corrido com `payload run` (Local API) e com o cliente hcms partilhado com `check-contract.ts` (`cms/hcms/client.ts`; `allowImportingTsExtensions` no tsconfig; o `push` de schema do adaptador desligado com `PAYLOAD_MIGRATING`)
- [x] 1.2 Tabela de campos `[domínio, leitor Payload, leitor hcms]` a partir do mapeamento do design da fase 1 (com `#about-us` ↔ `services.title/subtitle/primaryCta` e `#services` ↔ `ourServicesCT`, ao contrário da tabela da fase 1; ver o render da home)
- [x] 1.3 Normalizadores: espaços, rich text → texto, URL sem prefixo de locale (e aspas tipográficas)

## 2. Relatório

- [x] 2.1 Textos de exemplo: varrer as traduções de todos os blocos e coleções do mapeamento à procura de `[EXEMPLO]`
- [x] 2.2 Traduções em falta (`en-US` × `pt-AO`) por campo
- [x] 2.3 Comparação com o Payload por campo e locale (`fallbackLocale: false`), com listas emparelhadas por slug ou título e a ordem reportada à parte
- [x] 2.4 `cms/hcms/accepted-differences.json` e a sua aplicação (rejeita entradas sobre `[EXEMPLO]`): testado com uma exceção válida, uma sobre `[EXEMPLO]`, uma sem motivo, uma sem diferença e um par manual
- [x] 2.5 Código de saída ≠ 0 com falhas; script `cms:verify` em `package.json`

## 3. Conteúdo

- [ ] 3.1 Confirmar com quem administra o hcms se `testimonials` e `faqs` existem e porque o token de leitura não os vê; ajustar o filtro ou carregar o conteúdo
- [x] 3.2 Primeira corrida e lista de correções para os editores (`cms/hcms/reports/2026-10-24-primeira-corrida.txt` e `2026-10-24-correcoes.md`)
- [ ] 3.3 Repetir até zero falhas (ou só exceções aceites); guardar o relatório final com data

## 4. Verificação

- [x] 4.1 Confirmar que a primeira corrida apanha os `[EXEMPLO]` conhecidos (hero, about, grelha de serviços, resumos dos projetos): 12 ocorrências, en + pt
- [x] 4.2 Confirmar, pelos logs ou pela contagem de itens antes e depois, que nenhuma escrita foi feita em nenhum dos CMS: contagens e `updatedAt`/`date_updated` iguais antes e depois de uma corrida, nos dois CMS
