## 1. Leitura

- [x] 1.1 `hcms.ts`: a lista de campos de navegação gerada para `items` e `items.children` (D2)
- [x] 1.2 `hcms.ts`: `readNavigations` achata `items` e `items.children` num mapa por id, com o `parent` do filho igual ao grupo, e ignora netos (D1)
- [x] 1.3 `children` lido à parte (`rawNavChildren`), por isso um item com filhos continua válido em `rawNavItem`

## 2. Contrato

- [x] 2.1 `check-contract.ts`: pedir `items.type`, `items.parent`, `items.translations.label` e `items.children.id`, e falhar se uma coluna do `footer_columns` não tiver links nas duas formas (D3)

## 3. Verificação

- [x] 3.1 `npm run build` passa. Os ficheiros alterados passam no Biome; os erros de `npm run lint` são anteriores, em `src/components/ui/` (`grid-pattern`, `marquee`, `scroll-based-velocity`)
- [x] 3.2 `npm run cms:check` contra o hcms de produção (forma actual): colunas com 5, 3 e 5 links
- [x] 3.3 Dev server contra a instância local do template (forma nova, links só em `children`) e contra produção (forma actual): o footer da home é igual nos dois, Quick Links (5), Company (3) e Products (5), sem repetidos nem itens de navegação descartados
- [ ] 3.4 Deploy em produção (PR para `develop` → `main`), e só depois avisar o hcms para a fase B
