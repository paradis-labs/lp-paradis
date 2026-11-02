## MODIFIED Requirements

### Requirement: As redes renderizam na ordem authorada, nos dois sítios do footer

Os links de redes do aside de contacto de `/get-quote` e os ícones da barra inferior do footer SHALL renderizar pela ordem do array `socialLinks` do CMS. Nenhum dos dois inverte ou reordena.

A descrição do campo promete ao editor que a ordem é a que ele escolhe ("in the order added here"). Uma inversão num dos dois sítios tornaria essa promessa falsa sem explicação.

#### Scenario: Ordem consistente

- **WHEN** o array `socialLinks` contém, por esta ordem, Dribbble, LinkedIn e Instagram
- **THEN** os links do aside aparecem por essa ordem
- **AND** os ícones da barra inferior do footer aparecem pela mesma ordem

## REMOVED Requirements

### Requirement: A faixa apresenta contacto direto e redes, acima do footer corrente

**Reason**: No v3, o contacto direto e as redes passam do footer para o aside ao lado do formulário (artboard "v3 · Get Quote").

**Migration**: A posição e o layout passam a `quote-contact-aside` ("O aside fica ao lado do formulário"). As regras de conteúdo desta spec (e-mail do `Contact`, títulos localizados do `directContact`, nome visível derivado da plataforma, `label` como nome acessível) aplicam-se ao aside sem alteração.

### Requirement: A faixa degrada por partes quando falta conteúdo

**Reason**: A faixa deixa de existir. O aside tem três grupos e não dois, e a sua degradação é especificada à parte.

**Migration**: `quote-contact-aside`, "O aside degrada por grupo".

### Requirement: A faixa acomoda ecrãs estreitos sem transbordar

**Reason**: A faixa deixa de existir.

**Migration**: `quote-contact-aside`, cenário "Telefone".

### Requirement: Os estados degradados da faixa são exercitáveis sem tocar no banco

**Reason**: A faixa deixa de existir. Os casos passam para a fixture da página de orçamento, onde agora vive o aside.

**Migration**: `quote-contact-aside`, "Os estados do aside são exercitáveis numa fixture". A fixture `/fixtures/footer` perde os casos da faixa.
