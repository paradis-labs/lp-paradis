## 1. Esqueleto do módulo

- [x] 1.1 Criar `src/content/{index,types,rich-text}.ts` e `src/content/providers/payload.ts`
- [x] 1.2 Adicionar `sanitize-html` (ou a alternativa decidida) e implementar `toRichText()` com a allowlist e `rel="noopener noreferrer"` em links externos
- [x] 1.3 Definir os tipos `Media`, `RichText` (tipo marcado), `Link` e `SocialLink` partilhados
- [x] 1.4 Mover `getPayloadInstance()` para dentro do provider (ou importá-lo só a partir dele)

## 2. Migrar por global (um commit cada; o site compila entre commits)

- [x] 2.1 NavBar: tipo de domínio, schema zod, mapeamento, `getNavBar`; trocar em `layout.tsx`, `Header` e fixture `navbar`
- [x] 2.2 Footer + Contact: `getFooter`, `getContact` e o tipo da faixa de contacto; trocar nas folhas de `@footer`, no `Footer` e na fixture `footer`
- [x] 2.3 Homepage: tipos de hero, serviços, projetos, testemunhos, FAQs e contacto; `getHomepage`; trocar em `(pages)/page.tsx` e nos componentes `Hero`, `ServicesSection`, `MarqueeServices`, `ProductsSection`, `TestimonialsSection`, `TestimonialCard`, `FAQSection`
- [x] 2.4 FAQ rich text: conversão Lexical → HTML no provider + `toRichText`; `FAQSection` renderiza o HTML sanitizado e deixa de importar `@payloadcms/richtext-lexical/react`
- [x] 2.5 GetQuote: `getQuotePage`; trocar em `get-quote/page.tsx`, `GetQuote` e na fixture `get-quote`
- [x] 2.6 Intake: `findServicesBySlugs` e `createQuoteRequest`; a Server Action passa a usá-los, mantendo zod, honeypot, tempo mínimo e `form.enabled`

## 3. Validação e erros (#4, #8)

- [x] 3.1 Em cada schema zod, marcar como obrigatório o que a UI exige; descartar itens de lista inválidos com `console.error` estruturado (slug, locale, id, caminho)
- [x] 3.2 Garantir que falhas de transporte e globals inválidas se propagam (sem `try/catch` que devolva vazio)
- [x] 3.3 Remover pisos em componentes que só existiam para compensar tipos demasiado opcionais, mantendo os pisos de conteúdo authorável

## 4. Paralelismo (#3)

- [x] 4.1 Identificar os fetches em série no layout e nas páginas e iniciá-los em paralelo

## 5. Remoção e guardas

- [x] 5.1 Apagar `src/service/payload-functions.ts` e `src/service/types.ts`; manter `s3.ts` e `constants.ts`, este só se ainda tiver uso
- [x] 5.2 Regra Biome `noRestrictedImports` para `payload`, `@payloadcms/*`, `@payload-config` e `payload-types` fora de `src/content/providers/`, `src/collections/`, `src/payload.config.ts` e `src/app/(payload)/`
- [x] 5.3 Atualizar `CLAUDE.md` (secção "Data fetching")

## 6. Verificação

- [x] 6.1 Guardar o HTML de `/en`, `/pt`, `/en/get-quote` e `/pt/get-quote` antes da mudança e comparar com o de depois: idêntico, exceto o markup do rich text das FAQ — resultado: DOM idêntico nas quatro páginas (a única diferença é um placeholder de streaming, timing). O rich text das 4 FAQs × 2 locales sai byte a byte igual ao do `<RichText>` antigo
- [ ] 6.2 Correr contra um dump de produção e ler os logs de itens descartados
- [ ] 6.3 Submeter o formulário em `/pt/get-quote` e confirmar o documento em `/admin`
- [x] 6.4 As três fixtures renderizam os seus estados degradados
- [ ] 6.5 `npm run lint` e `npm run build`
- [ ] 6.6 Fechar #8, #4 e #3 com referência ao PR
