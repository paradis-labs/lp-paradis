import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import RollText from "../RollText";

export interface CardProps {
  className?: string;
  title: string;
  description: string;
  /** `null` quando o projecto não tem capa: a área mostra o título. */
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  // Matches the rendered width of the card so next/image serves a large enough
  // variant instead of upscaling a tiny one. Default mirrors the products grid.
  sizes?: string;
  anchor: {
    label: string;
    href: string;
    /** O site do projecto (noutra aba) em vez da página de detalhe. */
    external: boolean;
    /** Anunciado só a leitores de ecrã nos links externos, já localizado. */
    newTabHint: string;
  };
  /** O texto do cursor sobre a capa (`data-cursor-text`). */
  cursorText: string;
}

function ArrowUpRight({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

// O destino do cartão, partilhado pela capa e pelo "Discover More" para os
// dois nunca divergirem. Com slug, a página de detalhe deste site; sem slug, o
// site do projecto, sempre noutra aba (#22) e por `<a>`, porque o prefetch e o
// roteamento de cliente do `Link` não se aplicam a uma URL absoluta.
// `noopener` impede o destino de alcançar o nosso `window` por
// `window.opener`.
//
// `mouseOnly` é a capa: um segundo link para o mesmo destino, só para o rato.
// Fora da tabulação e da árvore de acessibilidade, para o teclado e o leitor
// de ecrã terem um link por cartão — o "Discover More", que tem nome.
function CardAnchor({
  anchor,
  className,
  mouseOnly = false,
  children,
  ...rest
}: {
  anchor: CardProps["anchor"];
  className?: string;
  mouseOnly?: boolean;
  children: ReactNode;
  "data-cursor-text"?: string;
}) {
  const hidden = mouseOnly
    ? { tabIndex: -1, "aria-hidden": true as const }
    : {};

  return anchor.external ? (
    <a
      href={anchor.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...hidden}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <Link href={anchor.href} className={className} {...hidden} {...rest}>
      {children}
    </Link>
  );
}

// O cartão de produto da home v3, sobre o painel escuro: capa com o chip de
// seta, o nome em maiúsculas, a descrição grande e o link "Discover More".
// Server component; o cursor lê `data-cursor-text` sozinho. Com o rato sobre
// a capa, a imagem cresce para 1,065 (o `.home-prod-img` do canvas).
const LINK_CLASS =
  "inline-flex items-center gap-2.5 self-start font-medium text-white";

export default function Card({
  className,
  title,
  description,
  image,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  anchor,
  cursorText,
}: CardProps) {
  const linkArrow = (
    <span className="roll-arrow" data-dir="x" aria-hidden="true">
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    </span>
  );

  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <CardAnchor
        anchor={anchor}
        mouseOnly
        data-cursor-text={cursorText}
        className="group/cover relative flex h-70 w-full items-center justify-center overflow-hidden rounded-[14px] border border-white/8 bg-cover-ground"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            height={image.height || 374}
            width={image.width || 254}
            sizes={sizes}
            className="size-full object-cover transition-transform duration-500 ease-[ease] group-hover/cover:scale-[1.065] motion-reduce:transition-none motion-reduce:group-hover/cover:scale-100"
          />
        ) : (
          // Sem capa, a área continua lá com o nome — uma imagem partida, ou
          // um buraco na grelha, são piores.
          <span
            aria-hidden="true"
            className="font-gilroy text-[40px] font-bold text-white/90"
          >
            {title}
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/92 text-primary"
        >
          <ArrowUpRight size={16} />
        </span>
      </CardAnchor>
      <div className="flex w-full flex-col gap-3.5 px-1">
        <div className="flex flex-col gap-2">
          <h3 className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-white/64 uppercase">
            {title}
          </h3>
          <p className="text-[22px] leading-[30px] font-medium text-pretty">
            {description}
          </p>
        </div>
        <CardAnchor anchor={anchor} className={LINK_CLASS}>
          <RollText>{anchor.label}</RollText>
          {anchor.external ? (
            <span className="sr-only"> {anchor.newTabHint}</span>
          ) : null}
          {linkArrow}
        </CardAnchor>
      </div>
    </div>
  );
}
