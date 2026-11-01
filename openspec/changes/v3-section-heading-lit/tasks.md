## 1. Cabeçalho

- [x] 1.1 `SectionHeading`: título e subtítulo com `LitText tone="dark"` dentro do `<h2>` e do `<p>`, sem prop (design, D1–D2); a pill, os `children` e o `Reveal` ficam como estão
- [x] 1.2 `SectionHeading`: tirar o `text-white/64` do `<p>` e actualizar o comentário do componente (o efeito por letra, e porque não é o `TextReveal` de antes)

## 2. Verificação

- [x] 2.1 Chrome a 1440px: os três cabeçalhos (Services, Products, Testimonials) acendem, o título antes do subtítulo, e acabam a branco a 100%
- [x] 2.2 Testimonials, o último, chega ao fim do intervalo (fundo do subtítulo acima dos 35%) a 1440px e a 390px
- [x] 2.3 A 390px nenhuma palavra parte a meio, e o título mantém o `text-balance`
- [x] 2.4 A pill e o "View All" de Products não acendem; a revelação do bloco corre como antes
- [x] 2.5 Com `prefers-reduced-motion` e sem `animation-timeline` (Firefox): o título e o subtítulo a 100%, estáticos
- [x] 2.6 Árvore de acessibilidade: cada cabeçalho é um `heading` de nível 2 com a frase uma vez, e o subtítulo aparece uma vez
- [x] 2.7 `npm run lint` e `npm run build`

## Notas da aplicação

- 2.1: medido no Chrome, nos três cabeçalhos, com o progresso calculado pela fórmula do mockup. Com o título em p = 0,5, o subtítulo está em p ≈ 0,35, e só a sua primeira letra está acesa: a cascata existe. No fim, todas as letras ficam a 1.
- 2.2–2.3: a janela do Chrome não desceu dos 1440px, por isso os 390px mediram-se num `iframe` com essa largura. O fim do intervalo do Testimonials fica bem antes do fim da página: y = 3228 de 4954 a 1440px, e 4070 de 6217 a 390px. Nenhuma palavra parte nem transborda, e o `.lit` herda `text-wrap: balance` do `<h2>`.
- 2.5: o browser de teste não emula a preferência nem a falta de suporte. Verificou-se pelo CSS compilado: a animação só existe dentro de `@supports (animation-timeline: view())` + `no-preference`, e fora disso a cor base é `text-white` a 100%.
- 2.7: o `npm run lint` acusa erros que já existiam em `src/components/ui/` (`grid-pattern`, `marquee`, `scroll-based-velocity`), ficheiros que este change não toca; `SectionHeading` passa. O `npm run build` passa (precisa de rede para o hcms).
