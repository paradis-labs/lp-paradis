# lit-text-enter-mode Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-lit-text-all-pages`, sincronizada antes de arquivar._

## Requirements

### Requirement: O LitText tem um modo de entrada
O `LitText` SHALL aceitar o modo `enter`, além do modo `scroll`, que é o que existe hoje e continua a ser o padrão. No modo `enter`, cada letra SHALL ir de 22% para 100% de opacidade uma só vez, ao carregar a página, sem depender da posição de scroll. As letras SHALL acender da primeira para a última, cada uma com um atraso proporcional ao seu índice (`--i` / `--n`).

O momento de início e a duração total SHALL ser configuráveis por instância, para o efeito se encadear com a entrada `data-enter` do bloco. O modo `enter` SHALL ser só CSS (`animation` com `animation-delay` por letra), sem JavaScript, como o `data-enter`.

#### Scenario: Lead do PageHeader ao carregar
- **WHEN** a página `/en/products` carrega numa viewport de 1440×900
- **THEN** o lead aparece com as letras a 22%, acende da primeira para a última letra durante a entrada e, no fim, está todo a 100%, sem que tenha havido scroll

#### Scenario: A posição de scroll não conta
- **WHEN** a página carrega já com scroll restaurado, com o `PageHeader` meio fora da viewport
- **THEN** o modo `enter` corre na mesma até ao fim, e o texto acaba a 100%

#### Scenario: O modo padrão não muda
- **WHEN** um `LitText` é usado sem indicar o modo, como no título do about
- **THEN** acende com o scroll, exactamente como antes deste change

### Requirement: O modo de entrada degrada para o texto aceso
Com `prefers-reduced-motion: reduce`, ou sem CSS de animação, o texto em modo `enter` SHALL estar a 100% desde o primeiro frame. A opacidade 1 SHALL ser a declaração base, e a animação SHALL existir só dentro de `prefers-reduced-motion: no-preference`, como em `scroll-lit-text`.

O modo `enter` não SHALL depender de `animation-timeline`, por isso SHALL animar também no Firefox.

#### Scenario: Movimento reduzido
- **WHEN** `prefers-reduced-motion: reduce` está activo e a página `/en/get-quote` carrega
- **THEN** o lead do `PageHeader` e o título e o subtítulo do formulário estão a 100%, estáticos

#### Scenario: Firefox
- **WHEN** a página `/en/products` carrega no Firefox
- **THEN** o lead acende letra a letra, como no Chrome

### Requirement: O texto em modo de entrada é pintado no primeiro frame
No modo `enter` o texto SHALL começar com opacidade maior que 0, de modo que seja pintado no primeiro frame e continue a contar como candidato a LCP. O efeito SHALL somar-se à entrada `data-enter` do bloco sem a substituir.

#### Scenario: Primeiro frame
- **WHEN** a primeira pintura de `/en/products` acontece
- **THEN** o texto do lead está pintado, a 22%, e o LCP não muda em relação a antes do change

### Requirement: Não serve dentro de texto em gradiente
O `LitText` não SHALL ser usado dentro de `gradient-text`: o `background-clip: text` ignora a opacidade das letras, e o efeito não se vê.

#### Scenario: H1 do PageHeader
- **WHEN** o `PageHeader` é renderizado
- **THEN** o H1 não tem `LitText`, e mantém o gradiente

### Requirement: O texto pode vir em segmentos
O `LitText` SHALL aceitar o texto como uma lista de segmentos, cada um com uma classe opcional. Os segmentos SHALL formar uma só frase: o índice das letras continua de um segmento para o seguinte, as linhas quebram só entre palavras, e a frase completa existe uma vez para tecnologias de apoio, com as letras `aria-hidden`.

#### Scenario: Lead em duas cores
- **WHEN** o lead "We create innovative digital products… Designed to simplify…" é passado em dois segmentos, o segundo com `text-mist`
- **THEN** a primeira frase acaba na cor `primary` e a segunda em `mist`, as letras acendem numa só sequência do início ao fim, e um leitor de ecrã lê o lead inteiro uma vez

### Requirement: O LitText pode herdar a cor
O `LitText` SHALL aceitar `tone="inherit"`. Neste tom o host não define cor e herda-a do elemento pai, e o efeito anima só a opacidade das letras.

#### Scenario: Subtítulo em muted
- **WHEN** o subtítulo do FAQ usa `LitText tone="inherit"` dentro de um `<p>` com `text-muted-foreground`
- **THEN** no fim do efeito o subtítulo está em `muted-foreground`, como antes
