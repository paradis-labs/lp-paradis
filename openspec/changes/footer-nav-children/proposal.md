## Why

O hcms vai mudar a forma da navegação (change `footer-sections-editable` no `Template-multisite-tenant`). Hoje cada link de uma coluna do footer tem `navigation` e `parent`, por isso aparece em `navigations.items` ao lado dos grupos, e `readNavigations` monta a árvore por `parent`. Depois da migração, os links de uma coluna ficam ligados só ao grupo (`parent`) e chegam apenas em `items.children`. Se o site continuar a ler só `items`, as colunas Quick Links, Company e Products ficam vazias.

A migração no hcms (fase B) só corre depois de este change estar em produção.

## What Changes

- `readNavigations` em `src/content/providers/hcms.ts` passa a pedir também `items.children.*`, com os mesmos campos e traduções. Junta as duas formas:
  - links planos em `items`, identificados por `parent`;
  - links aninhados em `items.children`;
  - sem duplicar ids, porque na forma actual o mesmo link vem nas duas.
- `topLevel` e `children` continuam a devolver o mesmo, por isso header, footer e CTA não mudam.
- `cms:check` passa a contar também os links das colunas em `items.children`, e a falhar se uma coluna do `footer_columns` ficar sem links nas duas formas.
- Um terceiro nível vindo do hcms é ignorado, porque o hcms já o recusa (flow "Navigation levels").

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `hcms-content-contract`: a navegação é lida nas duas formas (plana por `parent` e aninhada em `items.children`), e o `cms:check` verifica os links das colunas.

## Impact

- **Ficheiros:** `src/content/providers/hcms.ts` e `cms/hcms/check-contract.ts`.
- **Cache:** nenhuma mudança. `navigation_items` já invalida `navbar` e `footer`.
- **Ordem de deploy:** este change vai para produção primeiro. Só depois o hcms corre a fase B (`navigation: null` nos 13 links). O caminho plano pode sair num change seguinte, depois da fase B.
