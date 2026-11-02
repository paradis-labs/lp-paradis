## Context

O roadmap cruza dois tipos de trabalho: issues pontuais (#13–#22) e uma migração de CMS em várias fases. Cada issue foi classificado pelo quanto toca no Payload, porque é isso que decide se pode avançar já ou se tem de ser ordenado com a migração.

| Issue | Toca no CMS? | Destino |
|---|---|---|
| #21, #18, #19, #20, #17, #16 | não | onda 0 |
| #13 | só pelos valores dos hrefs | onda 0 |
| #22 | A: não · B: schema | A na onda 0 · B fora (o hcms não tem o campo) |
| #14 | ficheiros que a 0a reescreve | onda 1, antes da 0a |
| #15 | cache + invalidação | 0b (cache, hooks Payload) e 3 (Flow do hcms) |
| #8, #4, #3 | camada de dados | 0a |

**Reorientação de 2026-10-23.** O plano original previa montar um Directus próprio (fase 1) e migrar os dados para lá (fase 2). Ao aplicar a fase 1 descobriu-se que já existe um Directus partilhado, `hcms.paradis.host`, com o site "Paradis" modelado num construtor de páginas e o conteúdo carregado. As fases 1 e 2 passaram a alinhamento e verificação, a fase 3 passou a ler esse modelo, e as fases 4 e 5 foram ajustadas. O levantamento que levou à mudança está no design de `cms-phase-1-hcms-alignment`.

## Goals / Non-Goals

**Goals:**
- Ordem explícita entre as changes, com as dependências reais e não só as cronológicas.
- Paralelismo onde ele existe.

**Non-Goals:**
- Decisões técnicas de cada fase, que ficam no design de cada change filha.

## Decisions

### Grafo de dependências

```
 fix-quote-requests-public-create ──────────────────────────────────────┐ (independente)
 fix-wave-0-independent-issues ─────────────────────────────────────────┤
 fix-footer-slot-soft-navigation ──► 0a ──► 0b ──┐                      │
                                                 ├──► 3 ──► 4 ──► 5     │
                           1 ──► 2 ──────────────┘                      │
                           (1 e 2 em paralelo com 0a/0b) ◄──────────────┘
```

- **0a antes de 0b:** o cache vive no módulo que a 0a cria.
- **1 → 2, em paralelo com 0a/0b:** não tocam no site. A 2 compara o hcms com o Payload pela tabela de mapeamento da 1.
- **3 depois de 0b, 1 e 2:** o provider hcms precisa do contrato de tags (0b), do mapeamento (1) e de conteúdo verificado para a paridade (2).
- **4 depois de 3 em produção**, com `CMS_PROVIDER=payload` e o portão a zero em staging.
- **5 só depois da janela de rollback** da 4.

### Uma change por parte entregável
Cada change é aplicada e arquivada sozinha, e as suas specs entram em `openspec/specs/` no arquivo. Por isso, as changes que modificam capabilities criadas por changes anteriores (3 e 5 sobre `cms-content-source` e `cms-content-cache`) têm de ser **arquivadas por ordem**.

### O hcms é partilhado: este repo não escreve no schema
Nenhuma change deste roadmap aplica schema, cria coleções ou políticas, ou usa tokens de admin no hcms. O que falta no modelo vai para quem o administra, como lacuna documentada. O site só tem um token de leitura e um de `create` em `form_submissions`.

### Invariantes partilhadas (spec `cms-migration-sequencing`)
Produção servível depois de cada merge; o Payload serve produção até ao cutover; um único sítio de edição de cada vez; reversibilidade por configuração até ao fim da janela de rollback.

## Risks / Trade-offs

- [Arquivar fora de ordem] → As deltas da 3 e da 5 falham a aplicação se a capability ainda não existir. A ordem de arquivo é a do grafo e está em `tasks.md`.
- [O roadmap ficar desatualizado em relação às filhas] → `tasks.md` desta change é só a checklist das filhas; o detalhe vive nelas.
- [Dependência de quem administra o hcms] → Flow, lacunas do modelo, acesso dos editores e exportação de submissões num rollback. Combinar o responsável antes da fase 3.

## Open Questions

- Motivações adicionais (operação, equipa editorial) para completar o Why.
- Quem administra o hcms e é o ponto de contacto para as fases 1, 3 e 4.
