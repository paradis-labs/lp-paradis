## 1. Pré-condição

- [ ] 1.1 Confirmar que a janela de rollback da fase 4 fechou sem rollback e registar a data
- [ ] 1.2 Ver nos logs da janela o tráfego para `/cdn/*` e decidir se é preciso o redirect (ver design)

## 2. Provider único

- [ ] 2.1 Remover `CMS_PROVIDER` e a seleção em `src/content/index.ts`; o módulo usa sempre o provider hcms
- [ ] 2.2 Apagar `src/content/providers/payload.ts` e o conversor Lexical → HTML
- [ ] 2.3 Remover `cms/parity/`, `cms/hcms/verify-content.ts` e `cms/hcms/import-submissions.ts`; apontar o commit em `cms/hcms/README.md`

## 3. Payload fora do site

- [ ] 3.1 Apagar `src/app/(payload)/`
- [ ] 3.2 `next.config.ts`: remover `withPayload`, manter `withNextIntl`
- [ ] 3.3 Apagar `src/payload.config.ts`, `src/collections/` (hooks de revalidação e `PAYLOAD_READ_ONLY` incluídos) e `payload-types.ts`
- [ ] 3.4 Remover o alias `@payload-config` do `tsconfig.json`
- [ ] 3.5 Confirmar que `/api/cms/revalidate` continua a responder

## 4. `/cdn` e S3 fora do site

- [ ] 4.1 Apagar `src/app/cdn/` e `src/service/s3.ts`
- [ ] 4.2 Remover `@aws-sdk/client-s3` e as variáveis `S3_*`

## 5. Cache para `"use cache"`

- [ ] 5.1 Ligar `cacheComponents: true` e trocar para `"use cache"` + `cacheTag` + `cacheLife` em `src/content/`, com as mesmas tags
- [ ] 5.2 Aplicar os ajustes da spike da 0b: (a) `generateStaticParams` em `[locale]/layout.tsx`; (b) o ano do copyright (`new Date()` no `Footer`) num leaf de cliente ou num escopo `"use cache"` diário, mantendo `footer-content-authority`; (c) o fallback do `LocaleSwitch` tem de ser um link real (ex. para a raiz do outro idioma), porque passa a sair no HTML estático. A rota `/cdn`, que também falhava, já saiu na secção 4
- [ ] 5.3 Corrigir os restantes erros de build de dados de runtime fora de `Suspense`; se forem muitos, abrir uma change própria e manter `unstable_cache`

## 6. Dependências e ambiente

- [ ] 6.1 Remover `payload`, `@payloadcms/*` e `graphql`; atualizar o lockfile
- [ ] 6.2 Testar a remoção de `sharp`: build da imagem + `/_next/image` com uma imagem do hcms; repor se necessário
- [ ] 6.3 Remover `PAYLOAD_SECRET`, `DATABASE_URL` e `CMS_PROVIDER` do `.env.example`, do ambiente de produção e dos segredos
- [ ] 6.4 Regra Biome: restringir `@directus/sdk` a `src/content/providers/`, removendo as entradas do Payload

## 7. Infra

- [ ] 7.1 Uma semana depois do deploy desta fase: `pg_dump` da base do Payload com retenção de dados pessoais e desligar a base
- [ ] 7.2 Passar a decisão sobre o bucket S3 do Payload a quem gere a infra

## 8. Docs e verificação

- [ ] 8.1 Reescrever `CLAUDE.md` (content model, data fetching, comandos, env vars, route groups) e `README.md`
- [ ] 8.2 `npm run lint`, `npm run build` e build da imagem Docker; `/en` e `/pt` 200, `/admin` 404
- [ ] 8.3 Medir o tempo de build e o tamanho da imagem antes e depois
- [ ] 8.4 Editar no hcms → revalidação visível em produção
- [ ] 8.5 `npm run cms:check` continua a passar
