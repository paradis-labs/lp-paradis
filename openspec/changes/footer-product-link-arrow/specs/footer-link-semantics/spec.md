## MODIFIED Requirements

### Requirement: Externo e interno se distinguem por um único flag authorável

O comportamento de cada link de `linkGroups` SHALL ser governado pelo flag `links[].isExternal` daquele link.

Um link com `isExternal` marcado SHALL abrir em nova aba, com `rel` contendo `noopener` e `noreferrer`, e SHALL exibir uma afordância visual de link externo — a seta `↗` do mockup — adjacente ao seu rótulo.

Um link com `isExternal` desmarcado ou ausente SHALL NOT receber `target="_blank"` e SHALL NOT receber `rel` de link externo. SHALL NOT exibir a seta, com uma única exceção: um link interno cujo `href` authorado é a página de detalhe de um produto — o caminho `/products/<slug>`, com exatamente um segmento depois de `/products` — SHALL exibir a mesma seta `↗`, com o mesmo hover, adjacente ao seu rótulo. Esse link continua interno em tudo o resto: mesma aba, sem `rel` de externo, com o prefixo de locale.

A exceção é decidida pela rota, em código, e não por um campo authorado: o hcms não tem um campo livre para a pedir, e os produtos do footer apontam para as páginas de detalhe porque o URL live só se visita a partir delas. A listagem `/products` e as outras rotas internas SHALL NOT exibir a seta.

Isso corrige o estado anterior, em que `src/components/Footer/index.tsx` aplicava `target="_blank" rel="noopener noreferrer"` a **todo** link do footer, incluindo navegação interna como `Home`, `Products`, `Services`, `About`, `Members` e `Contacts`, e em que a seta não era renderizada para nenhum link.

#### Scenario: Link externo abre em nova aba com a seta

- **WHEN** um link tem `isExternal` marcado e a página é renderizada
- **THEN** sua âncora tem `target="_blank"`, tem `rel` com `noopener` e `noreferrer`, e exibe a seta de link externo ao lado do rótulo

#### Scenario: Link interno navega na mesma aba sem seta

- **WHEN** um link tem `isExternal` desmarcado ou ausente, o seu `href` não é a página de detalhe de um produto, e a página é renderizada
- **THEN** sua âncora não tem `target="_blank"`, não tem `rel` de link externo, e não exibe seta

#### Scenario: Link para a página de um produto exibe a seta e continua interno

- **WHEN** um link tem `isExternal` desmarcado e `href` `/products/kitenda`, e a página `/pt` é renderizada
- **THEN** sua âncora tem `href` `/pt/products/kitenda`, não tem `target="_blank"` nem `rel` de link externo
- **AND** exibe a seta `↗` ao lado do rótulo, que se desloca na diagonal no hover como a dos links externos

#### Scenario: A listagem de produtos não exibe a seta

- **WHEN** um link tem `isExternal` desmarcado e `href` `/products`
- **THEN** não exibe seta

#### Scenario: Grupo misto renderiza cada link conforme o seu destino

- **WHEN** um mesmo grupo contém links internos para páginas, links internos para páginas de produto e links externos — como o `Quick Links` do hcms, com `Home`/`Products`/`Services` e `Kitenda`/`Ficha Segura` em `/products/<slug>`
- **THEN** a coluna exibe a seta apenas nos links de produto e nos externos
- **AND** só os externos abrem em nova aba

#### Scenario: Nenhum link interno abre em nova aba

- **WHEN** todos os links de navegação interna do footer são inspecionados após a change
- **THEN** nenhum deles tem `target="_blank"`, incluindo os que exibem a seta por apontarem para um produto
