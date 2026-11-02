## MODIFIED Requirements

### Requirement: O elemento observado não pode ser recortado por um ancestral

Nenhuma primitiva de revelação SHALL observar, para decidir a entrada em viewport, um elemento que esteja recortado por um ancestral que esconde o transbordo. O elemento observado SHALL ser o próprio recorte, ou um ancestral dele.

O `IntersectionObserver` calcula a interseção recortando pelo `overflow` dos ancestrais. Observar um elemento deslocado para fora da sua máscara produz um deadlock: ele nunca é relatado como intersectando, logo nunca é revelado, logo nunca sai de fora da máscara. Com revelação de disparo único, o estado é permanente e independe do viewport.

No v3, os cartões das grelhas (serviços, produtos) revelam com stagger dentro de um contentor. O elemento observado é o contentor da grelha (`data-rv`), e os cartões herdam a classe revelada dele.

#### Scenario: Cartão dentro de grelha recortada é revelado

- **WHEN** a grelha de serviços está inteiramente dentro da viewport, dentro do painel escuro recortado por `clip-path`
- **THEN** todos os cartões da grelha são revelados e assumem deslocamento nulo

#### Scenario: Observador não é o elemento deslocado

- **WHEN** a implementação da revelação é inspecionada
- **THEN** o elemento que o observer observa não é nenhum dos elementos que carregam o deslocamento inicial, ou é o próprio elemento sem nenhum ancestral recortante entre ele e a viewport

### Requirement: Revelação de disparo único não pode usar margem negativa

Toda primitiva de revelação SHALL usar um gatilho de interseção sem margem negativa e com limiar zero, de modo que qualquer parte do elemento visível na viewport revele o elemento.

Uma margem negativa encolhe a raiz do observer e cria faixas em que um elemento pode estar visível na tela sem nunca ser relatado como intersectando. Com disparo único, que agora é o único modo, essa zona morta é permanente. O mockup do v3 usa `rootMargin: -8%` e `threshold: 0.12`. A implementação **não** os replica.

#### Scenario: Bloco no fim do documento é revelado

- **WHEN** o último bloco revelável (o cartão "Still have questions?") fica inteiramente dentro dos 80px inferiores da viewport e a página não pode rolar mais para baixo
- **THEN** o bloco é revelado

#### Scenario: Bloco no topo da viewport é revelado

- **WHEN** um bloco revelável fica inteiramente dentro dos 80px superiores da viewport e a página não pode rolar mais para cima
- **THEN** o bloco é revelado

#### Scenario: Configuração do observer

- **WHEN** a primitiva de revelação é inspecionada
- **THEN** não declara margem negativa e usa limiar zero

### Requirement: Elementos animados são identificáveis por marcação

Todo elemento cujo estado inicial de animação seja invisível SHALL carregar um atributo de dados que permita a uma regra de CSS alcançá-lo e forçar a sua visibilidade.

Isto cobre os blocos e cartões revelados ao scroll e os elementos do hero que entram em sequência no mount.

O estado oculto da revelação ao scroll SHALL ser aplicado apenas depois de o JavaScript confirmar que o observer está ativo, como no mockup (`fx`). Sem JavaScript, nenhum bloco revelável começa oculto.

#### Scenario: Elementos revelados são marcados

- **WHEN** a home é renderizada e o DOM é inspecionado
- **THEN** todo o elemento com estado inicial de opacidade zero ou com deslocamento carrega o atributo de marcação

#### Scenario: Entrada do hero é marcada

- **WHEN** o hero é inspecionado
- **THEN** a descrição, o grupo de CTAs e o marquee, que entram em sequência, estão marcados

#### Scenario: Sem JavaScript nada começa oculto

- **WHEN** a home é carregada com o JavaScript desligado
- **THEN** nenhum bloco revelável ao scroll tem opacidade inferior a 1

### Requirement: Preferência por movimento reduzido é respeitada sem custo de visibilidade

Quando `prefers-reduced-motion` estiver ativo, as primitivas SHALL não animar entrada nem o texto ligado ao scroll, e todo o conteúdo SHALL estar no estado final desde o primeiro frame, sujeito às mesmas garantias de visibilidade dos demais caminhos.

#### Scenario: Movimento reduzido com JavaScript ativo

- **WHEN** a home é carregada com `prefers-reduced-motion: reduce` e o React hidrata normalmente
- **THEN** os blocos aparecem sem deslocamento nem fade, e todo o conteúdo textual é legível

#### Scenario: Movimento reduzido sem JavaScript

