## MODIFIED Requirements

### Requirement: O contrato de runtime da imagem SHALL permanecer inalterado

A imagem produzida MUST manter o mesmo contrato de execução de antes desta mudança: comando de entrada `node server.js`, usuário não-root `node`, porta `3000`, `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, e `.next` gravável pelo usuário de runtime.

Esta mudança é sobre como a imagem é produzida, não sobre o que ela é. Qualquer divergência de runtime é regressão, não melhoria. A imagem do site não serve interface de administração de CMS: o conteúdo é administrado no hcms (`hcms.paradis.host`), uma instância Directus partilhada e externa ao site.

#### Scenario: Container sobe e serve a aplicação

- **WHEN** a imagem construída é executada com as variáveis de ambiente de produção
- **THEN** o servidor atende na porta 3000
- **AND** o processo roda como o usuário `node`

#### Scenario: Rotas de aplicação respondem

- **WHEN** o container em execução recebe requisições para `/en` e `/pt`
- **THEN** ambas respondem sem erro de servidor

#### Scenario: Admin do Payload não existe

- **WHEN** o container em execução recebe uma requisição para `/admin`
- **THEN** a resposta é 404
