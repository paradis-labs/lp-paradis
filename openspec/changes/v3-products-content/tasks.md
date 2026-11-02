## 1. Lead do detalhe

- [x] 1.1 `types.ts`: `ProductDetail.lead: string | null`
- [x] 1.2 `hcms.ts`: `lead: tr(record, "lead", language)` no mapeamento do detalhe
- [x] 1.3 `ProductDetail`: `PageHeader` com `product.lead ?? product.description`

## 2. Destaque na home

- [x] 2.1 `types.ts`: `Project.featured: boolean`
- [x] 2.2 `hcms.ts`: `is_featured` em `PROJECT_FIELDS`, `featured` em `toProjects`, `blocks.item:block_collection.featured_only` na leitura da página
- [x] 2.3 `hcms.ts`: a homepage filtra os projectos por `featured` quando o bloco `#products` tem `featured_only`

## 3. Verificação

- [x] 3.1 `npm run cms:check`, `npm run lint` (sem erros novos) e `npm run build`
- [x] 3.2 Antes do conteúdo novo: home e detalhes iguais a hoje (sem `lead`, sem `featured_only`)
- [x] 3.3 Depois da `paradis-v3-products` em produção: home com três produtos, `/products` com quatro, e os quatro detalhes com o lead do canvas
