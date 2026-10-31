## ADDED Requirements

### Requirement: Texto que acende letra a letra com o scroll
O título do about (home), o desafio e a solução (painel escuro do detalhe de produto) SHALL acender letra a letra à medida que o bloco atravessa a viewport. Cada carácter SHALL ir de opacidade 0,22 a 1, e as letras SHALL acender em sequência, da primeira para a última.

O intervalo de scroll SHALL ser o do mockup: o efeito começa quando o topo do bloco está a 85% da altura da viewport e termina quando o fundo do bloco passa os 35%. A letra `i` de `n` acende na fatia `[i/n, (i+1)/n]` desse intervalo.

Sobre branco o texto vai de cinzento a `#151718`; sobre o painel escuro vai de branco a 22% a branco.

#### Scenario: Meio do percurso
- **WHEN** o desafio do Kitenda está a meio do intervalo de scroll
- **THEN** a primeira metade das letras está a opacidade 1 e a segunda metade ainda a 0,22, com uma zona de transição entre elas

#### Scenario: Depois do intervalo
- **WHEN** o fundo do bloco já passou os 35% da viewport
- **THEN** todas as letras estão a opacidade 1

### Requirement: O efeito é CSS e não depende de JavaScript
O efeito SHALL ser uma animação de CSS ligada ao scroll (`animation-timeline: view()`), com o desfasamento de cada letra numa propriedade personalizada (`--i`, `--n`). Nenhum JavaScript SHALL ler geometria ou escrever estilos por causa dele.

A cor final sólida SHALL ser a declaração base, e a animação SHALL existir só dentro de `@supports (animation-timeline: view())` e sem movimento reduzido. Fora disso, o texto SHALL estar a opacidade 1 desde o primeiro frame, como exige `text-visibility-guarantees`.

#### Scenario: Sem JavaScript
- **WHEN** a página é carregada com o JavaScript desligado num browser com suporte
- **THEN** o efeito corre igual, porque não depende do bundle

#### Scenario: Browser sem suporte
- **WHEN** a página é vista no Firefox, sem `animation-timeline`
- **THEN** o texto está a opacidade 1, estático e legível

#### Scenario: Movimento reduzido
- **WHEN** `prefers-reduced-motion: reduce` está ativo
- **THEN** o texto está a opacidade 1, sem animação

### Requirement: A partição em letras não estraga a leitura nem a quebra de linha
O texto SHALL ser partido no servidor em palavras e cada palavra em letras. Cada palavra SHALL ficar num elemento que não quebra a meio (`white-space: nowrap`), e os espaços SHALL continuar a ser pontos de quebra entre palavras. As letras SHALL ser `aria-hidden`, e a frase inteira SHALL existir uma vez para tecnologias de apoio (texto visualmente escondido no mesmo elemento).

#### Scenario: Leitor de ecrã
- **WHEN** um leitor de ecrã chega ao título do about
- **THEN** lê a frase de seguida, uma vez, e não letra a letra

#### Scenario: Quebra de linha
- **WHEN** o desafio é visto a 390px
- **THEN** as linhas quebram entre palavras e nenhuma palavra é partida a meio

### Requirement: O sweep em gradiente sai
As classes `.sweep` e `.sweep-dark` e o requisito "Título com sweep de cor ligado ao scroll" (delta de `v3-home-reskin`) SHALL ser substituídos por este efeito.

#### Scenario: Sem gradiente recortado no about
- **WHEN** o título do about é inspecionado
- **THEN** não tem `background-clip: text` nem um gradiente animado
