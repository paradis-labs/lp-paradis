## Why

O conteúdo do site já está no hcms (`hcms.paradis.host`, Directus partilhado). A fase 1 fixou como cada tipo de domínio sai do modelo de blocos do hcms, e a fase 2 garante que o conteúdo está completo. Falta o site **ler e escrever** no hcms: com resultados comprovadamente equivalentes aos do Payload, e com uma troca reversível por variável de ambiente, para que o cutover da fase 4 seja configuração e não deploy de código. É a fase 3 do roadmap `migrate-cms-to-directus`.

## What Changes

- Novo provider `src/content/providers/hcms.ts` sobre o `@directus/sdk`, que implementa as mesmas funções do provider Payload a partir do mapeamento da fase 1:
  - resolve o site `paradis`;
  - escolhe as páginas pela `key` (`home`, `contact`) e procura os blocos por coleção e âncora, respeitando `hide_block`;
  - lê as navegações por `key` e resolve os links `page`/`anchor` para as rotas fixas do site;
  - mapeia `en`↔`en-US` e `pt`↔`pt-AO`, com fallback campo a campo para `en-US`.
- **Leitura** com `TOKEN_SECRET_READ`. **Escrita** da submissão em `form_submissions` com `TOKEN_SECRET_FORM`, o único token com escrita, e só `create`.
- **Imagens** com URL `${CMS_URL}/assets/<id>` (público), e o host acrescentado a `images.remotePatterns`.
- **Seleção do provider por `CMS_PROVIDER`** (`payload` | `hcms`, default `payload`), num único ponto em `src/content/index.ts`. A variável é transitória e sai na fase 5.
- **Paridade de domínio:** o script `cms/parity/` chama as funções de leitura dos dois providers, sem cache, para cada locale, e compara os objetos de domínio campo a campo.
- **Invalidação pelo hcms:** route handler `POST /api/cms/revalidate`, autenticado por `CMS_REVALIDATE_SECRET`, que mapeia a coleção alterada para as tags de `src/content/cache-tags.ts`. O Flow que o chama é **criado por quem administra o hcms**, porque este repo não tem nem deve ter token de admin. A configuração do Flow, filtrada por este site, fica documentada no repo.
- **#22 (opção B) sai do roadmap:** o hcms não tem "abrir em nova aba" nos projetos. O link do card continua a abrir sempre em nova aba (onda 0).
- **Ganho lateral:** o rótulo "Discover More" dos cards passa a vir de `projects.link_label`, que é traduzido no hcms.

## Capabilities

### New Capabilities

_(nenhuma)_

### Modified Capabilities

- `cms-content-source`: seleção do provider por ambiente, paridade de domínio entre providers, e o URL das imagens deixa de ter de ser `/cdn/<chave>`.
- `cms-content-cache`: a invalidação passa a poder vir do hcms, por um endpoint autenticado que usa as mesmas tags.
- `quote-request-intake`: com o hcms, a submissão é um `form_submissions` do formulário `quote_request`, escrito só pelo token de formulário.

## Impact

- **Código:** `src/content/index.ts` (seleção), `src/content/providers/hcms.ts` (novo), `src/content/cache-tags.ts` (mapa coleção hcms → tags), `src/app/api/cms/revalidate/route.ts` (novo), `next.config.ts` (`remotePatterns`), `ProductsSection`/`Card` (`link_label`). Novo `cms/parity/`.
- **Dependências:** `@directus/sdk` passa a dependência de runtime.
- **Env do site:** `CMS_URL`, `TOKEN_SECRET_READ`, `TOKEN_SECRET_FORM` (já existem), `CMS_PROVIDER`, `CMS_REVALIDATE_SECRET`.
- **Fora do repo:** o Flow de invalidação no hcms, criado por quem o administra.
- **Produção:** continua em `CMS_PROVIDER=payload`. A troca é feita na fase 4.
- **Sequência:** depois das fases 0b, 1 e 2.
