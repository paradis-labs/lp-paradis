## ADDED Requirements

### Requirement: O switch não força a renderização no cliente das rotas

O uso de `useSearchParams` pelo `LocaleSwitch` SHALL estar contido num `<Suspense>` que envolve apenas o switch, de modo que o resto do header e da página possa ser pré-renderizado no servidor.

O fallback do `<Suspense>` SHALL ocupar as mesmas dimensões do switch real e apresentar o locale corrente, para que a resolução do boundary não cause deslocamento de layout no header.

#### Scenario: Build de produção com rota estática

- **WHEN** uma rota que contém o header é marcada como estática e o projeto é construído com `npm run build`
- **THEN** o build não falha com `missing-suspense-with-csr-bailout`

#### Scenario: Sem deslocamento de layout

- **WHEN** a página carrega e o boundary do switch resolve
- **THEN** a posição e o tamanho dos restantes elementos do header não mudam

#### Scenario: Query string preservada

- **WHEN** o visitante está em `/en/get-quote?ref=x` e o switch já resolveu
- **THEN** o `href` do switch é `/pt/get-quote?ref=x`
