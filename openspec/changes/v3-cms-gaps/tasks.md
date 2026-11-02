## 1. Fase 1: get-quote

- [x] 1.1 `types.ts`: `QuotePage.form` ganha `successTitle`, `successAgainLabel` e `messagePlaceholder` (`string | null`)
- [x] 1.2 `hcms.ts`: lê-los de `forms.translations` (`success_title`, `success_again_label`) e do `placeholder` do campo `message`; confirmar que `translations.*` e `fields.translations.*` já os trazem
- [x] 1.3 `GetQuote`: resolver os três com `textOr(…, FALLBACK[locale].…)` e passá-los ao `QuoteForm` no lugar dos pisos diretos
- [x] 1.4 Fixture `fixtures/get-quote`: os três campos no conteúdo completo e `null` no vazio

## 2. Fase 1: poster do vídeo

- [x] 2.1 `types.ts`: `ourServicesCT.backgroundPoster: Media | null`
- [x] 2.2 `hcms.ts`: `fileFields("blocks.item:block_media_text.image")` na leitura da homepage e o mapeamento a partir do bloco `#about-us`
- [x] 2.3 Home: `poster` no `<video>` quando há imagem, mantendo `preload="none"` e o `VideoAutoPause`; atualizar o comentário do P1

## 3. Fase 1: ícones dos passos

- [x] 3.1 `types.ts`: `PRODUCT_ICONS` com `chart`, `heart`, `calendar`, `filter`, `bank`, `chat`, `leaf` e `bag`
- [x] 3.2 `ProductDetail`: os 8 traços em `FEATURE_ICON_PATHS` e o `calculator` com o traço da Ficha Segura (tabela de D4)
- [x] 3.3 Confirmar que um valor desconhecido continua a dar um passo sem ícone

## 4. Fase 1: verificação e conteúdo

- [x] 4.1 `npm run cms:check` (27/27), `npm run lint` (só os 5 erros que já existiam em `src/components/ui/`) e `npm run build`
- [x] 4.2 Get-quote (fixture) com os campos authorados e vazios, em en e pt; home sem poster (o bloco `#about-us` ainda não tem imagem no hcms: o `<video>` sai sem `poster`, como especificado; o caso com imagem fica para depois de 4.3)
- [ ] 4.3 Pedir a um editor o poster (WebP ou AVIF, ~1200px) no bloco `#about-us`. (`success_title`, `success_again_label`, o placeholder e o `success_message` curto já foram gravados em produção pela `paradis-v3-cms-gaps` do template.)

## 5. Template-multisite-tenant (noutro repo)

- [x] 5.1 Propor lá a change (`paradis-v3-cms-gaps` no `Template-multisite-tenant`, implementada e verificada localmente): as 8 opções no `select('icon')` dos `steps` (nomes de D4), `projects.short_name` (não traduzido), e o seed com os ícones dos quatro produtos, o nome curto da Génesis e, se se decidir, `success_title` e `success_again_label`
- [x] 5.2 Confirmar que a change foi aplicada ao hcms de produção (lido com `TOKEN_SECRET_READ`: `short_name`, ícones da Ficha Segura e textos do formulário)

## 6. Fase 2: nome curto (bloqueada por 5.2)

- [x] 6.1 `check-contract.ts`: exigir `projects.short_name`; `npm run cms:check` contra produção passa (28/28; com um campo inexistente falha e nomeia-o)
- [x] 6.2 `types.ts` e `hcms.ts`: `ProductDetail.shortName` lido de `projects.short_name`, só na leitura do detalhe (`PRODUCT_FIELDS`)
- [x] 6.3 `ProductDetail`: "Visit" com `shortName ?? title`
- [ ] 6.4 Pedir a um editor os ícones dos passos e o nome curto quando a Génesis e a Talama & Soba entrarem como projectos (o Kitenda e a Ficha Segura já têm os ícones do canvas em produção, e não precisam de nome curto)
- [x] 6.5 `npm run lint` (só os 5 erros que já existiam em `src/components/ui/`) e `npm run build`
