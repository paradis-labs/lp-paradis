## ADDED Requirements

### Requirement: Produção permanece servível depois de cada fase

Cada change do roadmap SHALL poder ser integrada e implantada sozinha, deixando o site público funcional em `en` e `pt`, com o formulário de orçamento a gravar submissões.

#### Scenario: Merge de uma fase intermédia

- **WHEN** qualquer change das fases 0a a 3 é implantada em produção
- **THEN** `/en`, `/pt`, `/en/get-quote` e `/pt/get-quote` respondem 200 com o conteúdo de antes
- **AND** uma submissão do formulário é gravada

### Requirement: O Payload serve produção até ao cutover, e edita-se num só sítio de cada vez

Até à troca de provider na fase 4, o conteúdo servido em produção SHALL vir do Payload. Em cada momento SHALL haver um único sítio onde os editores alteram o conteúdo do site: o Payload até ao congelamento da fase 4, e o hcms a partir daí. A verificação da fase 2 SHALL ser repetida depois de qualquer edição feita no Payload antes do congelamento.

#### Scenario: Edição no Payload antes do congelamento

- **WHEN** um editor altera conteúdo no Payload durante as fases 1 a 3
- **THEN** a alteração aparece no site
- **AND** a verificação de conteúdo da fase 2 reporta a diferença até a mesma alteração ser feita no hcms

### Requirement: A migração é reversível por configuração até ao fim da janela de rollback

Desde a fase 3 até ao fim da janela de rollback da fase 4, voltar a servir o site a partir do Payload SHALL ser possível sem deploy de código. O código e os dados do Payload SHALL NOT ser removidos antes do fim dessa janela.

#### Scenario: Remoção antecipada

- **WHEN** a janela de rollback da fase 4 ainda não fechou
- **THEN** a fase 5 não é iniciada

### Requirement: O roadmap não escreve no schema do hcms partilhado

Nenhuma change do roadmap SHALL criar, alterar ou remover coleções, campos, políticas ou Flows no hcms a partir deste repositório, nem SHALL guardar tokens com essas permissões. Mudanças no hcms SHALL ser pedidas a quem o administra.

#### Scenario: Campo em falta no modelo

- **WHEN** uma fase precisa de um campo que o hcms não tem
- **THEN** a falta é registada como lacuna no design da fase e pedida a quem administra o hcms, e o site define o que faz enquanto ela existir

### Requirement: As changes do roadmap são arquivadas por ordem de dependência

Uma change que modifica uma capability criada por outra change do roadmap SHALL ser arquivada depois dessa outra.

#### Scenario: Arquivar a fase 3

- **WHEN** a fase 3 é arquivada
- **THEN** as fases 0a e 0b já foram arquivadas, porque a fase 3 modifica `cms-content-source` e `cms-content-cache`
