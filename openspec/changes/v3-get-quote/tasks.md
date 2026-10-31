## 1. Confirmação no hcms

- [x] 1.1 Verificar, só em leitura, se o formulário `quote_request` tem um campo `company` (nome, traduções, obrigatoriedade) e registar o resultado no design
- [x] 1.2 Se não existir, abrir o pedido no `Template-multisite-tenant` (`tooling/seed/paradis.mjs`) e seguir com a degradação "sem campo" — paradis-labs/Template-multisite-tenant#2

## 2. Conteúdo e escrita

- [x] 2.1 `types.ts`: `QuotePage.form.company: { label: string | null } | null` e `QuoteRequestInput.company: string | null`
- [x] 2.2 `providers/hcms.ts`: em `getQuotePage`, mapear o campo `company` (label com fallback para `en-US`) ou `null`
- [x] 2.3 `providers/hcms.ts`: em `createQuoteRequest`, ler o formulário com campos e incluir `data.company` só quando o campo existe e o valor não está vazio
- [x] 2.4 `src/lib/quote-request.ts`: `company` opcional com trim e `QUOTE_LIMITS.company`, mapeado em `toFieldErrors`
- [x] 2.5 `get-quote/actions.ts`: ler `company` do `FormData` e passá-lo só quando o formulário o declara

## 3. Página

- [x] 3.1 `get-quote/page.tsx`: ler `getQuotePage`, `getFooter` e `getContact` em paralelo e passar as props do aside
- [x] 3.2 `GetQuote`: usar o `PageHeader` (eyebrow, headline, intro) com a pill de disponibilidade por baixo e o ponto a pulsar
- [x] 3.3 `GetQuote`: grelha do formulário + aside com os breakpoints do mockup (uma coluna abaixo de 1024px)
- [x] 3.4 `QuoteForm`: título e subtítulo do cartão, grelha nome/e-mail/empresa (empresa só quando existe), chips `aria-pressed` com ícone que roda, textarea com placeholder, botão `primary`, nota de privacidade, estilos de input do v3
- [x] 3.5 `QuoteForm`: estado de sucesso com `role="status"` e "Send another" (remontar por `key`, foco no nome)
- [x] 3.6 Atualizar o `Record<Locale, …>` com a cópia de UI nova e os pisos novos de eyebrow e `messageLabel`, em EN e PT

## 4. Aside e footer

- [x] 4.1 Extrair o mapa de nomes de plataforma e a regra do nome acessível para `src/lib/social-platforms.ts` e usá-lo no `Footer`
- [x] 4.2 Criar o componente `QuoteContactAside` (server) com os três grupos, a degradação por grupo e o sticky a partir de 1024px
- [x] 4.3 `Footer`: prop `ctaBand` (por omissão `true`), remover `contactBand` e a faixa de contacto direto
- [x] 4.4 `@footer/get-quote/page.tsx`: passar `ctaBand={false}` e deixar de ler `getContact`

## 5. Fixtures

- [x] 5.1 `/fixtures/get-quote`: casos com e sem campo de empresa, estado de sucesso, e os seis estados do aside
- [x] 5.2 `/fixtures/footer`: remover os casos da faixa de contacto e acrescentar o caso `ctaBand={false}`

## 6. Verificação

- [x] 6.1 Comparar `/en/get-quote` e `/pt/get-quote` com o artboard a 1440, 1024, 768 e 390px
- [ ] 6.2 Submissão de teste em desenvolvimento com empresa, sem empresa e com honeypot; confirmar o `data` na `form_submissions`
- [ ] 6.3 Teclado: Tab por todos os campos e chips, Espaço nos chips, foco depois de "Send another"
- [ ] 6.4 `/pt/get-quote` com o CMS vazio (fixture): nenhuma string em inglês
- [x] 6.5 `npm run lint` e `npm run build` sem erros
