## ADDED Requirements

### Requirement: O link de um card de projeto abre em nova aba

O link de destino de um card de projeto (`url` da coleção `Projects`) SHALL ser renderizado como `<a>` nativo, com `target="_blank"` e `rel="noopener noreferrer"`, e SHALL NOT usar `next/link`, que não traz nada a um destino externo.

O nome acessível do link SHALL indicar que abre numa aba nova.

#### Scenario: Clique em "Discover More"

- **WHEN** o visitante clica no link de um card de projeto
- **THEN** o destino abre numa aba nova e a aba do site mantém-se na mesma página

#### Scenario: Sem acesso ao `window` de origem

- **WHEN** a página de destino lê `window.opener`
- **THEN** o valor é `null`

#### Scenario: Leitor de ecrã

- **WHEN** um leitor de ecrã anuncia o link
- **THEN** o anúncio inclui que o link abre numa nova aba
