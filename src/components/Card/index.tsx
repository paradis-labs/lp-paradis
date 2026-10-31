import Image from "next/image";
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
    /** Anunciado só a leitores de ecrã, já localizado por quem chama. */
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

// O cartão de produto da home v3, sobre o painel escuro: capa com o chip de
// seta, o nome em maiúsculas, a descrição grande e o link "Discover More".
// Server component; o cursor lê `data-cursor-text` sozinho. Sem zoom na capa:
// no v3 da home ela não reage ao hover (o zoom é dos cartões de `/products`).
export default function Card({
  className,
  title,
  description,
  image,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  anchor,
  cursorText,
}: CardProps) {
  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <div
        data-cursor-text={cursorText}
        className="relative flex h-70 w-full items-center justify-center overflow-hidden rounded-[14px] border border-white/8 bg-white/4"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            height={image.height || 374}
            width={image.width || 254}
            sizes={sizes}
            className="size-full object-cover"
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
      </div>
      <div className="flex w-full flex-col gap-3.5 px-1">
        <div className="flex flex-col gap-2">
          <h3 className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-white/64 uppercase">
            {title}
          </h3>
          <p className="text-[22px] leading-[30px] font-medium text-pretty">
            {description}
          </p>
        </div>
        {/* `<a>` e não `next/link`: o destino é o site do projecto, fora deste,
            e o prefetch e o roteamento de cliente do `Link` não se aplicam a
            uma URL absoluta. Abre sempre noutra aba — o visitante não perde a
            página (#22). `noopener` impede o destino de alcançar o nosso
            `window` por `window.opener`. */}
        <a
          href={anchor.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 self-start font-medium text-white"
        >
          <RollText>{anchor.label}</RollText>
          <span className="sr-only"> {anchor.newTabHint}</span>
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
        </a>
      </div>
    </div>
  );
}
