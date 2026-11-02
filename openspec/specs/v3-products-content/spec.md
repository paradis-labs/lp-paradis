# v3-products-content Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `v3-products-content`, sincronizada antes de arquivar._

## Requirements

### Requirement: Lead do detalhe do produto

O cabeçalho de `/[locale]/products/<slug>` SHALL mostrar o `lead` do projecto (`projects_translations.lead`, com o fallback de campo para `en-US`). Sem `lead`, SHALL mostrar o `summary`, como hoje. O corte bicolor do lead (primeira frase no tom do texto, o resto em `mist`) mantém-se. O cartão da listagem, o da home e o "Next product" SHALL continuar a usar o `summary`.

#### Scenario: Lead e summary diferentes

- **WHEN** a Ficha Segura tem `summary` "The smart deposit simulator built for the Angolan market" e `lead` "Find your best return. Compare and simulate term deposits from the main banks in Angola, all in one place."
- **THEN** o cabeçalho de `/en/products/ficha-segura` mostra o lead, com "Find your best return." no primeiro tom, e o cartão em `/en/products` mostra o summary

#### Scenario: Sem lead

- **WHEN** um projecto não tem `lead` em nenhum idioma
- **THEN** o cabeçalho mostra o `summary`

#### Scenario: hcms sem o campo

- **WHEN** o schema do hcms ainda não tem `lead`
- **THEN** a página renderiza com o `summary`, sem erro de leitura

### Requirement: Produtos em destaque na home

A secção de produtos da home SHALL respeitar a opção `featured_only` do bloco `block_collection #products`. Ligada, mostra só os projectos com `is_featured`, pela ordem do `sort`. Desligada ou vazia, mostra todos os publicados. A listagem `/products` e o "Next product" do detalhe SHALL mostrar sempre todos os publicados.

#### Scenario: Três em destaque

- **WHEN** o bloco tem `featured_only` e só o Kitenda, a Génesis Sport Club e a Talama & Soba têm `is_featured`
- **THEN** a home mostra esses três, por esta ordem, e `/products` mostra os quatro

#### Scenario: Opção desligada

- **WHEN** o bloco não tem `featured_only`
- **THEN** a home mostra todos os projectos publicados
