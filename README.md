Paradis Island Landing Page

## External Links

[Figma Link](https://www.figma.com/design/ALG23EQIr1z7qGriMrG5tY/Paradis?node-id=24-3577)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Conteúdo

O conteúdo vem do **hcms** (`hcms.paradis.host`, um Directus partilhado por vários sites), site `paradis`. O modelo e o conteúdo de exemplo vivem no repositório `Template-multisite-tenant`.

Variáveis de ambiente (no `.env`, fora do git):

| Variável | Para quê |
|---|---|
| `CMS_URL` | URL do hcms |
| `TOKEN_SECRET_READ` | ler o conteúdo (só leitura) |
| `TOKEN_SECRET_FORM` | gravar o formulário de orçamento (só `create` em `form_submissions`) |
| `CMS_REVALIDATE_SECRET` | o segredo que o hcms envia ao invalidar a cache (`cms/hcms/FLOW.md`) |

`npm run cms:check` confirma, só com leituras, que o hcms tem a forma de que o site depende.
