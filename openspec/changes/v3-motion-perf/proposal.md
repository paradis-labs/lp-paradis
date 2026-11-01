## Why

O artboard "Motion & performance spec" do canvas v3 lista oito melhorias por prioridade. Quase todas já entraram com as changes v3:
- o H1 do hero sem fade;
- o vídeo com `poster` e `preload="none"`;
- a revelação só uma vez;
- o cursor só em desktop;
- os testemunhos e o 2.º CTA do hero com conteúdo real.

Faltam três, e uma delas é das mais pesadas da página:
- **Logo:** `logo.svg` (40,7 KB) e `logo-white.svg` (38,3 KB) são PNG de 1168×308 embrulhados em SVG. Estão no header e no footer de todas as páginas. Como a URL acaba em `.svg`, o `next/image` não os otimiza, e o browser descarrega o PNG inteiro para o mostrar a 134×25 e a 163×31.
- **Navbar:** o `backdrop-blur` de 20px é recalculado em cada frame de scroll, por cima do vídeo e dos marquees.
- **Fonte:** a Inter carrega o peso 700, que só os `<strong>` do texto rico usam.

## What Changes

- **Logo em PNG de tamanho real.** O PNG que está dentro de cada SVG é extraído e redimensionado para 402 px de largura (3× o header), mantendo a proporção.
  - Entra em `public/` como fallback (`logo.png`, `logo-white.png`), no lugar dos SVG.
  - Entra no seed do template e no hcms (`sites.logo`, `sites.logo_inverse`), com ids novos.
  - O `next/image` passa a servir o logo em WebP ou AVIF, no tamanho de cada sítio.
  - Fica a porta aberta para um SVG vetorial, se o designer o tiver: troca-se o ficheiro e mais nada.
- **Navbar:** `backdrop-blur` de 20px para 12px, com o mesmo `saturate`. É a sugestão da spec; o design v3 desenha 20px.
- **Inter sem o 700:** os pesos passam a 400, 500 e 600, e os `<strong>`/`<b>` do texto rico passam a 600. A Gilroy (títulos) fica igual.
- **Fora do âmbito:** os pontos já resolvidos, e o poster do vídeo (é conteúdo: a tarefa 4.3 da `v3-cms-gaps`).

## Capabilities

### New Capabilities
- `v3-motion-perf`: o peso do logo, o blur da navbar e os pesos da Inter, os três pontos que faltavam da Motion spec do canvas.

### Modified Capabilities
(nenhuma)

## Impact

- **Código:**
  - `public/` (sai `logo.svg` e `logo-white.svg`, entram os PNG);
  - `src/components/Header/` e `src/components/Footer/` (os fallbacks);
  - `src/components/NavBar/NavBarRoot.tsx`;
  - `src/app/(app)/[locale]/layout.tsx` (pesos da Inter);
  - `src/app/(app)/globals.css` (`strong` a 600).
- **Template e hcms:** dois ficheiros novos no seed da Paradis (`tooling/seed/files.mjs` e `assets/paradis/`), e `sites.logo`/`logo_inverse` a apontar para eles. Aplicado ao hcms com backup, como na `paradis-v3-products`. Os SVG antigos ficam sem referências.
- **Visual:**
  - o logo deve ficar igual (é o mesmo bitmap, só mais pequeno);
  - a navbar fica um pouco menos desfocada;
  - o negrito do texto rico fica um pouco mais leve.
