## 1. Footer

- [x] 1.1 `Footer/index.tsx`: criar a função pura `isProductDetailHref(href)` ao lado de `isRoutedHref`. Devolve `true` para `/products/<um segmento>`, com `/` final, `?query` ou `#hash` opcionais, e `false` para `/products`, `/products/`, `/products/a/b`, URLs absolutas e âncoras
- [x] 1.2 Trocar a condição da seta para `link.isExternal || isProductDetailHref(link.href)` e atualizar o comentário: a seta também marca os links de produto, que continuam internos (design D1/D2)
- [x] 1.3 Confirmar que o `FooterHref` não mudou: um link de produto não recebe `target`/`rel` e recebe o prefixo de locale (D3)

## 2. Fixture

- [x] 2.1 Na fixture `/[locale]/fixtures/footer`, acrescentar ao grupo Quick Links do `BASE` um link `Products` → `/products` e um link de produto interno (`Ficha Segura` → `/products/ficha-segura`, `isExternal: false`), para a mesma coluna mostrar seta no externo e no produto e não a mostrar na listagem

## 3. Verificação

- [x] 3.1 No dev server, em `/en` e `/pt`: as colunas Products e Quick Links mostram a seta nos quatro e nos dois produtos, respetivamente; `Home`, `Products` e `Services` não a mostram
- [x] 3.2 Os links de produto têm `href` `/<locale>/products/<slug>`, sem `target="_blank"` nem `rel`; hover e foco deslocam a seta na diagonal e, com movimento reduzido, ela fica parada
- [ ] 3.3 Comparar com o footer do canvas (`MainV3`) a 1440 e 390px
- [ ] 3.4 `npm run lint` e `npm run build` sem erros
