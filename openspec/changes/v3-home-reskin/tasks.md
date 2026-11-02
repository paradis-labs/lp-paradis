## 1. Fundação

- [x] 1.1 Ler o guia de CSS/animação do Next 16 em `node_modules/next/dist/docs/` que for relevante (Cache Components, `next/dynamic` com `ssr: false` em server components)
- [x] 1.2 Passar para `globals.css` os tokens do v3 (`#151718`, `#212528`, `#31373d`, `#525252`, `#6e797e`, `#edeef0`, `#f6f7f8`, `#fafafa`) e as curvas (`0.165,0.84,0.44,1`, `0.4,0,0,1`, `0.16,1,0.3,1`, `0.22,1,0.36,1`) como variáveis do tema Tailwind
- [x] 1.3 Acrescentar em `globals.css` as regras de motion do v3: `.rv`/`.rv-in`/`.rv-grow`, `dsSlideIn` (com variante só de transform para o H1), `.sweep` dentro de `@supports (animation-timeline: view())`, `.flip`, `.nav-roll`, marquee `mq`, e os blocos `prefers-reduced-motion`
- [x] 1.4 Garantir que a regra de segurança de visibilidade (`HydrationSignal`) alcança os elementos `.rv` pelo atributo de marcação

## 2. Primitivas partilhadas

- [x] 2.1 Criar o `Reveal` (client, estado `idle|out|in` no React, um `IntersectionObserver` partilhado com `threshold: 0` e sem margem, disparo único) e o `MarqueePause` (pausa fora da viewport e com a aba oculta)
- [x] 2.2 Reescrever as camadas do `Button` para o efeito `ds-btn` (painel em arco, rótulo com roll, disco com dois glifos) com o mapeamento de variantes do design (D3), mantendo `href`, `asChild`, Calendly e o mapa `swapInvert` tipado
- [x] 2.3 Remover `magnetic` do `Button` e de todos os call sites, e apagar `src/lib/use-magnetic`
- [x] 2.4 Aplicar a espessura de contorno por tamanho (1,5px compacto, 2px grande), constante entre repouso e hover
- [x] 2.5 Criar `PageHeader` (server): grelha 90×30 mascarada, eyebrow em pill, H1, lead, slot de ações
- [x] 2.6 Criar o cartão de chamada (shine border + título + subtítulo + CTA) como componente reutilizável
- [x] 2.7 Criar o cursor novo (client, carregado com `next/dynamic` só com `pointer: fine`), com os modos link/botão/texto, o tom por `data-cursor-tone` e o rAF que para quando converge. Apagar `CursorFollower` e `ui/cursor-glow`
- [x] 2.8 Criar a fixture dev-only `/[locale]/fixtures/v3` (botões claro/escuro, `PageHeader`, cartão de chamada, item de FAQ aberto e fechado), com `notFound()` como primeira instrução
- [x] 2.9 Atualizar a fixture `/fixtures/buttons` para as variantes e os tamanhos novos

## 3. Navbar e menu mobile

- [x] 3.1 Acrescentar `socialLinks` ao tipo `NavBar` em `src/content/types.ts` e lê-las do item `sites` em `providers/hcms.ts` (com o mesmo mapeamento do footer)
- [x] 3.2 Navbar em glass permanente (`blur(20px) saturate(160%)`), remover o estado e o listener de `scrollY`, links com `.nav-roll` e `aria-current`
- [x] 3.3 Breakpoints: links só a partir de 1024px; CTA e switch na barra a partir de 768px
- [x] 3.4 Reescrever o `NavBarMobileMenu` para o painel escuro numerado: rótulo "NAVIGATION", links 01–05 com chip, e abaixo de 768px o título "Ready to build?", os botões, o switch e as redes
- [x] 3.5 Comportamento do menu: `aria-expanded` e nome acessível localizado, fecho ao escolher um destino, com Escape e ao passar a ≥1024px, bloqueio do scroll de fundo e foco contido, com o foco devolvido ao botão
- [x] 3.6 Cópia de UI do navbar e do menu em `Record<Locale, …>` (EN e PT)
- [x] 3.7 Atualizar a fixture `/fixtures/navbar` com o menu aberto em 390px e em 900px, e com o caso "sem redes"

