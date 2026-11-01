## Context

O scroll do site é conduzido pelo Lenis (`SmoothScroll`, `root`, `lerp: 0.1`, `autoRaf: false`), e o `LenisFrameDriver` só corre o `raf` enquanto há scroll (`scroll-frame-budget`). O `<html>` tem `data-scroll-behavior="smooth"`, por isso o Next desliga o `scroll-behavior: smooth` do CSS durante a transição de rota.

Numa navegação, o Next 16 não leva a página ao topo incondicionalmente. Em `layout-router.js` (`handlePotentialScroll`), o primeiro segmento que monta com `scrollRef` pendente:

```
1.º nó DOM do segmento (saltando fixed/sticky/tamanho zero)
  ├─ topo já visível no viewport → não faz nada, scrollRef = false (consumido)
  └─ senão → html.scrollTop = 0 (e scrollIntoView se ainda não ficar visível)
```

Há três caminhos para a página nova ficar a meio:

```
A. Lenis em "smooth"    Next: scrollTop = 0 → onNativeScroll ignora (isScrolling === "smooth")
                        → próximo raf interpola até ao targetScroll antigo → volta a descer
B. @footer consome      o slot paralelo muda em cada rota; se o footer estiver visível e o
                        handler dele correr primeiro, o scroll fica "feito" sem acontecer
C. 1.º nó visível       loading.tsx / motion.div do template com o topo dentro do viewport
```

A é o mais provável para o sintoma relatado. B e C dependem da ordem dos commits e da página. Ainda nenhum foi reproduzido no browser (tarefa 1).

## Goals / Non-Goals

**Goals:**
- Uma navegação push para outro pathname, sem hash, abre sempre em `scrollY === 0`, com ou sem Lenis, e cancela qualquer interpolação em curso.
- Âncoras e voltar/avançar ficam como estão.
- Nenhum custo contínuo: trabalho só quando o pathname muda.

**Non-Goals:**
- Reescrever a restauração de scroll do voltar/avançar. Se o Lenis também a perturbar, fica para outra change.
- Mudar o comportamento de mudanças só de query string (`?x=`). Não há nenhuma hoje.
- Mexer no `template.tsx`, no `loading.tsx` ou no `data-scroll-behavior`.

## Decisions

### 1. O site assume o scroll para o topo, em vez de corrigir a heurística do Next

Um componente cliente sem DOM (`ScrollToTopOnNavigate`, que devolve `null`) observa `usePathname()`. Quando o pathname muda e a navegação não é de histórico nem tem hash, leva a página ao topo. Assim A, B e C ficam resolvidos de uma vez: o resultado deixa de depender de qual segmento avalia o viewport primeiro e de em que estado está o Lenis.

*Alternativas:*
- **Sincronizar o Lenis com a posição nativa depois do scroll do Next** (`lenis.resize()` ou repor `targetScroll`). Só resolve A, porque em B e C o Next nem chega a fazer scroll.
- **`lenis.stop()`/`start()` à volta da navegação.** Também só resolve A, e o "início" de uma navegação não tem um evento público fiável no App Router.
- **Tirar o Lenis.** Resolve tudo, mas perde o smooth scroll que o design pede.

### 2. Com Lenis, o scroll é `lenis.scrollTo(0, { immediate: true, force: true })`

`immediate` põe `animatedScroll = targetScroll = 0` e escreve a posição nativa no mesmo passo, o que mata qualquer interpolação pendente (A). `force` ignora o estado `stopped`, que existe enquanto o menu mobile está aberto: a limpeza desse efeito (`lenis.start()`) e o nosso efeito correm no mesmo commit e a ordem entre eles não é garantida. Sem Lenis (`prefers-reduced-motion`, ou antes de o Lenis montar), o scroll é `window.scrollTo({ top: 0, behavior: "instant" })`, porque `"instant"` passa por cima do `scroll-behavior: smooth` do CSS.

O componente usa `useLenis()`, que devolve `undefined` fora do `ReactLenis`. Por isso o mesmo componente serve os dois ramos de `SmoothScroll`. Nos dois ramos é renderizado na mesma posição e devolve `null`, por isso o DOM dos dois braços continua idêntico e a exceção de hidratação documentada em `SmoothScroll` mantém-se válida.

### 3. Como identificar o que não deve ir para o topo

- **Primeira montagem**: guarda-se o pathname inicial num `ref` e não se faz scroll. A carga inicial, o reload e a abertura com hash ficam com o browser.
- **Hash**: lê-se `window.location.hash` no efeito. O Next atualiza o histórico (`HistoryUpdater`, `useInsertionEffect`) antes de os efeitos correrem, por isso a URL já é a de destino. Se houver hash, não se faz nada e o Next continua a tratar do `scrollIntoView`.
- **Voltar/avançar**: um listener de `popstate` (registado uma vez, só marca um `ref`, sem ler geometria) assinala que a próxima mudança de pathname vem do histórico. O efeito consome a marca e não faz scroll. O `popstate` dispara antes de o router do Next atualizar o pathname.

O efeito corre no commit que muda o pathname. Se a rota passar pelo `loading.tsx`, esse commit é o do fallback (`min-h-svh`): a página fica no topo logo aí e o conteúdo entra por baixo do header.

### 4. Onde vive

Em `src/components/SmoothScroll/`, ao lado do `LenisFrameDriver`. A responsabilidade é a mesma (quem controla o scroll), e o componente tem de estar dentro do `ReactLenis`.

## Risks / Trade-offs

- [O `HistoryUpdater` do Next pode correr depois do nosso efeito numa versão futura, e o hash seria lido da URL antiga] → A tarefa de verificação cobre "âncora noutra página". Se falhar, o hash passa a ser lido do `href` clicado (um listener de clique em fase de captura) em vez da URL.
- [O Next ainda faz o seu próprio scroll depois do nosso, por exemplo quando o segmento real substitui o fallback] → Se fizer, vai para o topo também, porque o topo do segmento fica fora do viewport só se a página não estiver no topo. Não há conflito.
- [O Lenis pode estragar a restauração do voltar/avançar pelo mesmo mecanismo A] → Fica fora do âmbito. Regista-se na verificação se acontecer.
- [Trocar de idioma (`/en/x` → `/pt/x`) é uma mudança de pathname e passa a ir para o topo] → É o comportamento por omissão do Next quando o layout `[locale]` remonta. Ver Open Questions.

## Open Questions

- Trocar de idioma deve manter a posição de scroll? A proposta é ir para o topo, como as outras navegações. Se não for isso que se quer, o `LocaleSwitch` pode marcar a navegação (como o `popstate`) para ser ignorada.
