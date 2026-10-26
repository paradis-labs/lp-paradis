# Correções no hcms: primeira corrida (2026-10-24)

Relatório completo: `2026-10-24-primeira-corrida.txt`. Tudo se corrige no app do hcms (site **Paradis**). Depois, `npm run cms:verify` volta a correr até dar zero.

**Corrigir** = o hcms está errado ou incompleto. **Decidir** = os dois textos são válidos: ou se alinha o hcms com o Payload, ou a diferença entra em `cms/hcms/accepted-differences.json` com o motivo (por PR).

## Home

| Onde no hcms | O quê | Ação |
|---|---|---|
| `block_hero`: título e lead (en + pt) | `[EXEMPLO]`. Payload en: título "We Build Digital Products That Move Businesses Forward"; descrição "We design and build software and UI/UX experiences for our own products and for ambitious companies." | Corrigir e traduzir |
| `block_hero`: botão 1, URL em pt | `/pt/pedir-orcamento` não existe no site (a rota é fixa) | Corrigir para `/get-quote` |
| `block_media_text #about-us`: título | "Our Services". Payload: "Crafting Digital Experiences That Blend Strategy, Design & Technology" | Corrigir (en + pt) |
| `block_media_text #about-us`: lead (en + pt) | `[EXEMPLO]`. Payload: "At Paradis, we create impactful digital products…" (ver relatório) | Corrigir e traduzir |
| `block_media_text #about-us`: botão, URL em pt | `/pt/pedir-orcamento` | Corrigir para `/get-quote` |
| `block_media_text #about-us`: media | Sem vídeo. Payload: "Circuit Board Technology Video.mp4" | Carregar o vídeo |
| `block_collection #services`: título | "What We Offer". Payload: "Services Designed to Power Modern Digital Businesses" | Decidir |
| `block_collection #services`: lead (en + pt) | `[EXEMPLO]`. Payload: "From software development to UI/UX design, we build scalable digital solutions…" | Corrigir e traduzir |
| `block_collection #products`: título e lead | Título "View Our Work" e lead vazio. Payload: "Digital Products Built to Solve Real Problems" e "We create innovative digital products…" | Corrigir (en + pt) |
| `block_collection #testimonials`: título e lead | Título "Testimonials" e lead vazio. Payload: "Built for Businesses. Loved by Users." e "From software solutions to digital products…" | Corrigir (en + pt) |
| `block_collection #faqs`: lead | Vazio. Payload: "Find quick answers about our services, products, and how we work with clients." | Corrigir (en + pt) |
| `projects` Kitenda e Ficha Segura: summary (en + pt) | `[EXEMPLO]`. Payload: "Smart Prepaid Card Load Calculator for Visa Angola" e "The smart deposit simulator built for the Angolan market" | Corrigir e traduzir |
| `projects` Kitenda e Ficha Segura: imagem | Sem imagem (o Payload tem as capas) | Carregar as capas |
| `offerings` "API & Integrations": slug en | `api-and-integrations`; o Payload usa `api-integrations` | Decidir (alinhar o slug ou emparelhar à mão) |
| `testimonials` e `faqs` | 0 itens visíveis ao token de leitura (o Payload tem 2 e 4) | Ver com quem administra o hcms (tarefa 3.1) |

## Navegação e rodapé

| Onde no hcms | O quê | Ação |
|---|---|---|
| Navegação `header` | Faltam "Products" e "Testimonials", que o Payload tem | Decidir |
| `sites`: redes | Instagram `paradis.labs` no hcms e `paradis.labs_` no Payload; Dribbble só existe no hcms | Confirmar o perfil certo |
| `sites`: copyright (en) | "Paradis.Labs" no hcms e "Paradis Labs" no Payload | Decidir |
| `block_contact` (página contact): título en | "Reach Us Directly" no hcms e "Reach us directly" no Payload | Decidir |
| `block_contact`: email_label en | "Email". O Payload tinha o próprio e-mail como título | Provavelmente aceitar |
| Navegação `footer_actions`: botão primário pt | "Pedir orçamento - Grátis". O Payload tinha "Contact Us" em pt | Provavelmente aceitar |

## Página de orçamento

| Onde no hcms | O quê | Ação |
|---|---|---|
| Página `contact`: seo_title en | "Get a Quote — Paradis" no hcms e "Get Quote" no Payload | Decidir |
| Formulário: label do e-mail en | "Your email" no hcms e "Your Email" no Payload | Decidir |

O relatório lista ainda 76 textos que **o hcms acrescenta** (sobretudo traduções pt que o Payload nunca teve). Não contam como falha, mas convém relê-los.
