# section-heading-lit-text Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-section-heading-lit`, sincronizada antes de arquivar._

## Requirements

### Requirement: Os cabeçalhos do painel escuro acendem letra a letra
O título e o subtítulo dos cabeçalhos de Services, Products e Testimonials (o `SectionHeading`) SHALL acender letra a letra com o scroll, com o efeito definido por `scroll-lit-text`: cada carácter vai de branco a 22% para branco a 100%, as letras acendem da primeira para a última, e o intervalo de scroll é o do about (começa com o topo do bloco a 85% da viewport e acaba com o fundo a 35%).

O título e o subtítulo SHALL ter cada um o seu intervalo, medido no próprio bloco. Como o subtítulo está por baixo do título, acende depois dele.

A pill e o CTA opcional do cabeçalho SHALL ficar como estão, sem o efeito.

#### Scenario: Cabeçalho de Services a meio do percurso
- **WHEN** o título "Services Designed to Power Modern Digital Businesses" está a meio do seu intervalo de scroll
- **THEN** a primeira metade das letras do título está a branco a 100% e a segunda ainda a branco a 22%, e o subtítulo, ainda no início do seu intervalo, está quase todo a 22%

#### Scenario: Os três cabeçalhos
- **WHEN** a home é percorrida até ao fim do painel escuro num browser com suporte
- **THEN** os cabeçalhos de Services, Products e Testimonials acendem, cada um com o seu título e o seu subtítulo

#### Scenario: A pill e o CTA não acendem
- **WHEN** o cabeçalho de Products está no início do intervalo de scroll
- **THEN** a pill "Our Products" e o botão "View All" estão a opacidade total, e só o título e o subtítulo estão a 22%

### Requirement: O subtítulo acaba branco
O estado final do subtítulo SHALL ser branco a 100%, igual ao título, e não o branco a 64% de antes. Esse estado final SHALL ser também o que se vê sem suporte de `animation-timeline` (Firefox), sem CSS de animação e com `prefers-reduced-motion: reduce`.

#### Scenario: Depois do intervalo
- **WHEN** o fundo do subtítulo de Services já passou os 35% da viewport
- **THEN** todas as letras do subtítulo estão a branco a 100%

#### Scenario: Browser sem suporte
- **WHEN** a home é vista no Firefox
- **THEN** o título e o subtítulo dos três cabeçalhos estão a branco a 100%, estáticos

#### Scenario: Movimento reduzido
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** o título e o subtítulo estão a branco a 100%, sem animação

### Requirement: A semântica do cabeçalho mantém-se
O título SHALL continuar a ser o `<h2>` da secção e o subtítulo um `<p>`, com o texto partido dentro deles. Cada frase SHALL existir uma vez para tecnologias de apoio, e as letras SHALL ser `aria-hidden`, como em `scroll-lit-text`. As linhas SHALL quebrar só entre palavras, e o título SHALL manter o equilíbrio de linhas (`text-wrap: balance`).

#### Scenario: Leitor de ecrã
- **WHEN** um leitor de ecrã percorre a secção de Testimonials
- **THEN** encontra um cabeçalho de nível 2 com o título lido de seguida, uma vez, e depois o subtítulo, uma vez

#### Scenario: Quebra de linha a 390px
- **WHEN** o cabeçalho de Services é visto a 390px
- **THEN** nenhuma palavra do título ou do subtítulo é partida a meio

### Requirement: Convive com a revelação do bloco
A revelação de disparo único do `SectionHeading` (o `Reveal` à volta do bloco) SHALL continuar a correr como antes. As duas animações SHALL somar-se sem se anularem: o bloco entra com a revelação, e as letras acendem com o scroll.

Nenhum antepassado dos três cabeçalhos SHALL ter `overflow: hidden`, que prende o `view-timeline` (o mesmo cuidado de `scroll-lit-text`). Para recortar, `overflow: clip`.

#### Scenario: Entrada do bloco
- **WHEN** o cabeçalho de Services entra na viewport pela primeira vez
- **THEN** o bloco revela-se (opacidade e deslocamento) e, quando a revelação acaba, as letras do título estão à opacidade que o scroll determina, e não presas a 22% nem a 100%
