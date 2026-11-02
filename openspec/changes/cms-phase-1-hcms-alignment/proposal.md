## Why

O roadmap assumia montar um Directus próprio. Não é preciso: já existe uma instância partilhada, **`hcms.paradis.host`** ("Paradis CMS", Directus 11.17.4, *"Content for several websites"*), com um modelo genérico multi-site (sites, páginas compostas por blocos, navegações, ofertas, projetos, formulários). O site "Paradis" (`paradis.host`) já lá está, com o conteúdo carregado em `en-US` e `pt-AO`. O `.env` já tem os acessos: `CMS_URL`, `TOKEN_SECRET_READ` (só leitura) e `TOKEN_SECRET_FORM` (só `create` em `form_submissions`).

O trabalho da fase 1 deixa de ser construir um modelo e passa a ser **alinhar o site com o modelo que existe**: decidir como cada tipo de domínio de `@/content` sai dos blocos e coleções do hcms, registar o que falta, e tornar esse contrato verificável a partir deste repo, sem nunca escrever no schema de uma instância que serve outros sites.

## What Changes

- **Mapeamento domínio → hcms**, campo a campo, no design desta change. Cobre o navbar, o footer, a faixa de contacto, a homepage, a página de orçamento e a submissão.
- **Verificação do contrato:** um script só de leitura (`cms/hcms/check-contract.ts`) confirma, com o token de leitura, que o hcms tem tudo o que o domínio exige para este site: o site, os dois idiomas, as páginas `home` e `contact` com os blocos e âncoras esperados, as navegações `header`, `header_actions`, `footer_columns` e `footer_actions`, o formulário `quote_request` com os campos `name`, `email`, `interests` e `message`, e os itens das coleções referidas. Sai com código ≠ 0 se faltar alguma coisa.
- **Decisões que a fase 3 herda:** `en`↔`en-US` e `pt`↔`pt-AO`; as rotas do site continuam fixas em código e a página do hcms é escolhida pela `key` (`home`, `contact`), não pelo slug traduzido; as imagens vêm de `${CMS_URL}/assets/<id>`, que é público.
- **Lacunas** para quem administra o hcms, com o que falta no modelo e o que o site faz enquanto faltar.
- **#22 (opção B):** os projetos não têm campo "abrir em nova aba". Fica como lacuna e o site mantém a nova aba sempre, que é o comportamento da onda 0.
- **Sem serviço novo, sem `schema apply`, sem tokens de escrita** neste repo.

## Capabilities

### New Capabilities

- `hcms-content-contract`: o que o site exige do hcms (resolução do site, idiomas, composição das páginas por blocos, dados de cada coleção, tokens de privilégio mínimo) e a verificação automática desse contrato.

### Modified Capabilities

_(nenhuma: o site ainda não lê do hcms; isso é a fase 3)_

## Impact

- **Repositório:** novo `cms/hcms/` (script de verificação + README com o mapeamento resumido). O site não muda.
- **Env:** reutiliza `CMS_URL`, `TOKEN_SECRET_READ` e `TOKEN_SECRET_FORM`, que já estão no `.env`. Os nomes `DIRECTUS_URL`/`DIRECTUS_TOKEN` previstos antes deixam de existir.
- **Fora do repo:** a lista de lacunas vai para quem administra o hcms.
- **Sequência:** em paralelo com as fases 0a/0b. A fase 2 (`cms-phase-2-content-verification`) e a fase 3 dependem desta.
