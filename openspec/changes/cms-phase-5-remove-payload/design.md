## Context

Depois da fase 4, produção corre com `CMS_PROVIDER=hcms` há pelo menos 7 dias, sem rollback. O Payload está só de leitura e ninguém o usa. Continua presente o código transitório das fases anteriores: hooks de revalidação (0b), `PAYLOAD_READ_ONLY` (4), a seleção de provider (3) e os scripts de verificação e paridade (2–3). A rota `/cdn` só servia ficheiros do Payload.

## Goals / Non-Goals

**Goals:**
- Nenhuma referência ao Payload ou ao bucket S3 no código, nas dependências, nas variáveis de ambiente ou na documentação do site.
- Nenhuma mudança visível para visitantes.

**Non-Goals:**
- Alterar o modelo de conteúdo no hcms.
- Reescrever specs antigas que dizem "admin" no sentido genérico de interface editorial.
- Apagar o bucket S3 (é decisão de infra).

## Decisions

### Remoção num PR, em commits por camada
Cada commit deixa o build a passar: (1) remover a seleção de provider e o provider Payload; (2) remover `(payload)/`, `withPayload`, `payload.config.ts`, `src/collections/` e `payload-types.ts`; (3) remover `/cdn`, `src/service/` e o SDK S3; (4) remover dependências e env; (5) passar a cache para `"use cache"`; (6) docs. Um PR facilita reverter tudo de uma vez se algo escapar.

### `/cdn` sai, mesmo com links externos possíveis
Os URLs `/cdn/<chave>` foram públicos e podem estar em pré-visualizações partilhadas ou em índices de imagens. Manter a rota obrigaria a manter o S3 e o seu SDK só para isso. A rota sai. Se os logs da janela de rollback mostrarem tráfego relevante para `/cdn/*`, um redirect `/cdn/<chave>` → `/assets` do hcms pode substituí-la, mas isso exige uma tabela chave → id, que fica fora de âmbito.

### `cacheComponents` agora
A razão para não o ligar na 0b era o admin do Payload no mesmo processo, e essa razão desaparece aqui. Os ajustes que a spike da 0b registou entram nesta change. Se o volume de erros de build for grande, a troca sai para uma change própria e esta fase mantém `unstable_cache`.

### `sharp` só sai com prova
O `next/image` em `output: "standalone"` usa `sharp` para otimizar imagens em produção. Remove-se, faz-se o build da imagem e testa-se `/_next/image` com uma imagem do hcms. Se a otimização falhar ou cair para o fallback lento, `sharp` volta.

### Scripts que dependem do Payload arquivados no git
`cms/parity/`, `cms/hcms/verify-content.ts` e `cms/hcms/import-submissions.ts` usam a Local API do Payload, que deixa de existir. São removidos, e o `cms/hcms/README.md` aponta para o commit. `check-contract.ts` fica e passa a ser a verificação permanente do contrato com o hcms.

### Dump da base do Payload antes de a desligar
`pg_dump` guardado com a mesma política de retenção dos backups. Contém submissões (dados pessoais), por isso a retenção segue a política de dados pessoais da empresa e não "para sempre".

## Risks / Trade-offs

- [Um import esquecido do Payload ou do SDK S3] → O build falha, porque o pacote deixa de estar instalado. É o comportamento desejado.
- [`/api/cms/revalidate` depender do layout do route group removido] → O handler vive em `src/app/api/`, fora de `(payload)`, e não depende dele. Testar o Flow depois do deploy.
- [Links externos para `/cdn/*` partidos] → Medidos durante a janela de rollback; redirect como mitigação possível (ver acima).

## Migration Plan

Deploy normal. Rollback: reverter o PR e o deploy, enquanto a base do Payload não tiver sido desligada. Por isso a base só é desligada depois de uma semana com a fase 5 em produção.
