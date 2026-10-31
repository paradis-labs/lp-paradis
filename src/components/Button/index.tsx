"use client";
import type { IconProps } from "@solar-icons/react/lib/types";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { Slot } from "radix-ui";
import type React from "react";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center flex-row gap-3 rounded-full text-nowrap cursor-pointer transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Todas as variantes de CTA têm contorno, mesmo quando ele é da cor do
        // fundo: `border` conta para dentro do box, e um contorno que só
        // existisse no hover encolheria a caixa de conteúdo a meio da
        // animação. A espessura vem do `size`, a cor vem daqui.
        primary: "border-primary bg-primary text-white hover:bg-primary/90",
        outline: "border-secondary bg-white text-primary hover:bg-secondary/40",
        // p/ fundos escuros (Footer, ProductsSection, menu mobile). O contorno
        // branco não se vê em repouso, porque o `bg-white` pinta por baixo
        // dele, e é ele que delimita o botão no hover, quando o painel escuro
        // sobe e fica da cor da secção.
        inverted:
          "border-white bg-white text-primary font-semibold hover:bg-white/90",
        "outline-inverted": "border-white/40 text-white hover:bg-white/40",
        // link-CTA (Card "Discover More"):
        link: "border-0 p-0 gap-2.5 rounded-none text-current hover:underline",
        // botão-ícone (hambúrguer):
        icon: "border-0 rounded-md text-neutral-600 hover:text-primary",
        // controlo de alternância (pills de interesse de `/get-quote`). O estado
        // vem de `aria-pressed`, não de uma prop: é o mesmo atributo que o leitor
        // de ecrã anuncia, e assim aparência e semântica não podem divergir.
        pill: "border-secondary text-base text-primary hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white",
      },
      // Os tamanhos do v3. A espessura do contorno é do tamanho e não da
      // variante (`button-hover-inversion`): 1,5px nos compactos, 2px nos CTAs
      // grandes do hero e do about. `data-disc` é o botão com `circleIcon`,
      // que encosta o disco à borda direita em vez de usar o padding normal.
      size: {
        sm: "min-h-10 border-[1.5px] px-[18px] text-sm font-medium data-disc:pr-[5px]",
        default:
          "min-h-12 border-2 px-6 py-1.5 text-base font-medium data-disc:pr-[7px]",
        lg: "min-h-13 border-[1.5px] px-[26px] py-2 text-base data-disc:pr-3",
        icon: "p-2",
        none: "border-[1.5px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

/**
 * Como cada camada do botão inverte quando o painel de preenchimento sobe.
 *
 * Os seis campos são obrigatórios de propósito, e a tabela é indexada pelas
 * variantes de `buttonVariants` (`Variant`, abaixo). Uma variante nova sem
 * entrada, ou uma entrada que esqueça uma camada, passa a falhar a compilação,
 * em vez de ficar com a cor fixa de repouso durante o hover — que é exactamente
 * o bug que esta tabela existe para corrigir: uma camada esquecida acaba da cor
 * daquilo que está atrás dela e desaparece.
 */
type SwapInvert = {
  /** Cor do rótulo em hover. Vai para o `<button>`. */
  text: string;
  /** O painel que sobe por trás do conteúdo. */
  fill: string;
  /** Disco do `circleIcon` e o glifo lá dentro, em repouso. */
  disc: string;
  /** Disco do `circleIcon` e o glifo lá dentro, em hover. */
  icon: string;
  /** Cor do contorno em hover. Vai para o `<button>`. */
  rim: string;
  /**
   * Ajuste do anel de `shine` enquanto o painel sobe. String vazia é uma
   * declaração válida — e a única forma de dizer "esta variante não precisa" —,
   * mas tem de ser escrita.
   */
  shine: string;
};

// Com `Record<string, …>` a promessa acima era falsa: uma chave em falta
// compilava e dava `undefined` em runtime, sem `noUncheckedIndexedAccess` a
// avisar. Indexar pelas variantes reais é o que a torna verdade (#18).
type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const SHINE_PALETTE = ["#5B8DEF", "#9B5BEF", "#EF5B8D", "#5BD1EF", "#5B8DEF"];

// O tom do cursor sobre o botão: claro sobre os botões escuros, escuro sobre os
// claros. Lido pelo `Cursor` por `data-cursor-tone`.
const CURSOR_TONE: Record<Variant, "light" | "dark"> = {
  primary: "light",
  outline: "dark",
  inverted: "dark",
  "outline-inverted": "light",
  link: "dark",
  icon: "dark",
  pill: "dark",
};

type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  trailingIcon?: React.ComponentType<IconProps>;
  iconProps?: IconProps;
  circleIcon?: boolean;
  textSwap?: boolean;
  shine?: boolean;
};

