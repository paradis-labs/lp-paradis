## 1. Grelha de serviços

- [x] 1.1 `ServicesSection`: o cartão de UI/UX passa de `uiux-design` para `ui-ux-design`
- [x] 1.2 `ServicesSection` recebe `locale` da página da home; `fallbackName`/`fallbackDescription` passam a `en`/`pt`
- [x] 1.3 Badge "Our Services" por idioma ("Serviços" em `pt`)

## 2. Badges e rótulos das secções

- [x] 2.1 `ProductsSection`: badge "Our Products" ("Produtos") e piso "Discover More" ("Saber mais") por idioma
- [x] 2.2 `TestimonialsSection`: badge "Testimonials" ("Testemunhos") por idioma

## 3. Pisos

- [x] 3.1 `Footer`: `FALLBACK` passa a `Record<Locale, …>` e escolhe pelo `locale` que já recebe (`logoUrl` fica comum)
- [x] 3.2 `GetQuote`: `FALLBACK` por idioma, com as cópias pt alinhadas com o formulário no hcms
- [x] 3.3 `lib/quote-request.ts`: `QUOTE_MESSAGE_FALLBACK` por idioma; `GetQuote` escolhe pelo locale; `QuoteMessages` continua a ser o tipo de um idioma

## 4. Verificação

- [x] 4.1 Fixture do footer (`/[locale]/fixtures/footer`): o estado com o CMS vazio mostra os pisos em `pt` em `/pt/fixtures/footer` (a fixture já passa o locale da rota; em `/pt/fixtures/footer` o caso do global vazio mostra os oito pisos em português)
- [x] 4.2 Com `CMS_PROVIDER=hcms`: `/pt` sem badges em inglês, e os sete cartões da grelha com texto do CMS (o de API depois de o hcms corrigir o slug; até lá, piso em português). Verificado com o build de produção: nenhum badge nem "Discover More" em inglês; seis cartões com o texto do CMS e o de API com o piso pt (o slug en-US no hcms continua `api-and-integrations`); `/pt/get-quote` em português
- [x] 4.3 `/en` igual a antes, com os dois providers (com o Payload, `/en` mostra os mesmos badges e rótulos; em `/pt` o inglês que resta vem do fallback de locale do próprio Payload)
- [x] 4.4 `npm run lint` nos ficheiros tocados e `npm run build`
