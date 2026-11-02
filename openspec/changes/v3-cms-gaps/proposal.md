## Why

O canvas do v3 mostra conteúdo que o site ainda não tira do hcms: os ícones dos passos de três dos quatro produtos, o rótulo curto do "Visit" ("Visit Génesis"), o poster do vídeo dos serviços e vários textos do get-quote. Hoje uns caem para um piso em código e outros nem aparecem. A investigação no `Template-multisite-tenant` mostrou que a maior parte destes campos **já existe no schema** e só não é lida. Só dois pedem schema novo.

## What Changes

**Fase 1, só neste repo, com campos que o hcms já tem:**
- **Get-quote:**
  - o título de sucesso passa a ler `forms.success_title`, com o piso de `v3-finish-pages`;
  - o "Send another" passa a ler `forms.success_again_label`;
  - o placeholder da mensagem passa a ler `form_fields.placeholder` do campo `message`.
- **Poster do vídeo dos serviços:** lê o `image` do bloco `block_media_text #about-us`, o mesmo bloco que já dá o vídeo (`media`), e passa-o ao `<video poster>`. Fecha o P1 da Motion spec ("Vídeo: poster + preload"), que já tinha o `preload="none"`.
- **Ícones dos passos:** `PRODUCT_ICONS` ganha os 8 que o canvas usa e o site não tem (`chart`, `heart`, `calendar`, `filter`, `bank`, `chat`, `leaf`, `bag`), com os traços dos artboards. O `calculator` passa ao traço do artboard da Ficha Segura. O provider já descarta valores fora da lista, por isso isto funciona antes de o hcms os oferecer.

**Fase 2, depois de uma change no `Template-multisite-tenant`:**
- **Schema (lá):**
  - as 8 opções novas no `select('icon')` dos `steps` dos `projects`;
  - um campo `short_name` nos `projects`, um nome de marca não traduzido para rótulos curtos;
  - o seed com os ícones e os nomes curtos dos quatro produtos.
- **Site (aqui):** o "Visit" passa a `Visit ${shortName ?? title}`, e o `cms:check` passa a exigir `short_name`.

**Fica em código, de propósito:** o título e o subtítulo do cartão do formulário, "(optional)" e o título e a nota do cartão de chamada. São microcópia de UI, como "Send another" era antes de haver campo, e não há campo no schema que lhes caiba sem forçar o sentido de outro.

**Fora do âmbito:** escrever no schema do hcms a partir deste repo, e o conteúdo do "Next product" (fica a ordem da lista) e do URL ao vivo (fica um só).

## Capabilities

### New Capabilities
- `v3-cms-fields`: os campos do hcms que o v3 lê (textos do get-quote, poster do vídeo, ícones dos passos, nome curto do produto), os pisos de cada um e a ordem de entrega entre o schema do template e o site.

### Modified Capabilities
(nenhuma: os requisitos destas páginas ainda vivem nas changes v3 por arquivar)

## Impact

- **Código (fase 1):**
  - `src/content/types.ts` (`QuotePage.form`, `Homepage.services.ourServicesCT`, `PRODUCT_ICONS`)
  - `src/content/providers/hcms.ts` (campos lidos e mapeados)
  - `src/components/GetQuote/` e `src/components/ProductDetail/` (mapa de ícones)
  - a página da home (`<video poster>`)
- **Código (fase 2):** `types.ts` (`Project.shortName`), `hcms.ts`, `ProductDetail` e `cms/hcms/check-contract.ts`.
- **Cache:** nenhuma leitura nova. Os campos entram em leituras já cacheadas e invalidadas pelas mesmas coleções (`forms`, `form_fields`, `block_media_text`, `projects`, `directus_files`).
- **Outro repo:** uma change no `Template-multisite-tenant` (schema e seed), proposta e aplicada lá.
- **Conteúdo:** carregar uma imagem de poster no bloco `#about-us`, preencher `success_title`, `success_again_label` e o placeholder em en/pt, e escolher os ícones dos passos quando o schema os tiver.
- **Depende de** `v3-finish-pages` (piso do título de sucesso).
