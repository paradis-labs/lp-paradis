# clickable-covers Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-cursor-clickable-covers`, sincronizada antes de arquivar._

## Requirements

### Requirement: A capa do cartão da home leva ao destino do cartão

A capa do `Card` da secção de produtos da home SHALL ser clicável e levar ao mesmo destino do link "Discover More" desse cartão: o detalhe do produto quando o projecto tem slug, e o site do projecto num separador novo (`noopener noreferrer`) quando não tem.

#### Scenario: Projecto com slug

- **WHEN** o visitante clica na capa de um cartão cujo projecto tem slug
- **THEN** navega para `/<locale>/products/<slug>` no mesmo separador

#### Scenario: Projecto sem slug

- **WHEN** o visitante clica na capa de um cartão cujo projecto não tem slug
- **THEN** o site do projecto abre num separador novo

#### Scenario: Cartão sem imagem

- **WHEN** o cartão não tem capa e mostra o nome no lugar dela
- **THEN** essa área também é clicável, com o mesmo destino

### Requirement: A capa do detalhe leva ao site do produto

A capa sob o cabeçalho da página de detalhe do produto SHALL ser clicável e abrir `product.url` num separador novo (`noopener noreferrer`), o mesmo destino do botão "Visit".

#### Scenario: Clique na capa do detalhe

- **WHEN** o visitante clica na capa da página de detalhe
- **THEN** o site do produto abre num separador novo

### Requirement: As capas ligadas não duplicam o link para teclado e leitores de ecrã

Uma capa ligada SHALL ficar fora da ordem de tabulação (`tabIndex={-1}`) e fora da árvore de acessibilidade (`aria-hidden`). O link acessível a teclado e a leitores de ecrã SHALL continuar a ser o "Discover More" no cartão e o "Visit" no detalhe.

#### Scenario: Navegação por teclado no cartão

- **WHEN** o visitante percorre a secção de produtos com Tab
- **THEN** cada cartão recebe o foco uma vez só, no "Discover More"

#### Scenario: Leitor de ecrã

- **WHEN** um leitor de ecrã lista os links da página
- **THEN** cada destino de produto aparece uma vez só por cartão

### Requirement: O cursor sobre a capa ligada continua a mostrar o rótulo

Ligar a capa SHALL manter o cursor em modo `text`, com o rótulo de hoje ("Explore"), o zoom da imagem no hover e a revelação no scroll.

#### Scenario: Hover na capa ligada

- **WHEN** o cursor entra na capa ligada de um cartão da home
- **THEN** o cursor mostra o disco grande com "Explore"
- **AND** a imagem cresce para 1,065, como hoje