type ButtonElementProps =
  | (React.ComponentProps<"button"> & {
      asChild?: boolean;
      href?: never;
      openInNewTab?: never;
    })
  | (Omit<React.ComponentProps<"a">, "href"> & {
      asChild?: never;
      href: string;
      openInNewTab?: boolean;
    });

type ButtonProps = ButtonOwnProps & ButtonElementProps;

export default function Button(props: ButtonProps) {
  const {
    className,
    variant,
    size,
    trailingIcon,
    iconProps,
    circleIcon,
    asChild = false,
    textSwap = false,
    shine = false,
    href,
    openInNewTab = false,
    children,
    ...rest
  } = props;

  // `href` sem `asChild` é o caminho de âncora COM camadas. A união em
  // `ButtonElementProps` já impede os dois juntos; o `!asChild` aqui é o que
  // faz o `Comp` abaixo ser exaustivo sem depender dessa garantia de tipos.
  const isAnchor = !asChild && href !== undefined;

  // `href` NÃO entra nesta conta, de propósito: o caminho de âncora mantém o
  // efeito. Só `asChild` o perde, e perde-o por o `Slot` aceitar um filho
  // único — ver o comentário em `ButtonElementProps`.
  const swap = textSwap && !asChild;

  // O anel é excluído do `asChild` pela MESMA razão mecânica, e não por
  // estética: o `Slot` entrega `children` cru e não tem onde receber uma
  // camada irmã. O caminho `href` fica dentro, como as camadas de inversão.
  const hasShine = shine && !asChild;

  // O disco só pode trocar de cor ao mesmo ritmo do painel: se saltasse à
  // entrada do cursor, ficava da cor do painel sobre um botão ainda por cobrir
  // durante os 500ms da subida — o mesmo defeito ao contrário.
  const toLight = "group-hover:bg-white group-hover:text-primary";
  const toDark = "group-hover:bg-primary group-hover:text-white";

  // Escurecimento do anel enquanto um painel CLARO sobe. Contra `#ffffff` só o
  // ciano da paleta falha (1.78:1); isto leva-o a 3.33:1 sem apagar os outros.
  //
  // Duas razões para os valores serem estes e não outros:
  //
  //   • `brightness(.7)` é o mínimo que passa o pior matiz dos 3:1. Mais
  //     escuro rouba contraste ao caso simétrico — o anel também tem de se ver
  //     contra o preenchimento de repouso enquanto o painel ainda não cobriu.
  //   • `saturate(1.4)` acompanha porque escurecer sozinho aproxima as quatro
  //     matizes umas das outras, e o que se perde é a leitura de gradiente.
  //
  // A duração e a curva são as do painel, pela razão que o disco acima já
  // documenta: um ajuste mais rápido que a subida deixaria o anel escuro sobre
  // um botão ainda escuro a meio caminho.
  //
  // E o repouso declara o filtro IDENTIDADE em vez de o omitir. Isto não é
  // redundante: `filter: none → brightness(.7)` não interpola, salta — e o
  // salto lê-se como um pisco no primeiro frame do hover.
  const shineDim =
    "brightness-100 saturate-100 transition-[filter] duration-500 ease-fill group-hover:brightness-[0.7] group-hover:saturate-[1.4]";

  const swapInvert: Record<Variant, SwapInvert> = {
    primary: {
      text: "hover:text-primary!",
      fill: "bg-white",
      disc: "bg-white text-primary",
      icon: toDark,
      rim: "",
      // Painel claro: o anel precisa de escurecer.
      shine: shineDim,
    },
    outline: {
      text: "hover:text-white!",
      fill: "bg-primary",
      disc: "bg-primary text-white",
      icon: toLight,
      // Igual ao `fill` de propósito: atrás do contorno está a página clara,
      // não o preenchimento, e é a fronteira preenchimento/página que carrega
      // a silhueta. Um aro mais claro aqui leria como halo.
      rim: "hover:border-primary!",
      // Painel escuro: as quatro matizes já passam 3,78:1 contra `#212528`.
      // Vazio é a declaração de "não precisa", e está escrita de propósito —
      // omiti-la faria a variante falhar a compilação, que é o ponto.
      shine: "",
    },
    inverted: {
      text: "hover:text-white!",
      fill: "bg-primary",
      disc: "bg-primary text-white",
      icon: toLight,
      // A `ProductsSection` e o footer correm dentro de `bg-primary`, ou seja
      // o painel de hover fica da cor da secção. Quem mantém a silhueta é o
      // contorno branco de repouso, que não muda — por isso nada a declarar.
      rim: "",
      // Painel escuro, como `outline`.
      shine: "",
    },
    "outline-inverted": {
      text: "hover:text-primary!",
      fill: "bg-white",
      disc: "bg-white text-primary",
      icon: toDark,
      rim: "hover:border-white!",
      // Painel claro, como `primary`.
      shine: shineDim,
    },
    pill: {
      text: "hover:text-white!",
      // Escuro como o estado seleccionado: o hover antecipa o que o clique faz.
      // Numa pill já seleccionada o painel sobe sobre a mesma cor e não se vê,
      // que é o certo — o rótulo continua a rolar.
      fill: "bg-primary",
      disc: "bg-primary text-white",
      icon: toLight,
      rim: "hover:border-primary!",
      // Painel escuro, como `outline`.
      shine: "",
    },
    // `link` e `icon` não usam `textSwap` hoje. As entradas existem porque a
    // tabela é exaustiva: vazias, o painel fica transparente e só o rótulo
    // rola — sem inversão, porque não há fundo para inverter contra.
    link: { text: "", fill: "", disc: "", icon: "", rim: "", shine: "" },
    icon: { text: "", fill: "", disc: "", icon: "", rim: "", shine: "" },
  };
  const invert = swap ? swapInvert[variant ?? "primary"] : undefined;

  // Um destino interno (`/en/get-quote`) navega pelo `Link`, com prefetch e
  // roteamento de cliente; o resto (`#ancora`, `mailto:`, URL absoluta, o
  // Calendly) é uma âncora nua. Antes, um CTA interno com animação obrigava a
  // escolher entre `asChild` + `Link` (sem camadas) e `href` (sem `Link`) — foi
  // por isso que a navbar ficou com o `asChild`. Os dois renderizam `<a>`, por
  // isso o resto do componente não distingue.
  const Comp: React.ElementType = asChild
    ? Slot.Root
    : isAnchor
      ? href.startsWith("/")
        ? Link
        : "a"
      : "button";

  const anchorProps: Record<string, unknown> = isAnchor
    ? {
        href,
        target: openInNewTab ? "_blank" : undefined,
        // `noopener` impede a página de destino de alcançar o nosso `window`.
        rel: openInNewTab ? "noopener noreferrer" : undefined,
      }
    : {};

  const IconComponent = trailingIcon ?? null;
  const disc = Boolean(IconComponent && circleIcon);

  // O rótulo rola uma altura de linha: a cópia de cima sai, a de baixo entra
  // com a cor de hover. 0,8s numa curva mais longa que a do painel, como no v3
  // — o painel chega primeiro e o texto assenta por cima dele.
  const label = swap ? (
    <span className="relative inline-grid overflow-hidden">
      <span className="col-start-1 row-start-1 block transition-transform duration-800 ease-roll group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="col-start-1 row-start-1 block translate-y-full transition-transform duration-800 ease-roll group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  ) : (
    children
  );

  // O disco do v3: dois glifos empilhados que rolam na vertical, ao ritmo do
  // rótulo, enquanto a cor do disco acompanha o painel. Fora do caminho
  // `swap` é o disco estático de sempre.
  const icon = IconComponent ? (
    disc && invert ? (
      <span
        className={cn(
          "icon relative inline-flex size-7.5 shrink-0 overflow-hidden rounded-full transition-colors duration-500 ease-fill",
          invert.disc,
          invert.icon,
        )}
      >
        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-800 ease-roll group-hover:-translate-y-full">
          <IconComponent size={18} {...iconProps} />
        </span>
        <span
          aria-hidden
          className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-800 ease-roll group-hover:translate-y-0"
        >
          <IconComponent size={18} {...iconProps} />
        </span>
      </span>
    ) : (
      <span
        className={cn(
          "icon inline-flex items-center justify-center",
          // Sem disco o glifo já inverte sozinho, por herdar `currentColor`
          // do botão — não leva regra de cor própria.
          disc && "rounded-full bg-primary p-1 text-white",
        )}
      >
        <IconComponent {...iconProps} />
      </span>
    )
  ) : null;

  return (
    <Comp
      data-cursor="button"
      data-cursor-tone={CURSOR_TONE[variant ?? "primary"]}
      data-disc={disc && swap ? "" : undefined}
      className={cn(
        buttonVariants({ variant, size }),
        // O painel de preenchimento e o anel são os dois `absolute inset-0`:
        // ambos precisam que a caixa do botão seja o contexto de
        // posicionamento, e nenhum deles o tem de graça.
        (swap || hasShine) && "relative",
        // O `overflow-hidden` é só do painel, e fica de propósito fora da
        // conta do anel: o anel vive no limite exacto do clip, e recortá-lo
        // afina-o nas curvas da pill. O caminho `shine` sem `swap` — que é o
        // do submit de `/get-quote` — não paga esse recorte.
        swap && "group overflow-hidden isolate duration-500 ease-fill",
        invert?.text,
        invert?.rim,
        className,
      )}
      {...(rest as Record<string, unknown>)}
      {...anchorProps}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* O painel do v3: começa abaixo do botão com os cantos de cima em
              arco e sobe até o cobrir, perdendo o arco pelo caminho. O
              invólucro recorta-o pela forma do botão (`rounded-[inherit]`);
              é o `<span>` de dentro que se move. */}
          {invert && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <span
                className={cn(
                  "block size-full translate-y-[101%] rounded-t-[50%] transition-[transform,border-radius] duration-500 ease-fill group-hover:translate-y-0 group-hover:rounded-none",
                  invert.fill,
                )}
              />
            </span>
          )}
          {/* A ORDEM destes três irmãos é o empilhamento, e é por isso que
              nenhum deles leva `z-index` próprio:

                painel  absolute, z auto  ─┐ mesmo nível, decide o DOM
                anel    absolute, z auto  ─┘ → anel acima do painel
                rótulo  relative, z-10      → acima dos dois

              O painel é `inset-0` e, em `primary`, é branco: por baixo dele o
              anel desaparecia no hover, exactamente quando o botão está a ser
              olhado. Acima do rótulo pintaria gradiente sobre os glifos. */}
          {/* `invert?.shine` é `undefined` fora do caminho `swap`, e isso é
              correcto por construção: o ajuste existe por causa do painel, e
              sem `swap` não há painel para ajustar contra. */}
          {hasShine && (
            <ShineBorder
              borderWidth={2}
              shineColor={SHINE_PALETTE}
              className={invert?.shine}
            />
          )}
          {swap || hasShine ? (
            <span className="relative z-10 inline-flex items-center gap-3">
              {label}
              {icon}
            </span>
          ) : (
            <>
              {label}
              {icon}
            </>
          )}
        </>
      )}
    </Comp>
  );
}

export { buttonVariants };
