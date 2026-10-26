## 1. Access control

- [x] 1.1 Em `src/collections/QuoteRequests.ts`, trocar `create: () => true` por `create: ({ req }) => Boolean(req.user)`
- [x] 1.2 Reescrever o comentário do topo e o comentário sobre `create`: a escrita anónima passa a ser só pela Server Action, e a API REST não aceita criação anónima

## 2. Server Action

- [x] 2.1 Em `get-quote/actions.ts`, acrescentar `overrideAccess: true` ao `payload.create`, com um comentário de uma linha a dizer que é a única via de escrita anónima
- [x] 2.2 Confirmar que nenhuma outra chamada da Local API a `quote-requests` passa `overrideAccess: false`

## 3. Verificação

- [ ] 3.1 `npm run dev`: submeter o formulário em `/en/get-quote` e confirmar o documento novo em `/admin`
- [x] 3.2 `curl -X POST /api/quote-requests` anónimo com corpo válido → 403 e nenhum documento novo
- [x] 3.3 `GET /api/quote-requests` anónimo continua sem devolver submissões
- [ ] 3.4 `npm run lint` e `npm run build` passam — build ✓; os ficheiros alterados passam o Biome, mas `npm run lint` já falhava antes desta change (46 erros noutros ficheiros)
