## 1. Logo

- [x] 1.1 Extrair o PNG de `public/logo.svg` e de `public/logo-white.svg` e reamostrar para 402×106 (`sips`) → `public/logo.png`, `public/logo-white.png`; remover os SVG
- [x] 1.2 Header e Footer: os fallbacks passam a `/logo.png` e `/logo-white.png`
- [x] 1.3 Template: `paradis:logo-png` e `paradis:logo-inverse-png` no seed (ficheiros em `assets/paradis/`), o `sites` da Paradis a apontar para eles; `pnpm rebuild` e `pnpm verify`
- [x] 1.4 hcms: backup do `sites` da Paradis, upload dos dois ficheiros com os ids do seed, `PATCH` do `logo` e do `logo_inverse`; confirmar com o token de leitura

## 2. Navbar e fonte

- [x] 2.1 `NavBarRoot`: `backdrop-blur-md` (12px) no lugar de `backdrop-blur-[20px]`
- [x] 2.2 `[locale]/layout.tsx`: Inter com `weight: ["400", "500", "600"]` e um comentário sobre o `strong`
- [x] 2.3 `globals.css`: `strong, b { font-weight: 600 }` na camada base

## 3. Verificação

- [x] 3.1 `npm run lint` (sem erros novos) e `npm run build`
- [x] 3.2 Num build local: o pedido do logo do header devolve WebP ou AVIF com menos de 10 KB; o HTML não pede nenhuma face Inter 700; o FAQ mostra o negrito a 600 (logo do header em WebP: 5,4 KB a 1×, 8,4 KB a 2×; footer 4,4/7,0 KB; faces Inter só 400/500/600)
