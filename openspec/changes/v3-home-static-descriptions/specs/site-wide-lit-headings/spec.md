## MODIFIED Requirements

### Requirement: Os títulos abaixo da dobra acendem com o scroll
Os seguintes títulos SHALL acender em modo `scroll`, com o intervalo de `scroll-lit-text`, cada um com o seu intervalo:

- Detalhe de produto: o título "Next product".
- Home: o título do FAQ.

Os títulos SHALL acabar na cor `foreground`, como o título do about.

#### Scenario: FAQ na home
- **WHEN** a home é percorrida até ao FAQ num browser com suporte
- **THEN** o título do FAQ acende e acaba em `foreground`, e o subtítulo está em `muted-foreground` desde o início, sem animar

#### Scenario: Subtítulo do about
- **WHEN** o about passa pela viewport
- **THEN** o título acende como antes, e o subtítulo está em `muted-foreground` desde o início, sem animar

### Requirement: O que fica de fora
O efeito não SHALL ser aplicado a: o H1 do Hero da home, as descrições da home (o lead do Hero, o subtítulo do about, os subtítulos do `SectionHeading` e o subtítulo do FAQ), os títulos de cartões (`ProductCard`, `NextProductCard`, os passos do detalhe de produto, `Card`), as pills e os eyebrows, os rótulos do aside do Get Quote, a mensagem de sucesso do formulário e o título do CTA do footer.

As descrições da home SHALL ficar na cor do mockup v3: `muted-foreground` (`#31373d`) no about e no FAQ.

#### Scenario: Listagem de produtos
- **WHEN** `/en/products` é percorrida
- **THEN** os títulos dos cartões de produto estão a 100% desde o início, sem efeito

#### Scenario: Aside do Get Quote
- **WHEN** o aside de contacto de `/en/get-quote` está na viewport
- **THEN** os rótulos "Reach Us Directly" e "Elsewhere" estão a 100%, sem efeito

#### Scenario: Descrições da home
- **WHEN** a home é percorrida de cima a baixo num browser com suporte
- **THEN** nenhum subtítulo nem o lead do Hero anima letra a letra, e os subtítulos do about e do FAQ estão em `#31373d`
