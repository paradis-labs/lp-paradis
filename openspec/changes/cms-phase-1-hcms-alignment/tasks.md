## 1. Script de contrato

- [x] 1.1 Adicionar `@directus/sdk` como dependência de desenvolvimento
- [x] 1.2 Criar `cms/hcms/check-contract.ts` (lê `CMS_URL` e `TOKEN_SECRET_READ`; nunca imprime o token; envia um `User-Agent` explícito, porque o Cloudflare à frente do hcms recusa clientes sem ele com o erro 1010)
- [x] 1.3 Verificar o site `paradis` e os idiomas `en-US`/`pt-AO`
- [x] 1.4 Verificar as páginas `home` e `contact` e os blocos esperados por coleção e âncora (ver o mapeamento no design)
- [x] 1.5 Verificar as navegações `header`, `header_actions`, `footer_columns` e `footer_actions`
- [x] 1.6 Verificar o formulário `quote_request` e os campos `name`, `email`, `interests` (`choices_source=offerings`) e `message`
- [x] 1.7 Verificar itens publicados do site em `offerings`, `projects`, `testimonials` e `faqs`, com código ≠ 0 e a peça em falta nomeada
- [x] 1.8 Script em `package.json`: `cms:check`

## 2. Documentação

- [x] 2.1 `cms/hcms/README.md`: o que é o hcms, os tokens e a sua função, o mapeamento resumido, e como correr `cms:check`
- [x] 2.2 `CLAUDE.md`: referir o hcms e `cms:check` na secção de env vars

## 3. Lacunas

- [ ] 3.1 Enviar a lista de lacunas do design a quem administra o hcms, com destaque para os testemunhos e FAQs não visíveis e para a forma de `form_submissions`
- [ ] 3.2 Registar as respostas no design e ajustar o mapeamento de `testimonials`/`faqs`

## 4. Verificação

- [x] 4.1 `npm run cms:check` contra o hcms atual: o resultado esperado hoje é falhar apenas em `testimonials`/`faqs`, e a falha tem de nomear as duas coleções — 25/27; também testado com uma âncora inexistente (nomeada) e com `CMS_URL` vazio
- [x] 4.2 `npm run lint` nos ficheiros novos
