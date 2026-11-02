## Context

- **O logo:**
  - `public/logo.svg` e `public/logo-white.svg` têm 134×25 de `viewBox`, e lá dentro está um `<pattern>` com um PNG de 1168×308 em base64 (30 KB e 28 KB).
  - O header usa `args.logo?.image?.url ?? "/logo.svg"` e o footer `args.logo?.url ?? "/logo-white.svg"`. Os URLs do hcms são `${CMS_URL}/assets/<id>/<filename>`, e um `.svg` é servido sem otimizador (`hcms.ts`: o otimizador recusa SVG com 400).
  - No hcms, `sites.logo` e `sites.logo_inverse` apontam para estes mesmos SVG, que vêm do seed do template (`paradis:logo`, `paradis:logo-inverse`).
- **A navbar:** `NavBarRoot` tem `bg-white/55 backdrop-blur-[20px] backdrop-saturate-[1.6]`.
- **A Inter:** está declarada em `[locale]/layout.tsx` com `weight: ["400","500","600","700"]`. Nenhum componente usa `font-bold` com Inter (os `font-bold` são todos `font-gilroy`). O 700 chega pelo negrito por omissão do browser nos `<strong>` do texto rico (FAQ, em Markdown).
- **Restrições:** nenhum SVG vetorial do logo neste repo nem no canvas (o SVG de 2 KB do canvas é a bandeira de Angola).

## Goals / Non-Goals

**Goals:** o logo com um peso proporcional ao tamanho, a navbar mais barata no scroll, e um ficheiro de fonte a menos.

**Non-Goals:** redesenhar o logo; mexer na Gilroy; os pontos da Motion spec já resolvidos.

## Decisions

### D1. PNG redimensionado, servido pelo `next/image`
- O PNG embutido é extraído e reamostrado para 402×106 com `sips`, a mesma proporção de 1168×308. São 3× o header, o que cobre o footer (163 px) em 2×.
- Com a URL a terminar em `.png`, o `next/image` passa a gerar WebP ou AVIF no tamanho pedido.
- *Alternativa:* WebP direto. Rejeitada: o otimizador já converte, e o `cwebp` não está instalado.
- *Alternativa:* vetorizar o PNG (trace). Rejeitada: o resultado não é fiel às letras do logo. Um SVG vetorial do designer substitui o PNG sem mudar código, desde que não traga bitmaps.

### D2. O logo muda nos três sítios
1. `public/logo.png` e `public/logo-white.png` no lugar dos SVG, e os fallbacks do header e do footer apontam para eles.
2. No template, `paradis:logo` e `paradis:logo-inverse` passam a ter chaves e ficheiros novos (`paradis:logo-png`, `paradis:logo-inverse-png`), para a cache de imagens não servir os antigos.
3. No hcms, os dois ficheiros são carregados com os ids do seed, e `sites.logo`/`logo_inverse` passam a apontar para eles, com backup antes.

### D3. Blur de 12px
`backdrop-blur-md` é 12px no Tailwind v4. Fica `backdrop-blur-md backdrop-saturate-[1.6]`. O custo do blur cresce com o raio, e 12px mantém o efeito de vidro.

### D4. Inter 400/500/600 e `strong` a 600
`weight: ["400","500","600"]` e, em `globals.css`, `strong, b { font-weight: 600; }` na camada base. A Gilroy tem as suas faces próprias, por isso os títulos com `font-bold` continuam a 700.

## Risks / Trade-offs

- **Um `font-bold` futuro em texto Inter seria sintetizado** → fica um comentário no `layout.tsx` junto dos pesos.
- **O logo raster numa tela 4× (raro)** → 402 px cobre até 3× no header. É aceitável, e um SVG vetorial resolve-o de vez.
- **A navbar fica menos desfocada do que no design** → é a troca que a própria Motion spec propõe.

## Migration Plan

1. Código e `public/`; build e verificação local.
2. Template: seed, `pnpm rebuild` e `pnpm verify`.
3. hcms: backup do `sites` da Paradis, upload dos dois ficheiros e `PATCH` do `logo`/`logo_inverse`.
4. **Rollback:** repor os SVG em `public/` e o `sites` do backup.
