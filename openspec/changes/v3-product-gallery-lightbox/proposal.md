## Why

As imagens da galeria do detalhe do produto mostram o cursor "View", mas não abrem nada: o clique não faz nada, e o visitante só vê a imagem recortada pela grelha (`object-cover`). O "View" promete ver a imagem inteira, e é isso que esta change entrega.

## What Changes

- Cada imagem da galeria passa a abrir um **lightbox**: a imagem inteira (`object-contain`) sobre um fundo escuro, com fechar, anterior/seguinte e um contador "n / total".
- O lightbox é um diálogo acessível: foco preso dentro dele, `Esc` fecha, as setas do teclado navegam, e o foco volta à imagem que o abriu.
- Enquanto o lightbox está aberto, a página por trás não rola, incluindo o scroll suave do Lenis.
- A grelha da galeria continua a ser renderizada no servidor, e só a parte interactiva vai para o cliente. O cursor "View" e o zoom das imagens no hover não mudam.
- Com movimento reduzido, o lightbox abre e fecha sem animação.

## Capabilities

### New Capabilities
- `product-gallery-lightbox`: abrir, navegar e fechar as imagens da galeria do detalhe do produto num diálogo, com teclado, foco e scroll correctos.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- **Código**: novo `src/components/GalleryLightbox/` (client component), `src/components/ProductDetail/index.tsx` (a secção da galeria passa a usá-lo).
- **Dependências**: nenhuma nova. O `Dialog` vem do `radix-ui`, que já é dependência; a animação usa CSS ou `motion`, que também já está instalado.
- **Bundle**: um chunk de cliente novo, só na rota do detalhe (`client-bundle-budget`).
- **Sem mudanças** em conteúdo nem no hcms: as imagens são o `product.gallery: Media[]` de hoje.
