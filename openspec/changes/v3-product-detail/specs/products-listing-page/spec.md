## MODIFIED Requirements

### Requirement: Cartões de produto da listagem

A página SHALL mostrar os `projects` do site pela ordem authorada, numa grelha de duas colunas (uma abaixo de 900px), com os valores visuais do artboard. Cada cartão SHALL ser uma única âncora para a página de detalhe do produto (`/[locale]/products/<slug>`), na mesma aba, e SHALL conter:

- a categoria, quando existe, e o número de ordem com dois dígitos (`01`, `02`, …);
- o título como `<h2>`;
- a capa (`coverImage`, por `next/image` com `sizes`), com zoom de 1,065 no hover em 0,5 s e `data-cursor-text="Explore"`; sem capa, uma área neutra com o título;
- a descrição;
- as tags, quando existem, como pills.

O contorno do cartão SHALL passar a `#d4d7da` no hover. Com movimento reduzido, sem zoom nem transição. Os cartões SHALL revelar uma vez ao scroll, com stagger de 0,12 s.

O site externo do produto deixa de ser o destino do cartão e passa a ser o botão "Visit" da página de detalhe.

#### Scenario: Dois projetos

- **WHEN** o hcms devolve Kitenda e Ficha Segura, por esta ordem
- **THEN** a página mostra dois cartões numerados 01 e 02, com a categoria e as tags de cada um, que levam a `/en/products/kitenda` e `/en/products/ficha-segura`

#### Scenario: Nome acessível do cartão

- **WHEN** um leitor de ecrã encontra um cartão
- **THEN** o link é anunciado pelo título do produto

#### Scenario: Projeto inválido

- **WHEN** um projeto do hcms não tem `url`
- **THEN** o provider descarta-o (`[content] item inválido descartado`) e a numeração dos restantes é contínua
