## Context

Os issues #13–#22 foram analisados contra o plano de migração para o Directus. Os que constam aqui não tocam em `src/service/`, em `src/collections/` nem em `payload-types.ts`; os que tocam (#14, #15) estão noutras changes, e o #22 opção B ficou fora do roadmap. O diagnóstico detalhado de cada issue está no próprio issue no GitHub e não é repetido aqui; este documento regista as decisões que o issue deixava em aberto.

## Goals / Non-Goals

**Goals:**
- Fechar os oito issues sem criar trabalho que a migração tenha de desfazer.
- Entregar em PRs pequenos: (A) #13 + #16 + #17, (B) #19 → #18 → #20, (C) #21 + #22.

**Non-Goals:**
- Caching de dados (#15), que fica nas fases 0b e 3.
- O slot `@footer` (#14), que fica em `fix-footer-slot-soft-navigation`.
- Localizar o rótulo "Discover More" (mencionado no #22): é conteúdo e entra no modelo Directus.

## Decisions

### #13 — guard de raiz em `localizedHref`
O guard passa a tratar como raiz qualquer href cujo resto, depois de `/`, esteja vazio ou comece por `#` ou `?`. É uma extensão do guard atual, não uma reescrita. O passo do Lenis é **condicional**: só entra se, depois da correção do href, o link ainda falhar com movimento normal e funcionar com `prefers-reduced-motion` (o que isola o Lenis). Se entrar, o destino é entregue com `lenis.scrollTo(hash)` depois de a navegação concluir, e não intercetando o clique.

### #16 — `Suspense` em vez de remover `useSearchParams`
A opção B do issue (ler a query só no clique) elimina a dependência, mas obriga o `href` a ser calculado em runtime, o que estraga o prefetch do `<Link>` e o `href` real no DOM (que a spec `navbar-locale-switch` exige). Fica a opção A: `<Suspense>` à volta do `LocaleSwitch` em `Header`, com um fallback de largura e altura iguais às do botão. O fallback renderiza o mesmo `Button` com o código do locale corrente e sem `href`. Isso exige que o locale chegue por prop, algo que `navbar-link-destinations` já garante para o navbar.

### #17 — barra por `onNavigate` + `usePathname`, não por wrapper de todos os links
O wrapper `<AppLink>` com `useLinkStatus` obriga a trocar todos os `next/link`, incluindo os que vêm de `Button asChild`. Em vez disso, um store de módulo minúsculo: o início é marcado num listener de clique delegado no `document`, que filtra âncoras internas, com o mesmo origin e sem modificadores, e o fim quando `usePathname()` muda. Fica menos preciso em navegações programáticas (`router.push`), mas o site não as usa para navegar entre páginas. O `loading.tsx` entra primeiro e sozinho resolve o "nada acontece". A barra respeita `prefers-reduced-motion`, ficando sem animação de largura e só com opacidade.

### #19 — remover `border-2`, sem nova prop
O `ShineBorder` já tem 1px. Só se o design pedir mais espessura o `Button` passa a aceitar `shineWidth`. Duração e comportamento em `disabled` ficam como estão nesta change: o shine continua a animar enquanto `isPending`. Decidir se acelera durante o envio é ajuste visual e fica para depois.

### #18 — variante `pill` + exaustividade real
`swapInvert` passa a ser tipado como `Record<NonNullable<VariantProps<typeof buttonVariants>["variant"]>, SwapInvert>`. É a opção contida, porque `noUncheckedIndexedAccess` espalharia ruído pelo repo. Assim o comentário existente passa a ser verdade. A pill de disponibilidade em `GetQuote/index.tsx` **não** converge: não é interativa e não deve ganhar hover. O estado selecionado é comunicado por `aria-pressed` e pelo preenchimento, nunca só pela cor da borda.

### #20 — `Reveal` em dois blocos, não por campo
`Reveal` reanima a cada entrada na viewport (`scroll-reveal-animations`) e começa oculto. Por campo, um Tab para um campo abaixo da dobra mostraria o foco num elemento a meio da animação. Por isso há só dois níveis: (1) o cabeçalho (pill, título, subtítulo) com stagger, e (2) o formulário inteiro como um só bloco. As mensagens de erro vivem dentro do bloco do formulário, que está necessariamente na viewport quando o visitante submete. O primeiro ecrã não ganha um segundo fade sobre o do `template.tsx`, porque o primeiro `Reveal` do cabeçalho começa com `delay` 0 e sem deslocamento adicional.

### #21 — constante de gutter no módulo do footer
`px-6 sm:px-10 lg:px-14 xl:px-0`, numa constante `FOOTER_GUTTER` em `Footer/index.tsx`, usada pelos três blocos. Mover o padding para o utility `container` mudaria todas as secções que o consomem e fica fora desta change.

### #22 — `<a>` com `target="_blank"` forçado
Os URLs de `Projects` são todos externos. O `Card` passa a renderizar `<a target="_blank" rel="noopener noreferrer">` para o link do projeto. O nome acessível ganha a indicação de nova aba (texto só para leitores de ecrã), como o `Button` já faz com `openInNewTab`.

## Risks / Trade-offs

- [#13 muda os hrefs dos CTAs] → Os CTAs para `/get-quote`, `mailto:` e URLs absolutas não são afetados pelo guard. A fixture `navbar` cobre os cinco casos.
- [#16: um fallback com dimensões diferentes causa layout shift] → O fallback usa o mesmo `Button` e o mesmo conteúdo visual, só sem `href`.
- [#17: o listener delegado não vê `router.push`] → Aceite. A barra é feedback e não um estado de que alguma coisa dependa.
- [#18: alterar o tipo de `swapInvert` pode expor variantes já em falta] → É o objetivo. Se o compilador apontar uma, acrescenta-se a entrada no mesmo PR.

## Migration Plan

Três PRs independentes contra `develop`, por qualquer ordem. Em cada um: `npm run lint`, `npm run build` e verificação manual nas fixtures. Rollback: reverter o PR.

## Open Questions

- Valores finais do gutter (#21) e duração do shine no CTA (#19): validar com design no PR.
