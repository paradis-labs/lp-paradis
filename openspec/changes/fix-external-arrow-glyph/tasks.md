## 1. Componente

- [x] 1.1 Criar `src/components/ExternalArrow/index.tsx`: `<span className={cn("roll-arrow", className)} aria-hidden="true">` com o `ArrowUpRight` da `lucide-react` (`size="1em"`, `aria-hidden`)

## 2. Usos

- [x] 2.1 `Footer/index.tsx`: trocar o `<span className="roll-arrow">↗</span>` dos links externos por `<ExternalArrow />`, mantendo o comentário sobre o nome acessível
- [x] 2.2 `ProductDetail/index.tsx`: trocar a seta do URL do produto por `<ExternalArrow />`
- [x] 2.3 `GetQuote/QuoteContactAside.tsx`: trocar a seta do e-mail por `<ExternalArrow className="text-lg" />`

## 3. Verificação

- [x] 3.1 `grep` por `↗` em `src/` sem resultados fora de comentários
- [ ] 3.2 Comparar com o mockup (footer, aside e detalhe de produto) a 1440 e 390px: tamanho, traço e alinhamento; afinar o traço em `ExternalArrow` se for preciso
- [x] 3.3 Hover e foco deslocam a seta; com movimento reduzido fica parada
- [ ] 3.4 Abrir no iPhone (Safari) e confirmar que a seta não aparece como emoji
- [ ] 3.5 `npm run lint` e `npm run build` sem erros
