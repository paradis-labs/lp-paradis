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

## Diagnosticar

Cada pedido do flow deixa uma linha `[cache]` nos logs do site:

| Linha | Significado | O que fazer |
|---|---|---|
| `[cache] revalidado pelo hcms { collection, tags }` | Aceite, e as tags foram invalidadas | Nada. Se o conteúdo continua antigo, ver "Ainda antigo" abaixo |
| `[cache] nada a revalidar: coleção que o site não conhece` | Aceite, mas a coleção não está no mapa de `src/content/cache-tags.ts` | Normal para coleções de outros sites. Se o site lê essa coleção, acrescentá-la ao mapa |
| `[cache] revalidação recusada: o site não tem CMS_REVALIDATE_SECRET` | 401: o site arrancou sem o segredo | Configurar `CMS_REVALIDATE_SECRET` (passo 2) e reiniciar |
| `[cache] revalidação recusada: segredo recebido errado` | 401: o `revalidate_secret` do item `sites` não é o do site | Igualar os dois (passos 2 e 3) |
| `[cache] revalidação recusada: corpo inválido` | 400: o corpo não tem o formato acima | Rever o flow no template |
| `[cache] revalidação recusada: outro site { site }` | 400: o `revalidate_url` de outro site aponta para aqui | Corrigir o `revalidate_url` desse site |

**Nenhuma linha `[cache]` depois de uma edição:** o pedido não chegou ao site. Ver no hcms o registo do flow "Revalidate site — send" e o `revalidate_url` do item `sites`.

Sem o segredo, o site também avisa ao arrancar: `[cache] CMS_REVALIDATE_SECRET em falta: a revalidação pelo hcms está desligada…`.

**Desenvolvimento local e staging:** o `revalidate_url` aponta para um só site, o de produção. Um `npm run dev` ou um staging nunca recebe o aviso do hcms, e serve conteúdo até 1 hora desatualizado. Para revalidar à mão, com o mesmo `CMS_REVALIDATE_SECRET` do servidor:

```bash
CMS_REVALIDATE_SECRET=… npm run cms:revalidate -- http://localhost:3000
```

**Ainda antigo depois de `revalidado pelo hcms`:** o router do browser mostra o que já tem durante 5 minutos ao navegar dentro de um separador aberto, e um reload completo resolve. Uma imagem substituída no hcms com o mesmo id mantém o URL, e o `/_next/image` continua a servir a versão otimizada antiga.
