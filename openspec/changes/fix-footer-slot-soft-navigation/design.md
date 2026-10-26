## Context

```
@footer/
├── default.tsx            hard nav para rota não coberta  → footer base
└── get-quote/page.tsx     /get-quote                       → footer + faixa
```

Numa navegação soft de `/en/get-quote` para `/en`, nenhuma folha do slot casa com `/en`, o Next mantém `get-quote/page.tsx` e a faixa fica. Acontece o mesmo ao ir de `/get-quote` para qualquer fixture.

## Goals / Non-Goals

**Goals:**
- O footer corresponde à rota em qualquer tipo de navegação.
- Um só sítio define o footer base.

**Non-Goals:**
- Repensar a arquitetura do slot (opção C do issue).
- Alterar a composição de qualquer footer.

## Decisions

**`page.tsx` + `[...catchAll]/page.tsx`, não espelhar a árvore.** O catch-all casa com qualquer subcaminho que não tenha uma folha mais específica. `get-quote/page.tsx` continua a ganhar em `/get-quote`, porque um segmento estático tem precedência sobre um catch-all. A raiz precisa de `page.tsx` próprio porque um catch-all obrigatório (`[...x]`) não casa com zero segmentos. Usar `[[...catchAll]]` (opcional) cobriria os dois com um só ficheiro, mas um catch-all opcional na raiz de um slot é menos óbvio de ler. Ficam dois ficheiros finos.

Alternativa considerada: espelhar cada rota (opção B do issue). Rejeitada, porque obriga a uma folha nova por rota e o esquecimento de uma reintroduz o bug sem aviso.

**Módulo partilhado `@footer/base-footer.tsx`.** Exporta o componente assíncrono que hoje está em `default.tsx`. As três folhas reexportam-no. Um ficheiro sem convenção de rota dentro do slot não é tratado como rota pelo Next, mas nomeia-se sem `page`/`default`/`layout` para não deixar dúvidas. O comentário "rede de 404" fica em `default.tsx`, que é o ficheiro a que ele se aplica.

**A contagem de queries não muda.** Por request só corre uma folha do slot, por isso o `footer` continua a ser buscado uma vez por request, como exige `route-scoped-footer`.

## Risks / Trade-offs

- [O catch-all intercetar rotas que não deveria] → Os slots só afetam o slot; `children` continua a resolver as rotas normalmente. Uma rota inexistente continua a dar o 404 de `children`.
- [Uma rota futura com composição própria esquecer-se de registar a folha] → Recebe o footer base, que é o comportamento correto por omissão.

## Migration Plan

Um PR. Verificação manual de navegação (ver tasks). Rollback: reverter.
