## 1. Pré-condição

- [ ] 1.1 Confirmar que a janela de rollback da fase 4 fechou sem rollback e registar a data. Não cumprida: a remoção avançou a 2026-10-26 por decisão explícita, antes do cutover da fase 4. O estado anterior ficou commitado (`e80e5af`, `023a9b1`, `c7e1d20`) e a remoção vive no branch `chore/cms-phase-5-remove-payload`, para se poder reverter
- [ ] 1.2 Ver nos logs da janela o tráfego para `/cdn/*` e decidir se é preciso o redirect (ver design). Sem logs de produção disponíveis; a rota saiu sem redirect

## 2. Provider único

- [x] 2.1 Remover `CMS_PROVIDER` e a seleção em `src/content/index.ts`; o módulo usa sempre o provider hcms
- [x] 2.2 Apagar `src/content/providers/payload.ts` e o conversor Lexical → HTML
- [x] 2.3 Remover `cms/parity/`, `cms/hcms/verify-content.ts` e `cms/hcms/import-submissions.ts`; apontar o commit em `cms/hcms/README.md`. Removidos também `cms:export-leads` e os dois `accepted-differences.json`; `cms/hcms/README.md` aponta para `c7e1d20`

## 3. Payload fora do site

- [x] 3.1 Apagar `src/app/(payload)/`
- [x] 3.2 `next.config.ts`: remover `withPayload`, manter `withNextIntl`
- [x] 3.3 Apagar `src/payload.config.ts`, `src/collections/` (hooks de revalidação e `PAYLOAD_READ_ONLY` incluídos) e `payload-types.ts`
- [x] 3.4 Remover o alias `@payload-config` do `tsconfig.json`
- [x] 3.5 Confirmar que `/api/cms/revalidate` continua a responder. Testado no servidor standalone: 200 com o corpo do flow do template

## 4. `/cdn` e S3 fora do site

- [x] 4.1 Apagar `src/app/cdn/` e `src/service/s3.ts`
- [ ] 4.2 Remover `@aws-sdk/client-s3` e as variáveis `S3_*`. `@aws-sdk/client-s3` (e `@smithy/util-retry`) removidos; as variáveis `S3_*` saem do ambiente de produção com quem gere a infra (este repo não tem `.env.example`)

## 5. Cache para `"use cache"`

- [x] 5.1 Ligar `cacheComponents: true` e trocar para `"use cache"` + `cacheTag` + `cacheLife` em `src/content/`, com as mesmas tags
- [x] 5.2 Aplicar os ajustes da spike da 0b: (a) `generateStaticParams` em `[locale]/layout.tsx`; (b) o ano do copyright (`new Date()` no `Footer`) num leaf de cliente ou num escopo `"use cache"` diário, mantendo `footer-content-authority`; (c) o fallback do `LocaleSwitch` tem de ser um link real (ex. para a raiz do outro idioma), porque passa a sair no HTML estático. A rota `/cdn`, que também falhava, já saiu na secção 4. (a) feito; (b) o ano é um escopo `"use cache"` com `cacheLife("days")`; (c) o fallback é um link real para a mesma página no outro idioma (o `usePathname` é conhecido no prerender)
- [x] 5.3 Corrigir os restantes erros de build de dados de runtime fora de `Suspense`; se forem muitos, abrir uma change própria e manter `unstable_cache`. Só um erro novo: caminhos que o proxy não localiza chegavam a `[locale]` e davam 500; `requireLocale()` torna-os 404 (`dynamicParams = false` não é compatível com `cacheComponents`), e o proxy deixou de excluir `/admin`

## 6. Dependências e ambiente

- [x] 6.1 Remover `payload`, `@payloadcms/*` e `graphql`; atualizar o lockfile. Lockfile: 1044 → 626 pacotes
- [x] 6.2 Testar a remoção de `sharp`: build da imagem + `/_next/image` com uma imagem do hcms; repor se necessário. O `sharp` explícito saiu: o `next` traz o seu como dependência opcional. No servidor standalone, `/_next/image` converteu uma capa PNG do hcms em WebP de 9 KB. Falta confirmar no build da imagem Docker (linux-musl)
- [ ] 6.3 Remover `PAYLOAD_SECRET`, `DATABASE_URL` e `CMS_PROVIDER` do `.env.example`, do ambiente de produção e dos segredos. O repo não tem `.env.example`; os segredos de produção (`PAYLOAD_SECRET`, `DATABASE_URL`, `S3_*`) são com quem gere a infra. `CMS_PROVIDER` deixou de ser lido
- [x] 6.4 Regra Biome: restringir `@directus/sdk` a `src/content/providers/`, removendo as entradas do Payload

## 7. Infra

- [ ] 7.1 Uma semana depois do deploy desta fase: `pg_dump` da base do Payload com retenção de dados pessoais e desligar a base
- [ ] 7.2 Passar a decisão sobre o bucket S3 do Payload a quem gere a infra

## 8. Docs e verificação

- [x] 8.1 Reescrever `CLAUDE.md` (content model, data fetching, comandos, env vars, route groups) e `README.md`
- [ ] 8.2 `npm run lint`, `npm run build` e build da imagem Docker; `/en` e `/pt` 200, `/admin` 404. Lint sem erros novos (os 9 que restam já existiam), build a passar, e no servidor standalone `/en`, `/pt`, `/en/get-quote`, `/pt/get-quote` 200, `/admin` e caminhos desconhecidos 404. Falta o build da imagem Docker (o colima deste Mac não arranca)
- [ ] 8.3 Medir o tempo de build e o tamanho da imagem antes e depois. Local: standalone 87 → 48 MB (`node_modules` 67 → 41 MB), lockfile 1044 → 626 pacotes, build 26,2 → 28,3 s de tempo real (ruído; CPU 23,3 → 17,7 s). Falta o tamanho da imagem Docker
- [ ] 8.4 Editar no hcms → revalidação visível em produção
- [x] 8.5 `npm run cms:check` continua a passar. 27/27
