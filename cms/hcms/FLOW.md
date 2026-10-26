# Invalidação da cache: site Paradis

Para quem administra o hcms (`hcms.paradis.host`).

**O que faz:** quando um editor grava conteúdo, o hcms avisa o site, e o site deixa de servir a versão em cache. Sem isto, o conteúdo atualiza na mesma, mas só ao fim de 1 hora (a expiração máxima da cache).

**Não é preciso criar nenhum Flow.** O template do hcms (`Template-multisite-tenant`) já traz o flow **"Revalidate site"**. Depois de cada `items.create`, `items.update` e `items.delete` de conteúdo, ele faz um `POST` ao `revalidate_url` de cada site que o tenha preenchido. Basta configurar o site.

## Configurar

1. Gerar um segredo aleatório (por exemplo `openssl rand -hex 32`).
2. No site, definir a variável de ambiente `CMS_REVALIDATE_SECRET` com esse segredo e reiniciar.
3. No app do hcms, no item `sites` → **Paradis**, preencher os campos privados:

| Campo | Valor |
|---|---|
| `revalidate_url` | `https://paradis.host/api/cms/revalidate` (em staging, o URL de staging) |
| `revalidate_secret` | o segredo do passo 1 |

O segredo nunca entra num repositório: nem neste, nem no seed do template.

## O pedido que o flow faz

```http
POST https://paradis.host/api/cms/revalidate
content-type: application/json
x-revalidate-secret: <revalidate_secret>

{ "site": "paradis", "event": "items.update", "collection": "projects", "keys": ["…"] }
```

O site invalida as tags da coleção (o mapa está em `src/content/cache-tags.ts`) e responde:

| Estado | Significado |
|---|---|
| 200 | `{ "revalidated": [tags] }`. Uma coleção que o site não usa (de outro site, por exemplo) dá `[]`: não é erro |
| 401 | Segredo em falta ou errado, ou `CMS_REVALIDATE_SECRET` não configurado no site |
| 400 | Corpo inválido, ou `site` diferente de `paradis` (o `revalidate_url` de outro site a apontar para aqui) |

## Limitação conhecida

O flow notifica **todos** os sites com `revalidate_url` de **qualquer** alteração de conteúdo, e o `site` do corpo é o site notificado, não o dono do item. Por isso, uma edição num bloco da Génesis também invalida a homepage da Paradis. Não há perda de conteúdo, só uma renderização a frio a mais. Melhorar isto é uma alteração ao template: o flow passaria a notificar só o site do item, com o caminho até `site` que o `schema.mjs` já calcula.

## Verificar

Editar no hcms o título de um projeto da Paradis e abrir `https://paradis.host/en`: o pedido seguinte já mostra o novo título. Nos logs do site aparece `[cache] revalidado pelo hcms` com a coleção `projects`. No hcms, o registo do flow "Revalidate site — send" mostra o 200.
