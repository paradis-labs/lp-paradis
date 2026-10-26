## Context

O site tem dois locales (`en`, `pt`) e todo o conteúdo editorial vem do CMS, por `@/content`. Há três tipos de texto definidos no código:

```
  texto definido no código
  ├── badges das secções         "Our Services" (ServicesSection), "Our Products"
  │                              (ProductsSection), "Testimonials" (TestimonialsSection)
  ├── pisos (CMS vazio)          Footer FALLBACK, GetQuote FALLBACK,
  │                              QUOTE_MESSAGE_FALLBACK (lib/quote-request.ts),
  │                              "Discover More" (ProductsSection)
  └── grelha de serviços         SERVICE_LAYOUT: 7 cartões com slug, ícone, layout
                                 e fallbackName/fallbackDescription
```

Todos estão só em inglês. A grelha junta os serviços do CMS aos cartões por slug, e o cartão de UI/UX tem `uiux-design` enquanto os dois providers entregam `ui-ux-design`. O fallback dele aparece sempre, e em `/pt` aparece em inglês.

Já existe um padrão para texto de UI por idioma: `Record<Locale, string>` dentro do componente (`NEW_TAB_HINT` no `ProductsSection`, `SWITCH_LABEL` no `LocaleSwitch`). O next-intl só faz o routing: não há ficheiros de mensagens, e o seu runtime de cliente foi evitado de propósito, porque acrescentava 33,6 KB ao chunk (`src/lib/locale-href.ts`).

## Goals / Non-Goals

**Goals:**
- Nenhum texto em inglês em `/pt` que venha do código.
- Os sete cartões da grelha encontram o seu serviço no CMS.
- `/en` fica exatamente igual.

**Non-Goals:**
- Badges editáveis no CMS: o `eyebrow` dos blocos do hcms serviria, mas o Payload não o tem. Fica para depois da fase 5 de `migrate-cms-to-directus`.
- Mensagens do next-intl, ou outro sistema de i18n para a UI.
- Desenhar a grelha a partir da lista do CMS (ordem e quantidade vindas do editor). A composição fixa é uma decisão da fase 1.
- Corrigir o slug `api-and-integrations` no hcms: é conteúdo (fase 2).

## Decisions

### Texto por idioma no componente, como o resto do repo
Cada componente com texto próprio passa a ter as suas cópias como `Record<Locale, …>` e escolhe pela prop `locale`. Os componentes que ainda não recebem o locale (`ServicesSection`) passam a recebê-lo da página, como já fazem o `ProductsSection` e o `TestimonialsSection`.

Alternativa considerada: mensagens do next-intl (`messages/en.json`, `pt.json`). Rejeitada porque traz um sistema novo para meia dúzia de textos, e o runtime de cliente custa bundle em componentes de cliente. Nos de servidor seria viável, mas misturar os dois padrões é pior do que ter um só.

### O mesmo objeto de pisos por idioma, não um piso por campo
`FALLBACK` (Footer, GetQuote) e `QUOTE_MESSAGE_FALLBACK` passam a `Record<Locale, typeof …>`. Assim, um piso novo esquecido num idioma falha na compilação, em vez de cair em inglês em silêncio. `QUOTE_MESSAGE_FALLBACK` só é lido pelo `GetQuote`, que já recebe o locale e resolve todas as mensagens (incluindo as de validação) antes de as passar ao formulário. A Server Action não muda.

### A grelha usa o slug do domínio
O cartão de UI/UX passa de `uiux-design` para `ui-ux-design`, o slug que `@/content` entrega nos dois providers. Não é preciso tocar no domínio.

Alternativa considerada: juntar pela `key` da oferta no hcms (`uiux-design`, estável e sem tradução). Rejeitada nesta mudança porque o Payload não tem esse identificador: seria um campo novo no domínio só para isto. O slug `en-US` já é estável nos dois.

### O texto de recurso da grelha também por idioma
`fallbackName`/`fallbackDescription` passam a ter `en` e `pt`. Com os slugs certos, só aparecem quando um serviço falta mesmo no CMS, e mesmo assim não trazem inglês para `/pt`.

## Risks / Trade-offs

- [Um texto novo no código ficar só num idioma] → O tipo `Record<Locale, …>` obriga a ter os dois.
- [O cartão de API continua no fallback até o hcms corrigir o slug] → Já está na lista de correções da fase 2. Com este design o fallback aparece em português, não em inglês.
- [Traduções feitas por quem programa] → As cópias pt dos pisos seguem o texto que os editores já puseram no hcms (o formulário de orçamento, o rodapé, os serviços, "Saber mais"). Os badges ficaram curtos por decisão de quem revê: "Serviços", "Produtos", "Testemunhos". Os editores revêm o resto no PR.

## Migration Plan

Sem migração. Deploy normal; `/en` fica igual. Rollback: reverter o commit.

## Open Questions

- Os badges devem passar a vir do CMS quando o Payload sair? Fica registado como evolução possível, não decidido.
