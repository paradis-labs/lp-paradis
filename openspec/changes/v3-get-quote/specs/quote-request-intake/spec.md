## ADDED Requirements

### Requirement: A empresa é gravada quando o formulário a declara

Quando o formulário `quote_request` do hcms declarar o campo `company`, a Server Action SHALL aceitar um valor opcional de empresa, validado pelo schema zod partilhado (texto, aparado, com limite máximo de comprimento), e o provider SHALL gravá-lo em `data.company` da `form_submissions`. Um valor vazio SHALL ser gravado como ausente, e não como string vazia.

Quando o formulário não declarar o campo, a action SHALL ignorar qualquer valor de empresa recebido, e o provider SHALL NOT enviar `data.company`.

#### Scenario: Empresa preenchida

- **WHEN** um visitante submete nome, e-mail, mensagem e empresa "Acme", com o campo declarado no hcms
- **THEN** a submissão é gravada com `data.company` igual a "Acme"

#### Scenario: Empresa vazia

- **WHEN** a submissão é válida e a empresa vem vazia
- **THEN** a submissão é aceite e `data` não contém `company`

#### Scenario: Empresa forjada sem o campo no hcms

- **WHEN** a action recebe um valor de empresa e o formulário do hcms não declara o campo
- **THEN** a submissão é gravada sem `data.company`

#### Scenario: Empresa acima do limite

- **WHEN** a empresa excede o comprimento máximo do schema
- **THEN** a submissão é rejeitada, com o erro associado ao campo da empresa e a mensagem de piso `tooLong` do CMS

### Requirement: O estado de sucesso permite um novo envio

Depois de uma submissão bem-sucedida, o cartão do formulário SHALL dar lugar a uma confirmação com `role="status"`: um ícone, a mensagem de sucesso do CMS como título, o subtítulo "We'll reply within one business day." (cópia de UI localizada) e um botão `outline` "Send another" / "Enviar outro". O botão SHALL repor o formulário vazio, com os chips desligados, e devolver o foco ao primeiro campo.

O mesmo estado SHALL aparecer quando o honeypot está preenchido, como exige "Guardas de spam sem dependência externa".

#### Scenario: Confirmação anunciada

- **WHEN** a gravação conclui com êxito
- **THEN** a confirmação substitui o formulário e um leitor de ecrã anuncia a mensagem de sucesso

#### Scenario: Enviar outro

- **WHEN** o visitante carrega em "Send another"
- **THEN** o formulário volta vazio, sem chips selecionados, e o foco está no campo do nome
