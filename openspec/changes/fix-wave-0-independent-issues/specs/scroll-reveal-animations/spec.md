## ADDED Requirements

### Requirement: A página `/get-quote` revela por blocos sem esconder campos

A página `/[locale]/get-quote` SHALL usar `Reveal` em dois níveis: o cabeçalho (pill de disponibilidade, título, subtítulo), com atraso escalonado, e o formulário inteiro como um único bloco. Campos individuais do formulário SHALL NOT ser envolvidos em `Reveal`.

As mensagens de erro de validação SHALL estar dentro do bloco do formulário e SHALL ser visíveis sempre que o formulário está na viewport.

O primeiro bloco do cabeçalho SHALL começar sem atraso, para não se ler como uma segunda animação sobre a transição de entrada do `template.tsx`.

#### Scenario: Navegação por teclado

- **WHEN** o visitante percorre o formulário com Tab até um campo que estava abaixo da dobra
- **THEN** o campo com foco está com opacidade total quando recebe o foco

#### Scenario: Erro de validação

- **WHEN** a submissão devolve erros
- **THEN** as mensagens de erro estão visíveis sem que o visitante tenha de rolar a página

#### Scenario: Movimento reduzido

- **WHEN** `/get-quote` é carregada com `prefers-reduced-motion: reduce`
- **THEN** os blocos aparecem sem deslocamento e todo o conteúdo é legível
