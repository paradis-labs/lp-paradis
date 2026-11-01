"use client";

import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/Glyphs";
import type { Media } from "@/content";
import type { Locale } from "@/i18n/routing";

const COPY: Record<
  Locale,
  {
    cursor: string;
    close: string;
    previous: string;
    next: string;
    image: (n: number, total: number) => string;
  }
> = {
  en: {
    cursor: "View",
    close: "Close",
    previous: "Previous image",
    next: "Next image",
    image: (n, total) => `Image ${n} of ${total}`,
  },
  pt: {
    cursor: "Ver",
    close: "Fechar",
    previous: "Imagem anterior",
    next: "Imagem seguinte",
    image: (n, total) => `Imagem ${n} de ${total}`,
  },
};

const CONTROL =
  "flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// A galeria do detalhe do produto e o seu lightbox. A grelha continua a vir
// prerenderizada; é ilha de cliente porque o `Dialog` precisa dos botões que o
// abrem para devolver o foco (`product-gallery-lightbox`).
//
// O estado é um índice: `null` fechado, `n` a imagem visível. Ao fechar, o foco
// volta à imagem VISÍVEL e não à que abriu — quem navegou até à terceira e
// carrega Esc fica na terceira da grelha.
//
// O Radix bloqueia o scroll nativo, mas o Lenis ouve a roda por conta própria e
// rolava a página por trás do overlay: é parado enquanto o diálogo está aberto.
export default function GalleryLightbox({
  shots,
  title,
  locale,
}: {
  shots: Media[];
  title: string;
  locale: Locale;
}) {
  const copy = COPY[locale];
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  // O índice visível no momento do fecho: quando o `onCloseAutoFocus` corre, o
  // estado já é `null`.
  const lastIndex = useRef(0);
  const lenis = useLenis();
  const total = shots.length;
  const open = index !== null;

  useEffect(() => {
    if (index !== null) lastIndex.current = index;
  }, [index]);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + total) % total));

  const shot = index !== null ? shots[index] : undefined;

  return (
    <>
      {shots.map((item, i) => (
        <button
          key={item.url}
          ref={(node) => {
            triggers.current[i] = node;
          }}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={item.alt || copy.image(i + 1, total)}
          data-cursor-text={copy.cursor}
          className={
            i === 0
              ? "group relative h-65 cursor-pointer overflow-hidden rounded-2xl border bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:col-span-2 md:h-180"
              : "group relative h-65 cursor-pointer overflow-hidden rounded-2xl border bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-115"
          }
        >
          <Image
            src={item.url}
            alt=""
            fill
            sizes={
              i === 0
                ? "(min-width: 1280px) 1280px, 100vw"
                : "(min-width: 768px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-600 ease-[ease] group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        </button>
      ))}

      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) setIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100 bg-[#0c0d0e]/94 duration-250 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
          <Dialog.Content
            aria-describedby={undefined}
            data-cursor-tone="light"
            onKeyDown={(event) => {
              if (total < 2) return;
              if (event.key === "ArrowRight") step(1);
              else if (event.key === "ArrowLeft") step(-1);
            }}
            onCloseAutoFocus={(event) => {
              const trigger = triggers.current[lastIndex.current];
              if (!trigger) return;
              event.preventDefault();
              trigger.focus();
            }}
            className="fixed inset-0 z-100 flex flex-col outline-none duration-250 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.96] motion-reduce:animate-none"
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>

            {/* O palco: um clique fora da imagem (no próprio palco) fecha. A
                imagem é dimensionada pelas proporções dela, por isso a área à
                volta é palco e não letterbox da imagem. */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: atalho de rato; o teclado fecha com Esc e com o botão fechar. */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: idem. */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-4 pt-20 pb-4 md:px-24 md:pb-8"
              onClick={(event) => {
                if (event.target === event.currentTarget) setIndex(null);
              }}
            >
              {shot ? (
                <Image
                  key={shot.url}
                  src={shot.url}
                  alt={shot.alt ?? ""}
                  width={shot.width ?? 1600}
                  height={shot.height ?? 1000}
                  sizes="100vw"
                  className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain duration-250 animate-in fade-in-0 motion-reduce:animate-none"
                />
              ) : null}
            </div>

            <Dialog.Close
              aria-label={copy.close}
              className={`${CONTROL} absolute top-4 right-4 md:top-6 md:right-6`}
            >
              <X size={22} aria-hidden="true" />
            </Dialog.Close>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  aria-label={copy.previous}
                  onClick={() => step(-1)}
                  className={`${CONTROL} absolute top-1/2 left-4 -translate-y-1/2 md:left-6`}
                >
                  <ArrowRight size={22} className="rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label={copy.next}
                  onClick={() => step(1)}
                  className={`${CONTROL} absolute top-1/2 right-4 -translate-y-1/2 md:right-6`}
                >
                  <ArrowRight size={22} />
                </button>
                <p
                  aria-live="polite"
                  className="pb-6 text-center text-sm font-medium text-white/72 tabular-nums"
                >
                  {(index ?? 0) + 1} / {total}
                </p>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
