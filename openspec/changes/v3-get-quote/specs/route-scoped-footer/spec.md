## MODIFIED Requirements

### Requirement: A composição do footer é determinada pela rota, em código

O sistema SHALL escolher a composição do footer a partir da rota pedida, e essa escolha SHALL viver em código e não em conteúdo do CMS.

A escolha por rota, e não por uma flag de CMS, é deliberada: uma flag ligaria a variante em todas as rotas ou em nenhuma, que é precisamente o que este requisito precisa de evitar.

No v3 há duas composições: a de base, com a faixa "Ready to build?" no topo, e a de `/get-quote`, sem essa faixa, porque a página é o destino do CTA. Nenhuma das duas tem faixa de contacto direto, que passou para o aside da página.

#### Scenario: O footer de /get-quote não tem faixa CTA

- **WHEN** um visitante carrega `/en/get-quote` ou `/pt/get-quote`
- **THEN** o primeiro bloco dentro do `<footer>` é o logo com a tagline
- **AND** o footer não inclui a faixa "Ready to build?" nem a faixa de contacto direto

#### Scenario: As outras rotas mantêm a faixa CTA

- **WHEN** um visitante carrega qualquer rota pública que não `/get-quote`
- **THEN** o primeiro bloco dentro do `<footer>` é a faixa "Ready to build?"

#### Scenario: O footer de /get-quote não lê o Contact

- **WHEN** a folha `@footer/get-quote` é inspecionada
- **THEN** não chama `getContact`, que passou para a página