## 4. Secções da home

- [x] 4.1 `Hero`: cartão com grelha mascarada, H1 com gradiente sobre cor sólida de base e entrada só por transform, descrição e CTAs com `dsSlideIn` e atrasos .5/.6s
- [x] 4.2 `MarqueeServices`: faixa CSS de 45 s com a lista duplicada uma vez, ícone por item, máscara nas pontas, pausa no hover
- [x] 4.3 About: título com `.sweep` (`sweep-h` no H2), lead, CTA `outline` grande, `data-rv`
- [x] 4.4 Vídeo dos serviços: `rv-grow`, manter `VideoAutoPause` e o `clip-path` de `homepage-shape-interlock`; aplicar `preload="none"` e poster se o hcms tiver poster (P1 da Motion spec), senão registar em aberto
- [x] 4.5 `ServicesSection`: grelha de 12 colunas com as posições do mockup para 7 itens, células decorativas e vinheta, queda para colunas regulares com outro número, uma coluna abaixo de 768px, stagger 0,07 s
- [x] 4.6 `ProductsSection` + `Card`: grelha 3/2/1, capa de 280px com chip de seta e `data-cursor-text="Discover"`, título em maiúsculas, descrição a 22px, link "Discover More" com `.flip`, "View All" `inverted` só com `url`
- [x] 4.7 `TestimonialsSection` + `TestimonialCard`: cartões do v3 e janela com máscara e alturas por breakpoint, mantendo o `ScrollVelocityRow` vertical anterior; só a primeira coluna acessível; data do domínio formatada no locale
- [x] 4.8 `FAQSection` + `ui/accordion`: estilos do v3, `forceMount` com animação por `grid-template-rows`, primeiro item aberto, ícone que roda
- [x] 4.9 Cartão de chamada por baixo do FAQ, com cópia de UI localizada e o `secondaryCta` do hero, omitido sem `url`
- [x] 4.10 Marcar o painel escuro com `data-cursor-tone="light"` e montar o cursor no layout
- [x] 4.11 Retirar de `page.tsx` os imports que ficam órfãos (`Reveal`, `TextReveal`, `Parallax` se deixar de ser usado) e apagar os módulos sem uso

## 5. Footer

- [x] 5.1 Reordenar o `Footer` para o layout do v3: faixa "Ready to build?" com gradiente sobre cor sólida e os dois CTAs (`inverted`, `outline-inverted`), logo + tagline, colunas de links com `.flip` e seta nos externos, barra com copyright e redes circulares
- [x] 5.2 Fundo `#212528` com a grelha mascarada no topo e o halo radial, `data-cursor-tone="light"`
- [x] 5.3 Confirmar que a faixa de contacto direto de `/get-quote` continua a renderizar por cima, sem alterações
- [x] 5.4 Rever a fixture `/fixtures/footer`: os cinco estados degradados continuam a renderizar no layout novo

## 6. Verificação

- [x] 6.1 Comparar `/en` e `/pt` com o artboard a 1440, 1024, 768 e 390px, e confirmar que não há transbordo horizontal (`responsive-content-fit`)
- [ ] 6.2 Com o JavaScript desligado e com os `.js` bloqueados: todo o texto legível (`text-visibility-guarantees`)
- [ ] 6.3 Com `prefers-reduced-motion: reduce`: sem entrada, sem sweep, marquee parado, sem cursor
- [x] 6.4 Performance trace: o H1 é o LCP e não espera pela animação; página parada sem rAF agendado (`idle-runtime-budget`); scroll dentro do orçamento com a navbar em glass (`scroll-frame-budget`)
- [x] 6.5 Teclado: navbar, menu mobile (abrir, Tab contido, Escape), acordeão do FAQ
- [x] 6.6 `npm run lint` e `npm run build` sem erros
