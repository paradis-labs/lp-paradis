## Context

A fase 1 fixou o mapeamento domínio → hcms e o script de contrato, que confirma a **forma** do modelo. Esta fase confirma o **conteúdo**. Os dois CMS têm o mesmo conteúdo em formas diferentes. O Payload tem globals e campos localizados, com fallback automático para `en`. O hcms tem blocos e coleções, com traduções `en-US`/`pt-AO` em tabelas `*_translations`.

## Goals / Non-Goals

**Goals:**
- Um relatório que diz, sem ambiguidade, se o hcms já pode servir o site.
- Correções feitas no sítio certo (no hcms, pelos editores) e repetíveis até zero.

**Non-Goals:**
- Escrever em qualquer dos dois CMS.
- A paridade do objeto de domínio produzido pelo provider (fase 3). Aqui compara-se o conteúdo, não o código que o mapeia.
- Submissões antigas (ficam no Payload; ver fase 4).

## Decisions

### Comparar campos do mapeamento, não registos inteiros
Os modelos não têm correspondência 1:1. O script tem uma tabela `[campo de domínio, leitor Payload, leitor hcms]` que segue o mapeamento do design da fase 1, por exemplo `homepage.hero.headline: Payload hero.headline ↔ hcms block_hero.title`. Cada linha é comparada por locale. As listas (projetos, serviços, testemunhos, FAQs) são emparelhadas por slug ou título normalizado, e não por posição, para que uma reordenação no hcms não pareça uma diferença de conteúdo. A ordem é reportada à parte.

### Ler o Payload sem fallback
`fallbackLocale: false`. Com fallback, um campo em falta em `pt` no Payload compararia o inglês com o português do hcms e daria um falso alarme. Ou, pior, esconderia uma tradução em falta.

### Normalizar antes de comparar
Espaços colapsados e aparados nos textos. O rich text é convertido para texto com quebras de parágrafo (o HTML do Lexical e o do WYSIWYG diferem em marcação, não em conteúdo). Os URLs são comparados sem o prefixo de locale (`/en/get-quote` no hcms ↔ `/get-quote` no Payload).

### Exceções explícitas e revistas
`accepted-differences.json` lista `{ campo, locale, motivo }` para diferenças intencionais, por exemplo um texto revisto no hcms. Entra por PR, para que aceitar uma diferença seja uma decisão visível e não um silêncio do script.

### `[EXEMPLO]` é sempre bloqueante
Um texto de exemplo nunca é aceitável em produção. Não pode entrar na lista de exceções.

## Risks / Trade-offs

- [O token de leitura não ver conteúdo que existe] → O relatório distingue "0 itens visíveis" de "itens com diferença". Resolver isto é pré-requisito, combinado com quem administra o hcms.
- [Emparelhamento por título falhar quando o título mudou] → Os itens sem par são listados dos dois lados, e a lista de exceções permite emparelhar à mão.

## Migration Plan

Correr, corrigir no hcms, repetir. O relatório a zero (ou só com exceções aceites) é guardado com data e anexado ao PR da fase 4.
