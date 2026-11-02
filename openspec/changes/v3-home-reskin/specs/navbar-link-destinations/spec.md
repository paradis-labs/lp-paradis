## MODIFIED Requirements

### Requirement: Os botões do navbar navegam para a sua URL do CMS

Cada botão do array `buttons` do global `Menu` SHALL renderizar um destino navegável usando o seu campo `url`.

O botão "Get Quote" é o caminho de conversão principal do site.

O `Button` SHALL receber o destino por `href`, e não por `asChild`. Com `href`, um destino interno SHALL navegar pelo `Link` do `next/link` (prefetch e roteamento de cliente), e o botão SHALL manter as camadas da animação do v3 (`button-hover-inversion`). O `asChild` sobre um `Link` dava o roteamento sem as camadas, porque o `Slot` aceita um só filho.

#### Scenario: Botão com URL

- **WHEN** o global `Menu` tem um botão com `label: "Get Quote"` e `url: "/get-quote"`, e o visitante está em `/en`
- **THEN** o botão é uma âncora para `/en/get-quote`
- **AND** clicar nele navega para a página de orçamento por roteamento de cliente

#### Scenario: Botão sem URL authorada

- **WHEN** um botão do CMS não tem `url`
- **THEN** o botão continua a ser renderizado com o seu rótulo
- **AND** não produz uma âncora com destino vazio nem lança erro

#### Scenario: Botão que abre em novo separador

- **WHEN** um botão tem `openInNewTab` ligado
- **THEN** a âncora abre num novo separador com `rel` adequado
