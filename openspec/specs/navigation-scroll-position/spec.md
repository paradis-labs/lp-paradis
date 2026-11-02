# navigation-scroll-position Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `fix-scroll-to-top-on-navigation`, sincronizada antes de arquivar._

## Requirements

### Requirement: Uma navegação para outra página abre no topo
Uma navegação de cliente (push) para um pathname diferente, sem fragmento (`#…`) na URL de destino, SHALL deixar a página nova com o scroll em `0`. Isso SHALL valer seja qual for a posição de scroll anterior, se havia um scroll suave em curso no momento do clique, qual é o elemento clicado (header, menu mobile, corpo da página, footer) e se a rota passa pelo `loading.tsx`.

#### Scenario: Clique depois de o scroll assentar
- **WHEN** o utilizador está a meio da home, parado há mais de um segundo, e clica num link para `/products/<slug>`
- **THEN** a página do produto aparece com `window.scrollY === 0`

#### Scenario: Clique durante um scroll suave
- **WHEN** o utilizador faz scroll com a roda e clica num link de página antes de o Lenis terminar a interpolação
- **THEN** a página nova aparece com `window.scrollY === 0` e não volta a descer nos frames seguintes

#### Scenario: Clique num link do footer
- **WHEN** o utilizador está no fundo de uma página, com o footer visível, e clica num link de página do footer
- **THEN** a página nova aparece com `window.scrollY === 0`

#### Scenario: Clique no menu mobile
- **WHEN** o utilizador abre o menu mobile a meio de uma página e escolhe um link de página
- **THEN** o menu fecha, o scroll volta a funcionar e a página nova aparece com `window.scrollY === 0`

#### Scenario: Com reduced motion
- **WHEN** `prefers-reduced-motion: reduce` está ativo (sem Lenis) e o utilizador navega a meio de uma página para outra página
- **THEN** a página nova aparece com `window.scrollY === 0`, sem animação

### Requirement: Uma navegação com âncora abre no alvo
Uma navegação cuja URL de destino tem fragmento SHALL NOT ser levada para o topo por este comportamento. O alvo da âncora SHALL ficar visível, abaixo da navbar (o `scroll-margin-top` existente).

#### Scenario: Âncora noutra página
- **WHEN** o utilizador está em `/en/products/<slug>` e clica num link para `/en#services`
- **THEN** a home abre com a secção `#services` no topo do viewport, e não no topo da página

#### Scenario: Âncora na mesma página
- **WHEN** o utilizador está na home e clica em `#faqs`
- **THEN** a página faz scroll suave até `#faqs`, como hoje

### Requirement: Voltar e avançar restauram a posição
Uma navegação disparada pelo histórico do browser (botões voltar/avançar, `popstate`) SHALL NOT ser levada para o topo por este comportamento.

#### Scenario: Voltar para a home
- **WHEN** o utilizador estava a meio da home, navegou para um produto e carrega em voltar
- **THEN** a home não é forçada para `scrollY === 0` por este comportamento

### Requirement: Sem custo contínuo de frame
O comportamento SHALL correr só quando o pathname muda. Não SHALL acrescentar listeners de `scroll` nem loops de `requestAnimationFrame`, nem ler geometria de layout. O condutor do Lenis SHALL continuar a adormecer quando não há scroll.

#### Scenario: Página ociosa
- **WHEN** a página está parada, sem navegação nem input
- **THEN** um trace de performance não mostra trabalho novo atribuído a este comportamento
