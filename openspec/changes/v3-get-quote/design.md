## Context

- **Referência:** `openspec/design/v3 · Get Quote (EN)-html/GetQuote.dc.html`. Navbar, footer e botões são os de `v3-home-reskin`, de que esta change depende.
- **Estado atual:** `GetQuote` (server) resolve os textos com `textOr` e um `FALLBACK: Record<Locale, …>`, e passa ao `QuoteForm` (client) só strings e a lista de chips. A action `submitQuoteRequest` valida com `quoteSubmissionSchema` (zod, partilhado), resolve os interesses por slug e chama `createQuoteRequest`, que faz `POST form_submissions` com `data: { name, email, interests, message }`. Os nomes em `data` são os `form_fields.name` do formulário `quote_request`. A folha `@footer/get-quote` junta `getFooter` e `getContact` para a faixa de contacto direto.
- **Restrição:** o schema do formulário pertence ao `Template-multisite-tenant`. Este repo lê `fields.name` e as traduções, mas não cria campos.

## Goals / Non-Goals

**Goals:**
- A página com o layout e as interações do v3, nos dois locales.
- Empresa opcional ponta a ponta, sem schema novo aqui, e a degradar quando o hcms não a tem.
- Contacto num só sítio (o aside) e um footer de `/get-quote` mais curto.

**Non-Goals:**
- Criar o campo `company` no hcms. Fica pedido ao repo do template, se ainda não existir.
- Mudar validação, honeypot, a válvula `isQuoteFormEnabled` ou o fluxo de escrita além do campo novo.
- Consentimento, anexos ou mais campos.

## Decisions

### D1. A empresa depende de `fields.name = "company"`
O provider já lê `fields.name` e `fields.translations` em `readForm(where, true)`. `getQuotePage` passa a expor `form.company: { label: string | null } | null`: `null` quando o campo não existe. A página só renderiza o input quando não é `null`. Na escrita, `createQuoteRequest` precisa de saber se o campo existe: lê o formulário com `withFields: true` (hoje lê com `false`) e só inclui `data.company` quando o campo existe e o valor não está vazio.
- *Alternativa:* enviar sempre `data.company`. Rejeitada: o comportamento do hcms com chaves fora de `form_fields` não está confirmado (a fase 1 já registou a forma do payload como lacuna), e um 4xx partiria a única escrita pública do site.
- *Alternativa:* guardar a empresa dentro de `message`. Rejeitada: estraga o dado para quem lê as submissões.

### D2. Schema zod: `company` opcional e com limite
`quoteSubmissionSchema` ganha `company: z.string().trim().max(QUOTE_LIMITS.company).optional()`, e `toFieldErrors` mapeia o erro para o campo `company` com a mensagem `tooLong`. Um valor vazio depois do trim fica `undefined`. A action só passa `company` a `createQuoteRequest` quando o formulário o declara (D1), e a decisão é tomada no servidor.

### D3. O sucesso substitui o cartão e "Send another" faz reset no cliente
O `QuoteForm` já usa `useActionState`. O estado `success` passa a renderizar a confirmação no lugar do `<form>`. "Send another" incrementa uma `key` local que remonta o formulário (limpa inputs e chips sem estado manual) e põe o foco no campo do nome. Não há nova ida ao servidor.

### D4. O aside é server e lê o que o footer lia
A página (`get-quote/page.tsx`) passa a ler em paralelo `getQuotePage`, `getFooter` e `getContact`, e monta as props do aside: `reachHeading`, `socialHeading`, `email`, `socialLinks`, `callCta = cta.outlineButton`. A folha `@footer/get-quote` deixa de ler `getContact`, e o total de leituras por request fica igual. As três estão cacheadas com `"use cache"`, por isso a repetição de `getFooter` (página + footer) é um hit de cache.
- O mapa de nomes de plataforma e a regra do `label` como nome acessível passam do `Footer` para um módulo partilhado (`src/lib/social-platforms.ts`), usado pelo aside e pela barra inferior do footer.

### D5. O footer ganha `variant`, e a folha escolhe
O `Footer` recebe `ctaBand?: boolean` (por omissão `true`) e deixa de receber `contactBand`. A folha `@footer/get-quote` passa `ctaBand={false}`. O mapeamento rota → composição continua no slot `@footer`, em código (`route-scoped-footer`).

### D6. Cópia de UI nova no componente
"Tell us about your project", "A few details are enough to get started.", o placeholder da textarea, "(optional)", "Prefer to talk?", "30 minutes, no commitment.", "We'll reply within one business day." e "Send another" vão para o `Record<Locale, …>` do `GetQuote`, ao lado dos pisos atuais. O piso do eyebrow passa de "THE BRIEF" para "Get a Quote", e o de `messageLabel` para "Your project". Os valores authorados no hcms não mudam: se o editor tiver "THE BRIEF", é o que aparece.

## Risks / Trade-offs

- **O campo `company` pode não existir no template** → a página degrada sem ele (especificado). Fica uma tarefa de confirmação e, se faltar, um pedido ao repo do template.
- **Ler o formulário com campos na escrita** acrescenta bytes a cada submissão → é uma leitura pequena, num caminho já não cacheado e de baixa frequência.
- **O aside depende de `cta.outlineButton` do footer** para o link de chamada → se o editor mudar esse botão para outra coisa, o aside acompanha. Fica documentado no comentário do componente.
- **Os editores perdem a faixa no footer** → o conteúdo (`directContact`) continua a ser usado, só muda de sítio. Não há campo órfão.

## Migration Plan

1. Confirmar no hcms (leitura com `TOKEN_SECRET_READ`, ou `npm run cms:check`) se `quote_request` tem `company`.
2. Implementar e verificar na fixture e no dev server, com e sem o campo (a fixture simula os dois).
3. Fazer uma submissão de teste em desenvolvimento e confirmar `data.company` na `form_submissions`.
4. Rollback: reverter o merge. As submissões já gravadas com `company` continuam válidas.

## Open Questions

- ~~O campo `company` já existe em `quote_request` no template?~~ **Não** (lido no hcms a 2026-10-31): o formulário tem `name`, `email`, `interests` e `message`. A página fica sem o campo até o template o acrescentar; quem o acrescenta e quando continua em aberto.
  - **Conflito no template:** o seed (`tooling/seed/paradis.mjs`) usa `company` como `honeypot_field` do formulário. Um campo real `company` só pode entrar se o honeypot mudar de nome (proposta: `website`). Caso contrário, o guarda do hcms descartaria como spam toda a submissão que trouxesse empresa. O site não é afectado pela mudança, porque usa o seu próprio honeypot (`name="honeypot"`) e não o envia.
- O rótulo authorado da mensagem é "Tell us about your project", igual ao título novo do cartão. Os pisos não se aplicam a campos preenchidos, por isso os dois textos repetem-se até um editor mudar o rótulo para "Your project".
- O piso PT de "Get a Quote": "Pedir orçamento" ou "Peça um orçamento"?
