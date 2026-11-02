## Why

O conteúdo do site já está no hcms (`hcms.paradis.host`), por isso a migração de dados prevista deixa de ser precisa. O que falta é **provar que está completo e correto** antes de o site passar a lê-lo. O levantamento da fase 1 encontrou três sinais de que isso ainda não está garantido:
- o hero, o bloco "about", a descrição da grelha de serviços e os resumos dos projetos ainda dizem `[EXEMPLO] … Replace with … from Payload`;
- `testimonials` e `faqs` não aparecem ao token de leitura;
- não há nenhuma comparação com o que o Payload serve hoje.

É a fase 2 do roadmap `migrate-cms-to-directus`, e o seu resultado é o portão de conteúdo do cutover.

## What Changes

- Novo script só de leitura `cms/hcms/verify-content.ts`, que produz um relatório com três partes:
  1. **Textos de exemplo:** todo o campo traduzido do site, em todos os blocos e coleções do mapeamento da fase 1, que contenha `[EXEMPLO]`.
  2. **Traduções em falta:** campos preenchidos em `en-US` e vazios em `pt-AO`, ou o contrário.
  3. **Diferenças face ao Payload:** para cada campo do mapeamento, o valor do Payload (lido com a Local API e sem fallback de locale) comparado com o do hcms, por locale. Rich text é comparado depois de normalizado.
- O script **nunca escreve** em nenhum dos dois CMS. As correções são feitas no app do hcms por quem edita conteúdo, e o script volta a correr até o relatório dar zero.
- Os testemunhos e as FAQs são confirmados com quem administra o hcms: ou existem e é preciso ajustar o filtro do token de leitura, ou faltam e são carregados no hcms.
- O script sai com código ≠ 0 enquanto houver textos de exemplo, traduções em falta ou diferenças não aceites. As diferenças aceites (ex.: um texto melhorado no hcms) ficam numa lista explícita de exceções no repo.

## Capabilities

### New Capabilities

- `hcms-content-verification`: a verificação de que o conteúdo no hcms está completo, traduzido e equivalente ao do Payload, e a lista de exceções aceites.

### Modified Capabilities

_(nenhuma)_

## Impact

- **Repositório:** `cms/hcms/verify-content.ts` e `cms/hcms/accepted-differences.json`. Corre com `payload run`, para ter a Local API do Payload no mesmo processo.
- **Pessoas:** os editores corrigem no hcms o que o relatório apontar.
- **Dados pessoais:** não compara submissões. As submissões antigas continuam no Payload (ver a fase 4).
- **Sequência:** depois de `cms-phase-1-hcms-alignment`. Um relatório a zero é pré-condição da fase 4.
