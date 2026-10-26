## MODIFIED Requirements

### Requirement: Todo o acesso a conteúdo passa por um único módulo

Páginas, layouts, slots e Server Actions do site SHALL obter e gravar conteúdo exclusivamente através do módulo `src/content/` (import `@/content`). Nenhum ficheiro fora de `src/content/providers/` SHALL importar `@directus/sdk`.

A regra SHALL ser imposta pelo lint e não apenas por convenção.

#### Scenario: Import proibido num componente

- **WHEN** um componente em `src/components/` importa `@directus/sdk`
- **THEN** `npm run lint` falha

#### Scenario: Consumidores usam o módulo

- **WHEN** se procura `@directus/sdk` fora de `src/content/providers/`
- **THEN** não há nenhuma ocorrência

### Requirement: Media chega com URL resolvida

Uma media no domínio SHALL ter `url`, `alt`, `width` e `height`, com `url` já resolvida pelo provider para o `/assets/<id>` do hcms. Os componentes SHALL NOT construir URLs de media.

#### Scenario: Imagem do hero

- **WHEN** o hero é renderizado
- **THEN** o `src` da imagem resolve para o `/assets/<id>` do hcms, através do `next/image`

## REMOVED Requirements

### Requirement: O provider é selecionado por ambiente, num único ponto

**Reason**: Com o Payload removido só existe um provider; a seleção era transitória e servia o cutover e a janela de rollback.
**Migration**: Retirar `CMS_PROVIDER` do ambiente. O módulo usa sempre o provider hcms.

### Requirement: Os providers são verificados quanto à paridade de domínio

**Reason**: A paridade compara dois providers, e o provider Payload deixa de existir.
**Migration**: Nenhuma. O script `cms/parity/` é removido e fica no histórico do git; `cms:check` continua a verificar o contrato com o hcms.
