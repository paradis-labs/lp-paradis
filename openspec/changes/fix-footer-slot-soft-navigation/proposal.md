## Why

Depois de navegar de `/get-quote` para a home por clique, a faixa de contacto direto continua no footer (#14). É a semântica documentada das rotas paralelas: numa navegação soft, um slot que não casa com a nova URL **mantém** a sua subpágina anterior, e `default.tsx` só é usado em hard navigation. O slot `@footer` só tem `get-quote/page.tsx` e `default.tsx`, por isso em `/en` fica "unmatched" e conserva a variante de `/get-quote`. Esta change também prepara a fase 0a da migração, que vai reescrever os ficheiros deste slot: convém que ela parta de um slot correto e sem código morto.

## What Changes

- O slot `@footer` passa a casar com **todas** as rotas numa navegação soft: `@footer/page.tsx` cobre a raiz e `@footer/[...catchAll]/page.tsx` cobre qualquer outra rota sem composição própria (incluindo as fixtures). É o padrão que a doc do Next recomenda para este caso.
- `default.tsx` mantém-se como rede de 404 em hard navigation.
- As três folhas genéricas (`page`, `[...catchAll]/page`, `default`) delegam num único módulo partilhado, em vez de duplicarem o corpo.
- `@footer/get-quote/page.tsx` volta a ler o e-mail de `Contact.email`. O issue tratava `getContactPayload` como import morto, mas era a busca em falta: a folha passava `directContact.emailHeading` (um título, ex. "Email Us") como endereço, e a faixa mostrava `mailto:Email Us`, o que viola `footer-direct-contact-band` ("O e-mail vem da coleção Contact"). Saem o import realmente morto (`cache`) e a formatação solta.

## Capabilities

### New Capabilities

_(nenhuma)_

### Modified Capabilities

- `route-scoped-footer`: a composição do footer passa a ter de acompanhar a rota também em navegação soft, e não só em carregamento completo.

## Impact

- **Código:** `src/app/(app)/[locale]/@footer/` (novos `page.tsx` e `[...catchAll]/page.tsx`, um módulo partilhado, limpeza de `get-quote/page.tsx`), `default.tsx` passa a delegar.
- **Sem alteração** a `layout.tsx`, ao `Footer` ou aos fetchers.
- **Sequência:** antes de `cms-phase-0a-content-seam`.
- **Rejeitado:** a opção C do issue (ler o segmento com `useSelectedLayoutSegment`) viola `route-scoped-footer`, que proíbe hooks de cliente no caminho do footer.
