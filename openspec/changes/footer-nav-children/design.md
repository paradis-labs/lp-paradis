## Context

`readNavigations` pede `navigations` com `items.*` e devolve dois helpers:
- `topLevel(key)`: itens com `parent` nulo;
- `children(key, group)`: itens com `parent` igual ao grupo.

O header, o `header_actions`, o `footer_actions` e as colunas do footer usam estes helpers. No hcms, o change `footer-sections-editable` passa os links das colunas a ter só `parent`. Nessa forma, o o2m `items` (filtrado por `navigation`) deixa de os trazer, e eles só chegam pelo o2m `children` do grupo.

## Goals / Non-Goals

**Goals:**
- O footer mostra as mesmas colunas antes e depois da migração do hcms, sem um deploy coordenado ao minuto.
- Os helpers `topLevel` e `children` não mudam de assinatura, e nenhum componente é tocado.

**Non-Goals:**
- Retirar a leitura plana. Isso fica para um change seguinte, depois da fase B no hcms.
- Mais de dois níveis.

## Decisions

### 1. Achatar as duas formas num só mapa por id
Para cada item de `items`:
- o item entra no mapa;
- cada filho de `item.children` entra também, com `parent` igual ao id do item (o pai vem do contexto do o2m, mesmo que o campo `parent` não venha preenchido).

Ids repetidos ficam com a primeira ocorrência. `topLevel` e `children` continuam a filtrar por `parent`, por isso nada a jusante muda.

**Alternativa rejeitada:** montar a árvore só a partir de `children`. Obrigaria a migração do hcms a acontecer antes do deploy, ou no mesmo instante.

### 2. `items.children` com os mesmos campos
A lista de campos dos filhos é a mesma de `items`, gerada a partir de uma só lista, para os dois níveis não divergirem. A ordem continua a ser feita no código por `sort`, como hoje.

### 3. `cms:check` por grupo
Para cada grupo do `footer_columns` (item de topo `type=group`), conta os links:
- em `items` com `parent` igual ao grupo;
- em `items.children`.

Falha quando a soma é zero.

## Risks / Trade-offs

- **[Pedido um pouco maior]** → Em `items.children`, os links vêm repetidos enquanto a fase B não corre. São 13 itens, e a cache de 10 minutos absorve o custo.
- **[O hcms continuar com a forma plana para sempre]** → Não há problema: o código aceita as duas formas.
