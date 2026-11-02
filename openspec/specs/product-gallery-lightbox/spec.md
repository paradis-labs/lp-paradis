# product-gallery-lightbox Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-product-gallery-lightbox`, sincronizada antes de arquivar._

## Requirements

### Requirement: Uma imagem da galeria abre o lightbox

Cada imagem da galeria do detalhe do produto SHALL ser um controlo (`<button>`) com um nome acessível (o `alt` da imagem, ou "Imagem n de total" / "Image n of total" quando não há `alt`). Activá-lo SHALL abrir um diálogo modal com essa imagem inteira (`object-contain`) sobre um fundo escuro.

#### Scenario: Clique numa imagem

- **WHEN** o visitante clica na segunda imagem da galeria
- **THEN** abre o lightbox com essa imagem inteira
- **AND** o contador mostra "2 / <total>"

#### Scenario: Activação por teclado

- **WHEN** o visitante foca uma imagem da galeria com Tab e carrega Enter ou Espaço
- **THEN** o lightbox abre com essa imagem

#### Scenario: Cursor sobre a galeria

- **WHEN** o cursor passa sobre uma imagem da galeria
- **THEN** mostra o disco grande com "View", como hoje, e a imagem continua a crescer no hover

### Requirement: Navegação entre imagens

Com mais de uma imagem, o lightbox SHALL ter os controlos "anterior" e "seguinte", e as setas ← e → do teclado SHALL navegar. A navegação SHALL dar a volta (da última para a primeira, e o inverso). Com uma só imagem, os controlos de navegação e o contador SHALL ser omitidos.

#### Scenario: Seta para a direita na última imagem

- **WHEN** o lightbox mostra a última imagem e o visitante carrega →
- **THEN** mostra a primeira imagem e o contador "1 / <total>"

#### Scenario: Galeria de uma imagem

- **WHEN** o produto tem uma só imagem na galeria e o lightbox abre
- **THEN** não há botões anterior/seguinte nem contador

### Requirement: Fechar devolve o foco

O lightbox SHALL fechar com `Esc`, com o botão fechar e com um clique no fundo fora da imagem. Ao fechar, o foco SHALL voltar à imagem da galeria que corresponde à imagem que estava visível.

#### Scenario: Esc depois de navegar

- **WHEN** o visitante abre a imagem 1, avança para a 3 e carrega Esc
- **THEN** o lightbox fecha e o foco fica na imagem 3 da galeria

#### Scenario: Clique no fundo

- **WHEN** o visitante clica na área escura fora da imagem
- **THEN** o lightbox fecha

### Requirement: Foco e semântica de diálogo

Enquanto está aberto, o lightbox SHALL ser um `dialog` modal com um nome acessível (o título do produto), SHALL prender o foco dentro dele, e SHALL esconder o resto da página às tecnologias assistivas.

#### Scenario: Tab dentro do lightbox

- **WHEN** o lightbox está aberto e o visitante carrega Tab repetidamente
- **THEN** o foco percorre só os controlos do lightbox

### Requirement: A página não rola por trás

Enquanto o lightbox está aberto, a página por trás SHALL ficar parada, tanto ao rolar a roda ou o touchpad como ao tocar. O scroll suave (Lenis) SHALL ser parado ao abrir e retomado ao fechar.

#### Scenario: Rodar a roda com o lightbox aberto

- **WHEN** o lightbox está aberto e o visitante roda a roda do rato
- **THEN** a posição de scroll da página não muda
- **AND** depois de fechar, o scroll suave volta a funcionar

### Requirement: Movimento reduzido

A abertura, o fecho e a troca de imagem SHALL animar com uma transição curta (fade com escala), e SHALL ser imediatos com `prefers-reduced-motion: reduce`.

#### Scenario: Movimento reduzido

- **WHEN** o visitante tem `prefers-reduced-motion: reduce` e abre o lightbox
- **THEN** o lightbox aparece sem transição

### Requirement: Custo só na rota do detalhe

O código de cliente do lightbox SHALL carregar só nas páginas de detalhe de produto, e a grelha da galeria SHALL continuar a ser renderizada no servidor.

#### Scenario: Home e listagem

- **WHEN** se abre a home ou `/products`
- **THEN** nenhum chunk do lightbox é pedido
