## ADDED Requirements

### Requirement: As rotas de página têm um fallback de carregamento

O grupo `src/app/(app)/[locale]/(pages)/` SHALL ter um `loading.tsx`, para que uma navegação para uma rota dinâmica mostre de imediato o shell da página em vez de manter a página anterior inerte até o servidor responder.

O fallback SHALL manter o header e o footer do layout visíveis e SHALL NOT introduzir texto visível que não seja localizado.

#### Scenario: Navegação lenta

- **WHEN** o visitante clica num link interno com a rede limitada a "Slow 4G"
- **THEN** o fallback de carregamento aparece antes de a nova página estar pronta
- **AND** o header continua visível e interativo

### Requirement: Barra de progresso de navegação acima do navbar

SHALL existir uma barra fina (2–3px), fixa no topo da viewport e acima do navbar, visível enquanto uma navegação interna está pendente e escondida quando a nova rota fica ativa.

A barra SHALL iniciar no clique num link interno do mesmo origin, sem teclas modificadoras e sem `target="_blank"`, e SHALL terminar quando o pathname muda. Links externos, `mailto:`, `tel:` e âncoras na mesma página SHALL NOT iniciar a barra.

A barra SHALL ser decorativa para tecnologias de apoio (`aria-hidden`).

#### Scenario: Navegação interna

- **WHEN** o visitante clica num link do navbar para outra rota
- **THEN** a barra aparece no topo durante a navegação e desaparece quando a nova página fica ativa

#### Scenario: Link externo

- **WHEN** o visitante clica no link de um card de projeto, que abre noutra aba
- **THEN** a barra não aparece

#### Scenario: Âncora na mesma página

- **WHEN** o visitante está em `/en` e clica num link para `/en#services`
- **THEN** a barra não aparece

#### Scenario: Movimento reduzido

- **WHEN** `prefers-reduced-motion: reduce` está ativo e uma navegação está pendente
- **THEN** a barra indica o estado pendente sem animar a largura
