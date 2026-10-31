## Why

O artboard "v3 · Get Quote (EN)" (`openspec/design/v3 · Get Quote (EN)-html/`) redesenha a página de orçamento, que é o principal caminho de conversão do site. Traz a página para a linguagem visual da home v3, junta numa só coluna lateral as formas de contacto que hoje estão espalhadas pelo footer, e acrescenta duas coisas ao formulário: um campo de empresa opcional e um estado de sucesso que permite um novo envio.

## What Changes

- `/[locale]/get-quote` com o layout do v3: `PageHeader` (eyebrow, H1, lead, pill de disponibilidade) e, por baixo, uma grelha com o formulário num cartão e um **aside** de contacto sticky.
- **Formulário**: título "Tell us about your project" com subtítulo, nome, e-mail e **empresa (opcional)** numa grelha de duas colunas, chips de interesse com ícone que roda quando selecionados, textarea com placeholder, botão `primary` e nota de privacidade. Inputs e chips com os estados de hover e foco do v3.
- **Campo empresa**: só renderiza, e só é enviado, quando o formulário `quote_request` do hcms declarar um campo `company`. A label vem desse campo. Sem schema novo neste repo.
- **Estado de sucesso**: o cartão do formulário dá lugar a uma confirmação (ícone, a mensagem de sucesso do CMS, subtítulo) com um botão "Send another" que repõe o formulário vazio.
- **Aside de contacto**: "Reach us directly" com o e-mail, "Prefer to talk?" com o CTA de chamada, e "Elsewhere" com as redes. Os títulos e o conteúdo vêm das mesmas fontes que a faixa de contacto direto usa hoje.
- **Footer de `/get-quote`**: perde a faixa de contacto direto, que passa a ser o aside, e a faixa "Ready to build?", porque a página já é o destino desse CTA. **BREAKING** para a spec `footer-direct-contact-band`: a faixa deixa de existir no footer.

## Capabilities

### New Capabilities
- `quote-contact-aside`: o aside de contacto da página de orçamento: posição, conteúdo, fontes, degradação e comportamento responsivo.

### Modified Capabilities
- `get-quote-page`: layout do v3, mapeamento dos textos (eyebrow no cabeçalho, título e subtítulo do formulário como cópia de UI) e o campo de empresa condicionado ao formulário do hcms.
- `quote-request-intake`: empresa opcional gravada em `data.company`, e o estado de sucesso com novo envio.
- `footer-direct-contact-band`: a faixa sai do footer de `/get-quote`. As regras de conteúdo (e-mail do `Contact`, títulos localizados, nomes de plataforma, ordem, degradação) passam para o aside.
- `route-scoped-footer`: a composição do footer de `/get-quote` passa a ser "sem faixa de contacto e sem faixa CTA".

## Impact

- **Código**: `src/components/GetQuote/*`, `src/app/(app)/[locale]/(pages)/get-quote/page.tsx` e `actions.ts`, `src/lib/quote-request.ts` (schema zod), `src/app/(app)/[locale]/@footer/get-quote/page.tsx`, `Footer` (prop para omitir a faixa CTA), fixtures `get-quote` e `footer`.
- **Conteúdo**: `QuotePage.form` ganha `company: { label } | null`, e `QuoteRequestInput` ganha `company: string | null`. O provider lê `fields.name = "company"` do formulário que já lê, e escreve `data.company`. **Nenhuma escrita no schema do hcms.** Se o campo não existir no template, a página fica sem o campo e continua a funcionar.
- **Leituras**: a página passa a ler também `getFooter` (os títulos e as redes do aside, e o CTA de chamada) e `getContact` (o e-mail), e o footer deixa de ler `getContact`. O total de leituras por request não muda.
- **Depende de** `v3-home-reskin` (botão, `PageHeader`, layout do footer).
