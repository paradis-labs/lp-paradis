## Why

No canvas do v3 (artboards `MainV3` e `Product`), os produtos do footer — na coluna **Products** e em **Quick Links** — têm a seta `↗` ao lado do nome. No site não têm. A seta não está mal desenhada: não é renderizada, porque o footer só a mostra com `isExternal` (`open_in_new_tab` no hcms), e os links de produto no hcms apontam hoje para as páginas de detalhe internas (`/products/kitenda`, `/products/ficha-segura`, `/products/genesis-sport-club`, `/products/talama-soba`) com `open_in_new_tab = false`.

Apontá-los de volta para o URL live não é solução: ficou decidido que o URL live só se visita a partir da página de detalhe, e que o resto do site encaminha para `/products/<slug>`. O canvas é anterior às páginas de produto e nunca foi atualizado. Também não dá para o editor marcar a seta no hcms: o campo `variant` de `navigation_items` é um dropdown fechado (`link`, `button_primary`, `button_secondary`), e acrescentar-lhe uma escolha seria mudar o schema, o que este repo não faz.

## What Changes

- Um link do footer cujo destino é a página de detalhe de um produto (`/products/<slug>`) passa a mostrar a seta `↗`, com o mesmo ícone e o mesmo hover diagonal (`.roll-arrow`) dos links externos.
- A regra é de código, pela rota, e vale em todas as colunas (Products e Quick Links, como no canvas). A listagem `/products` não recebe seta, nem as outras rotas internas.
- O link continua interno: mesma aba, sem `target="_blank"`, sem `rel` de externo, com o prefixo de locale como hoje. Só ganha a seta.
- Os links externos (`isExternal`) não mudam.
- A fixture do footer ganha um link de produto interno, para mostrar a seta num link que não é externo.

## Capabilities

### New Capabilities
<!-- Nenhuma. -->

### Modified Capabilities
- `footer-link-semantics`: a requisito "Externo e interno se distinguem por um único flag authorável" diz que um link interno SHALL NOT exibir a seta. Passa a ter uma exceção: um link interno para a página de detalhe de um produto exibe a seta, sem nenhum dos outros atributos de link externo.

## Impact

- **Código**: `src/components/Footer/index.tsx` (a condição da seta) e a fixture `src/app/(app)/[locale]/(pages)/fixtures/footer/page.tsx`.
- **Sem mudanças** em hcms (schema ou conteúdo), em `src/content/` (tipos e provider), em `ExternalArrow`, em `Glyphs` e em CSS.
- **Acessibilidade**: a seta continua decorativa (`aria-hidden`); o nome acessível é o rótulo.
