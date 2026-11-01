## ADDED Requirements

### Requirement: Link corrente do navbar

O navbar (desktop e menu mobile) SHALL marcar um único link como corrente, com estas regras por ordem:

1. Um link de secção (com hash, ex.: `/#services`) é corrente quando essa secção é a mais visível na viewport.
2. Com uma secção ativa, nenhum link de página é corrente.
3. Um link de página é corrente quando o pathname é igual ao seu `href`, ou desce dele por segmento inteiro (`/en/products/kitenda` desce de `/en/products`, `/en/products-old` não).
4. A raiz do locale (`/en`, `/pt`) só é corrente por igualdade. Se descesse por segmento, "Home" ficava corrente em todas as páginas.

#### Scenario: Página de detalhe

- **WHEN** o visitante está em `/en/products/kitenda`
- **THEN** "Products" está marcado como corrente e "Home" não

#### Scenario: Prefixo sem fronteira de segmento

- **WHEN** existe uma rota `/en/products-archive` e o visitante está nela
- **THEN** "Products" (`/en/products`) não está marcado

#### Scenario: Raiz do locale

- **WHEN** o visitante está em `/pt/get-quote`
- **THEN** "Home" (`/pt`) não está marcado

#### Scenario: Home com secção ativa

- **WHEN** o visitante está na home com a secção de serviços a meio do ecrã
- **THEN** "Services" é o link corrente e "Home" não
