## 1. Módulo partilhado

- [x] 1.1 Criar `src/app/(app)/[locale]/@footer/base-footer.tsx` com o corpo atual de `default.tsx` (fetch da global + `<Footer>`)
- [x] 1.2 `default.tsx` passa a reexportar o componente partilhado, mantendo o comentário "rede de 404"

## 2. Folhas novas

- [x] 2.1 Criar `@footer/page.tsx` (raiz) a reexportar o componente partilhado
- [x] 2.2 Criar `@footer/[...catchAll]/page.tsx` a reexportar o componente partilhado, com um comentário a citar a nota da doc de parallel routes sobre soft navigation

## 3. Limpeza de `@footer/get-quote/page.tsx`

- [x] 3.1 ~~Remover o import morto `getContactPayload`~~ — não estava morto: era a busca em falta. A folha passava `directContact.emailHeading` (o título) como endereço. Passa a ler `Contact.email` por `getContactPayload`, em paralelo com a global, como exige `footer-direct-contact-band`. Sai o import realmente morto, `cache`
- [x] 3.2 Corrigir o comentário: títulos de `directContact`, endereço de `Contact.email`, e o registo do bug anterior
- [x] 3.3 `npm run format` sobre o ficheiro

## 4. Verificação

- [ ] 4.1 `/en/get-quote` → clicar no logo → a faixa desaparece; repetir em `/pt`
- [ ] 4.2 `/en/get-quote` → `/en/fixtures/navbar` por clique → sem faixa
- [ ] 4.3 F5 em `/en` e nas três fixtures → 200, footer único, sem faixa
- [ ] 4.4 `/en` → `/en/get-quote` → a faixa aparece
- [ ] 4.5 Confirmar que o `footer` é buscado uma vez por request (log temporário no fetcher, removido antes do commit)
- [ ] 4.6 `npm run lint` e `npm run build`
