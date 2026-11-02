# external-link-arrow Specification

## Purpose

TBD — a completar ao arquivar.

_Introduzida por `fix-external-arrow-glyph`, sincronizada antes de arquivar._

## Requirements

### Requirement: A seta de link externo é um ícone vetorial

A seta de link externo (`↗`) SHALL ser desenhada como um ícone vetorial inline (SVG) com `currentColor`, e SHALL NOT ser um caractere de texto. Aplica-se a todos os sítios que a mostram: os links externos do footer, o URL do produto em `ProductDetail` e o e-mail do aside da página de orçamento.

O ícone SHALL ter o tamanho do `font-size` do contexto (`1em`), para que as classes de tamanho que hoje acompanham a seta continuem a ter efeito.

#### Scenario: Seta no iPhone

- **WHEN** um visitante abre uma página com links externos no footer num iPhone (Safari iOS)
- **THEN** a seta aparece como uma linha da cor do texto do link, igual à do desktop
- **AND** não aparece como emoji

#### Scenario: Nenhum glifo de seta no HTML

- **WHEN** o HTML renderizado do footer, de `/[locale]/products/<slug>` e de `/[locale]/get-quote` é inspecionado
- **THEN** não contém o caractere U+2197 dentro de um elemento `.roll-arrow`
- **AND** cada `.roll-arrow` de link externo contém um `<svg>`

#### Scenario: A seta acompanha a cor e o tamanho do contexto

- **WHEN** a seta aparece no e-mail do aside (texto branco, `text-lg`) e num link do footer (texto branco, 15px)
- **THEN** em cada sítio tem a cor do texto e a altura do `font-size` do seu contexto

### Requirement: A seta vetorial mantém o hover e a semântica decorativa

A troca para ícone vetorial SHALL manter o comportamento atual da seta. O deslocamento diagonal no hover e no foco (`.roll-arrow`) continua igual, e é anulado com movimento reduzido. A seta SHALL continuar fora da árvore de acessibilidade, e o nome acessível do link SHALL continuar a ser o rótulo authorado.

#### Scenario: Hover desloca a seta

- **WHEN** o cursor passa sobre um link externo do footer
- **THEN** a seta desloca-se na diagonal para cima e para a direita, como hoje

#### Scenario: Nome acessível sem a seta

- **WHEN** um leitor de ecrã anuncia o link externo `Kitenda` do footer
- **THEN** o nome anunciado é `Kitenda`
- **AND** o `<svg>` e o seu contentor estão marcados com `aria-hidden="true"`