- **WHEN** a home é carregada com `prefers-reduced-motion: reduce` e o JavaScript não executa
- **THEN** todo o conteúdo textual é legível

#### Scenario: Título do about sob movimento reduzido

- **WHEN** a home é carregada com `prefers-reduced-motion: reduce`
- **THEN** o título do about está a opacidade 1, sem animação

#### Scenario: Sinal de vivacidade do React sob movimento reduzido

- **WHEN** a home é carregada com `prefers-reduced-motion: reduce` e o React hidrata normalmente
- **THEN** o sinal de que o React está vivo é emitido, e o mecanismo de segurança de visibilidade não é acionado

## REMOVED Requirements

### Requirement: Blocos reanimam a cada entrada na viewport

**Reason**: O v3 revela cada bloco uma só vez, e a Motion spec do canvas marca o replay como trabalho repetido que distrai ("Reveal com once", P2).

**Migration**: Substituído por "Blocos revelam uma única vez", abaixo. Não há API pública afetada: a primitiva só é usada dentro da home.

### Requirement: Animação no caminho feliz permanece inalterada

**Reason**: O v3 muda de propósito as durações, as curvas e as distâncias. Fixar "os parâmetros anteriores" impediria esta change.

**Migration**: Substituído por "Os parâmetros de animação são os do v3", abaixo.

## ADDED Requirements

### Requirement: Blocos revelam uma única vez

Um bloco revelável SHALL passar ao estado revelado na primeira vez que intersecta a viewport e SHALL permanecer revelado até ao fim da vida da página. Depois de revelado, o observer SHALL deixar de observar esse elemento.

#### Scenario: Bloco não reverte ao sair da viewport

- **WHEN** um bloco revelado sai completamente da viewport por rolagem
- **THEN** o bloco continua com opacidade total e deslocamento nulo

#### Scenario: Bloco não reanima ao retornar

- **WHEN** o utilizador rola de volta até um bloco já visto
- **THEN** nenhuma animação de entrada é executada

#### Scenario: Elemento dentro da viewport está sempre visível

- **WHEN** a rolagem para em qualquer posição da página, com o React vivo
- **THEN** todo o elemento animado inteiramente dentro da viewport está com opacidade total

### Requirement: Os parâmetros de animação são os do v3

As animações de entrada SHALL usar os valores do artboard "v3 · EN":

- revelação ao scroll: opacidade 0→1 e `translateY(36px)`→0 em 1 s, `cubic-bezier(0.165, 0.84, 0.44, 1)`; o vídeo dos serviços entra por `scale(.75)`→1 com a mesma curva;
- stagger: 0,07 s por cartão de serviço e 0,12 s por cartão de produto;
- entrada do hero: `translateY(100px)`→0 em 1 s, mesma curva, com atrasos de 0,4 s, 0,5 s, 0,6 s e 0,7 s para H1, descrição, CTAs e marquee.

#### Scenario: Parâmetros de revelação

- **WHEN** a regra de CSS da revelação é inspecionada
- **THEN** a duração, a curva e a distância são as listadas acima

#### Scenario: Stagger das grelhas

- **WHEN** a grelha de serviços é revelada
- **THEN** o n-ésimo cartão tem atraso de transição de `0,07 × n` segundos

### Requirement: O H1 do hero é pintado no primeiro frame

O H1 do hero é o elemento de LCP. Ele SHALL ter opacidade total desde o primeiro frame e SHALL entrar só por deslocamento. Os restantes elementos do hero podem entrar com fade.

O mockup anima o H1 a partir de `opacity: 0`. A implementação desvia-se de propósito, pelo ponto P1 da Motion spec ("Não esconder o H1 do hero").

#### Scenario: LCP não espera pela animação

- **WHEN** a home é carregada com JavaScript ativo e sem movimento reduzido
- **THEN** o H1 tem opacidade 1 em todos os frames da animação de entrada

#### Scenario: A entrada não depende de JavaScript

- **WHEN** a home é carregada com o JavaScript desligado
- **THEN** a entrada do hero corre igual, porque é uma animação de CSS, e no fim todos os elementos estão legíveis

### Requirement: Título do about ligado ao scroll

O título da secção about SHALL acender letra a letra com o scroll, como define `scroll-lit-text` (change `v3-scroll-lit-text`), que substitui o sweep em gradiente da versão anterior do canvas.

#### Scenario: Navegador sem suporte

- **WHEN** a home é vista num navegador sem `animation-timeline`
- **THEN** o título está a opacidade 1, na cor sólida `#151718`, e é legível
