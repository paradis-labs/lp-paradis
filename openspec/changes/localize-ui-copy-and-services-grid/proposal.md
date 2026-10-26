## Why

Em `/pt` continua a aparecer inglês, mesmo com o conteúdo traduzido no CMS. Os badges das secções ("Our Services", "Our Products", "Testimonials") estão escritos no JSX. A grelha de serviços junta os itens do CMS a uma tabela fixa **por slug**, e dois cartões não batem certo: `uiux-design` na tabela, `ui-ux-design` no CMS (nos dois providers). Esses cartões mostram o texto de recurso, que só existe em inglês. Isto já acontece hoje com o Payload; só ficou visível quando o hcms trouxe as traduções pt.

## What Changes

- Os badges das secções da home passam a ter texto por idioma (`en`/`pt`), no componente, seguindo o padrão já usado no repo (`NEW_TAB_HINT`, `SWITCH_LABEL`).
- A tabela da grelha de serviços passa a usar o slug do domínio (`ui-ux-design`), o mesmo que os dois providers entregam.
- O texto de recurso de cada cartão da grelha (nome e descrição) passa a existir em `en` e `pt`, para que um serviço em falta no CMS não traga inglês para `/pt`.
- Os pisos de texto que ainda só existem em inglês e aparecem quando o CMS está vazio (rodapé, rótulo de envio do formulário, "Discover More" dos cards) passam a existir por idioma.
- Fica de fora: tornar os badges editáveis no CMS. O hcms já tem o `eyebrow` de cada bloco, mas o Payload não. Fica para depois da fase 5 de `migrate-cms-to-directus`, quando houver um só CMS.

## Capabilities

### New Capabilities

- `ui-copy-localization`: todo o texto visível da UI pública que não vem do CMS existe em cada idioma do site, e a grelha de serviços encontra no CMS todos os serviços que ele tem.

### Modified Capabilities

_(nenhuma)_

## Impact

- **Código:** `ServicesSection`, `ProductsSection`, `TestimonialsSection`, `Footer`, `GetQuote`, `Card`/`ProductsSection` (o rótulo do link do card). Os componentes que ainda não recebem o locale passam a recebê-lo por prop, à imagem do `ProductsSection`.
- **Sem dependências novas:** o next-intl não tem mensagens configuradas neste repo, e o seu runtime de cliente foi evitado de propósito (+33,6 KB, ver `src/lib/locale-href.ts`).
- **Conteúdo:** o slug en-US da oferta "API & Integrations" no hcms tem de passar a `api-integrations`. É uma correção de conteúdo já listada pela fase 2, não código desta change.
- **Fixtures:** a fixture do footer passa a cobrir os pisos em `pt`.
