# site-wide-lit-headings Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-lit-text-all-pages`, sincronizada antes de arquivar._

## Requirements

### Requirement: O cabeçalho das páginas interiores acende ao carregar
O `PageHeader` (usado em Products, Get Quote e no detalhe de produto) SHALL acender o lead em modo `enter`, depois de a sua entrada `data-enter` começar. O lead SHALL manter as duas cores: a primeira frase em `primary` e o resto em `mist`.

O H1 SHALL ficar como está, com o gradiente e a entrada `data-enter="solid"`, sem o efeito: o `background-clip: text` do `gradient-text` ignora a opacidade das letras.

No Get Quote, o título e o subtítulo do cartão do formulário SHALL acender também em modo `enter`, depois do lead, porque no desktop já estão na dobra ao carregar. A pill ou o breadcrumb e as acções à direita (o "Visit" do detalhe) SHALL ficar sem o efeito.

#### Scenario: Products ao carregar
- **WHEN** `/en/products` carrega
- **THEN** o H1 sobe com o gradiente, o lead acende letra a letra e acaba com as duas cores

#### Scenario: Detalhe de produto
- **WHEN** `/en/products/<slug>` carrega
- **THEN** o breadcrumb, o H1 e o botão "Visit" estão a 100% desde o início, e só o lead acende

#### Scenario: Formulário do Get Quote ao carregar
- **WHEN** `/en/get-quote` carrega a 1440×900
- **THEN** depois do lead, o título do formulário acende letra a letra e acaba em `foreground`, e o subtítulo acende a seguir e acaba em `#5b656a`, sem o título ter aberto meio aceso

### Requirement: Os títulos abaixo da dobra acendem com o scroll
Os seguintes títulos e subtítulos SHALL acender em modo `scroll`, com o intervalo de `scroll-lit-text`, cada bloco com o seu intervalo:

- Detalhe de produto: o título "Next product".
- Home: o subtítulo do about, e o título e o subtítulo do FAQ.

Os títulos SHALL acabar na cor `foreground`, como o título do about. Os subtítulos SHALL acabar na cor que têm hoje (`muted-foreground`).

#### Scenario: FAQ na home
- **WHEN** a home é percorrida até ao FAQ num browser com suporte
- **THEN** o título e o subtítulo do FAQ acendem, cada um no seu intervalo, e o subtítulo acaba em `muted-foreground`

#### Scenario: Subtítulo do about
- **WHEN** o about passa pela viewport
- **THEN** o título acende como antes, e o subtítulo acende a seguir e acaba em `muted-foreground`

### Requirement: O que fica de fora
O efeito não SHALL ser aplicado a: o H1 do Hero da home, os títulos de cartões (`ProductCard`, `NextProductCard`, os passos do detalhe de produto, `Card`), as pills e os eyebrows, os rótulos do aside do Get Quote, a mensagem de sucesso do formulário e o título do CTA do footer. O `SectionHeading` SHALL continuar como está.

#### Scenario: Listagem de produtos
- **WHEN** `/en/products` é percorrida
- **THEN** os títulos dos cartões de produto estão a 100% desde o início, sem efeito

#### Scenario: Aside do Get Quote
- **WHEN** o aside de contacto de `/en/get-quote` está na viewport
- **THEN** os rótulos "Reach Us Directly" e "Elsewhere" estão a 100%, sem efeito

### Requirement: A semântica e a quebra de linha mantêm-se
Cada título SHALL continuar a ser o elemento de cabeçalho que é hoje (`<h1>` ou `<h2>`) e cada subtítulo um `<p>`, com o `LitText` dentro. Cada frase SHALL existir uma vez para tecnologias de apoio. As linhas SHALL quebrar só entre palavras, e os títulos com `text-balance` ou `text-pretty` SHALL manter essa regra.

Nenhum antepassado de um alvo em modo `scroll` SHALL ter `overflow: hidden`. Para recortar, `overflow: clip`.

#### Scenario: Árvore de acessibilidade do Get Quote
- **WHEN** um leitor de ecrã percorre `/en/get-quote`
- **THEN** encontra o `heading` de nível 1 com o título uma vez, o lead uma vez, e o `heading` de nível 2 do formulário com o título uma vez

#### Scenario: H1 a 390px
- **WHEN** o `PageHeader` de `/en/products` é visto a 390px
- **THEN** nenhuma palavra do H1 ou do lead é partida a meio, e o H1 mantém o `text-balance`
