## ADDED Requirements

### Requirement: Cartões de características por baixo da solução
Os itens de `steps` do projecto SHALL renderizar como cartões de características, numa grelha de três colunas (uma abaixo de 1024px). Cada cartão SHALL ter, numa linha, o ícone (traço de 18px, num quadrado de 36px) e o título (17/24, 600), como no mockup, e por baixo o texto (15/24, branco a 64%). Os cartões SHALL NOT ter número.

O ícone SHALL vir de `steps[].icon`, de uma lista fechada mapeada em código para SVG inline: `swap`, `trend`, `shield`, `calculator`, `globe` e `clock`. Um valor fora da lista, ou vazio, SHALL mostrar o cartão sem ícone.

O hover SHALL manter o do v3: fundo `white/7` e contorno `white/16` em 0,4s.

#### Scenario: Kitenda
- **WHEN** o Kitenda tem três características com `swap`, `trend` e `shield`
- **THEN** a página mostra três cartões com esses ícones e os títulos "Both directions", "Up-to-date exchange rate" e "Free and safe"

#### Scenario: Ícone desconhecido
- **WHEN** um item tem `icon: "rocket"`
- **THEN** o cartão renderiza com o título e o texto, sem ícone, e a página não falha

### Requirement: Título do detalhe por breakpoint
O título do detalhe de produto SHALL medir 88px a partir de 1024px, 56px entre 768px e 1023px e 40px abaixo de 768px.

#### Scenario: Tablet
- **WHEN** `/en/products/kitenda` é vista a 900px
- **THEN** o H1 mede 56px
