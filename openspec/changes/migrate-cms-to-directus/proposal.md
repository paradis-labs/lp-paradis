## Why

O Payload vive **dentro** da app Next: o admin (`/admin`), a API (`/api`), o schema (`src/collections/`) e o adaptador de Postgres sobem no mesmo processo e na mesma imagem que o site público. Cada build arrasta o Payload inteiro, cada bump do Next fica refém da compatibilidade do `withPayload`, e os componentes importavam diretamente os tipos gerados e o renderer de Lexical — o CMS não era um detalhe de implementação, era parte do código do site.

O destino já existe: **`hcms.paradis.host`**, um Directus 11 partilhado ("Paradis CMS", *"Content for several websites"*), onde o site "Paradis" já está modelado, com páginas por blocos, navegações, ofertas, projetos e o formulário de orçamento, e com o conteúdo carregado em `en-US`/`pt-AO`. Passar a ler dali separa o ciclo de vida do conteúdo do do site e põe este site no mesmo CMS que os outros.

> A motivação acima descreve os custos observáveis no repositório. Se a decisão tiver razões adicionais (operação, equipa editorial), devem ser acrescentadas aqui antes de aprovar.

A migração é grande demais para um único PR seguro, e há dez issues abertos (#13–#22) que mexem nas mesmas camadas. Esta change é o **roadmap**: não tem código próprio. Define a ordem e as invariantes, e cada parte entregável é uma change separada, aplicada e arquivada sozinha.

## What Changes

```
 HOTFIX     fix-quote-requests-public-create          segurança, já
 ONDA 0     fix-wave-0-independent-issues             #13 #16 #17 #18 #19 #20 #21 #22A
 ONDA 1     fix-footer-slot-soft-navigation           #14 (limpa o slot antes da 0a)
 ─────────────────────────────────────────────────────────────────────────────
 FASE 0a    cms-phase-0a-content-seam                 costura + tipos de domínio (#8 #4 #3)
 FASE 0b    cms-phase-0b-content-cache                cache + tags do módulo + hooks Payload (#15)
 FASE 1     cms-phase-1-hcms-alignment                mapeamento domínio → hcms + script de contrato
 FASE 2     cms-phase-2-content-verification          conteúdo do hcms completo e igual ao do Payload
 FASE 3     cms-phase-3-directus-provider             provider hcms, CMS_PROVIDER, revalidação, paridade
 FASE 4     cms-phase-4-cutover                       congelamento, troca, janela de rollback
 FASE 5     cms-phase-5-remove-payload                BREAKING: Payload, /cdn e S3 fora do site
```

- **Hotfix separado da migração.** `create: () => true` em `quote-requests` deixava `POST /api/quote-requests` aberto e contornava todas as guardas da Server Action. Fecha-se já, porque a Server Action grava pela Local API, que ignora o access control por omissão.
- **Issues sem ligação ao CMS avançam antes**, sem esperar pela migração e sem criar trabalho que ela tenha de desfazer.
- **Não há serviço novo nem migração de dados:** o hcms já existe e já tem o conteúdo. As fases 1 e 2 alinham o site com o modelo existente e verificam o conteúdo, sem escrever no schema de uma instância partilhada.
- **#15 dividido:** o cache e as tags vivem no módulo de conteúdo (0b), os hooks do Payload são provisórios (0b → removidos na 5) e um Flow do hcms invalida as mesmas tags (3).
- **#22:** a opção A (nova aba forçada) entra na onda 0. A opção B (campo authorável) **sai do roadmap**: os projetos no hcms não têm esse campo. Fica registada como lacuna.
- Produção continua no Payload até à fase 4. Cada change deixa `main` em estado de produção.

## Capabilities

### New Capabilities

- `cms-migration-sequencing`: as invariantes do roadmap (ordem entre as changes, produção sempre servível, reversibilidade até ao fim da janela de rollback).

### Modified Capabilities

_(nenhuma: cada fase declara as suas)_

## Impact

- **Changes filhas:** as 10 listadas acima. Cada uma tem proposal, design, specs e tasks próprios.
- **Capabilities novas ao longo do roadmap:** `cms-content-source` (0a, 3, 5), `cms-content-cache` (0b, 3, 5), `hcms-content-contract` (1), `hcms-content-verification` (2), `cms-cutover` (4), `navigation-progress-feedback` e `project-card-links` (onda 0).
- **Infra:** nenhum serviço novo. O site usa `CMS_URL`, `TOKEN_SECRET_READ` e `TOKEN_SECRET_FORM` (já no `.env`), mais `CMS_REVALIDATE_SECRET` e `CMS_PROVIDER` (esta transitória). Na fase 5 saem a base do Payload, a rota `/cdn` e o acesso ao S3.
- **Fora do repo:** quem administra o hcms cria o Flow de invalidação, resolve as lacunas do modelo e, num rollback, exporta as submissões.
- **Editores:** passam a editar só no hcms a partir do congelamento (fase 4).
- **Issues:** fecha #3, #4, #8 e #13–#22 (o #22 com a opção A).
