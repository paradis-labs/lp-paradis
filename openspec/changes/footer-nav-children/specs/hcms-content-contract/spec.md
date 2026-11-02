## ADDED Requirements

### Requirement: Navegação lida nas duas formas
O site SHALL ler as navegações pedindo `items` e `items.children`, com os mesmos campos e traduções nos dois níveis. Um link de um grupo SHALL ser aceite em qualquer das formas:
- **plana:** em `items`, com `parent` igual ao id do grupo;
- **aninhada:** em `items.children` do grupo, com `navigation` nulo.

Um link que venha nas duas formas SHALL aparecer uma só vez, e a ordem dentro de cada grupo SHALL seguir `sort`. Itens abaixo do segundo nível SHALL ser ignorados.

#### Scenario: Forma actual do hcms
- **WHEN** os links das colunas do `footer_columns` vêm em `items` com `parent` e também em `items.children`
- **THEN** o footer mostra Quick Links, Company e Products com 5, 3 e 5 links, sem repetidos

#### Scenario: Depois da migração do hcms
- **WHEN** os links das colunas vêm só em `items.children`, e `items` traz só os 3 grupos
- **THEN** o footer mostra as mesmas 3 colunas com os mesmos links, pela mesma ordem

### Requirement: O cms:check verifica os links das colunas
O `cms:check` SHALL contar os links de cada grupo do `footer_columns` nas duas formas e SHALL falhar, nomeando o grupo, quando um grupo não tiver nenhum link.

#### Scenario: Coluna vazia
- **WHEN** o grupo "Company" do `footer_columns` não tem links nem em `items` nem em `items.children`
- **THEN** o `cms:check` sai com código diferente de zero e nomeia a coluna "Company"
