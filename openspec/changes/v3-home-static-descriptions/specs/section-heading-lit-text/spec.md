## MODIFIED Requirements

### Requirement: Os cabeçalhos do painel escuro acendem letra a letra
O título dos cabeçalhos de Services, Products e Testimonials (o `SectionHeading`) SHALL acender letra a letra com o scroll, com o efeito definido por `scroll-lit-text`: cada carácter vai de branco a 22% para branco a 100%, as letras acendem da primeira para a última, e o intervalo de scroll é o do about (começa com o topo do bloco a 85% da viewport e acaba com o fundo a 35%), medido no próprio título.

O subtítulo, a pill e o CTA opcional do cabeçalho SHALL ficar sem o efeito.

#### Scenario: Cabeçalho de Services a meio do percurso
- **WHEN** o título "Services Designed to Power Modern Digital Businesses" está a meio do seu intervalo de scroll
- **THEN** a primeira metade das letras do título está a branco a 100% e a segunda ainda a branco a 22%, e o subtítulo está todo a branco a 64%, estático

#### Scenario: Os três cabeçalhos
- **WHEN** a home é percorrida até ao fim do painel escuro num browser com suporte
- **THEN** os títulos de Services, Products e Testimonials acendem, e nenhum dos três subtítulos anima

#### Scenario: A pill, o subtítulo e o CTA não acendem
- **WHEN** o cabeçalho de Products está no início do intervalo de scroll
- **THEN** a pill "Our Products" e o botão "View All" estão a opacidade total, o subtítulo está a branco a 64%, e só o título está a 22%

### Requirement: A semântica do cabeçalho mantém-se
O título SHALL continuar a ser o `<h2>` da secção, com o texto partido dentro dele; a frase do título SHALL existir uma vez para tecnologias de apoio, e as letras SHALL ser `aria-hidden`, como em `scroll-lit-text`. O título SHALL quebrar linha só entre palavras e manter o equilíbrio de linhas (`text-wrap: balance`).

O subtítulo SHALL ser um `<p>` com o texto directamente dentro, sem partição em letras.

#### Scenario: Leitor de ecrã
- **WHEN** um leitor de ecrã percorre a secção de Testimonials
- **THEN** encontra um cabeçalho de nível 2 com o título lido de seguida, uma vez, e depois o subtítulo, uma vez

#### Scenario: Subtítulo sem partição
- **WHEN** o subtítulo de Services é inspecionado
- **THEN** o `<p>` contém o texto, sem `.lit` nem um `<span>` por letra

#### Scenario: Quebra de linha a 390px
- **WHEN** o cabeçalho de Services é visto a 390px
- **THEN** nenhuma palavra do título é partida a meio

## ADDED Requirements

### Requirement: O subtítulo é estático a branco a 64%
O subtítulo dos três cabeçalhos do painel escuro SHALL ser branco a 64% (`rgba(255,255,255,0.64)`, a cor do mockup v3), a opacidade total e sem animação desde o primeiro frame, em qualquer browser e com qualquer preferência de movimento.

O estado final do título SHALL continuar a ser branco a 100%, e é também o que se vê sem suporte de `animation-timeline` (Firefox), sem CSS de animação e com `prefers-reduced-motion: reduce`.

#### Scenario: Cor do subtítulo
- **WHEN** o subtítulo de Testimonials é inspecionado
- **THEN** a cor calculada é `rgba(255, 255, 255, 0.64)`

#### Scenario: Browser sem suporte
- **WHEN** a home é vista no Firefox
- **THEN** o título dos três cabeçalhos está a branco a 100% e o subtítulo a branco a 64%, ambos estáticos

#### Scenario: Movimento reduzido
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** o título está a branco a 100% e o subtítulo a branco a 64%, sem animação

## REMOVED Requirements

### Requirement: O subtítulo acaba branco
**Reason**: o subtítulo deixa de acender, e a cor pedida é a do mockup v3 (branco a 64%), não branco a 100%.
**Migration**: substituído por "O subtítulo é estático a branco a 64%"; o comportamento do título sem suporte e com movimento reduzido passa para esse requisito.
