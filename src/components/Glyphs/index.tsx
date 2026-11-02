"use client";

import { cn } from "@/lib/utils";

// Os glifos de traço que o canvas do v3 desenha, no lugar dos da Solar: as
// três setas dos botões e cartões, e a lâmpada do marquee. Os traços e as
// espessuras são os dos artboards (2px nas setas, 1,5px na lâmpada).
//
// Encaixam no `trailingIcon` do `Button` como os da Solar: aceitam `size`
// (por omissão `1em`, o mesmo da Solar) e `className`. Decoração: o nome
// acessível é sempre o rótulo do botão ou do link.
//
// `"use client"` pela mesma razão que a Solar o tem: as páginas (server)
// passam o componente ao `Button` (client) como prop, e só uma referência de
// cliente atravessa essa fronteira. Continuam a ser renderizados no servidor.
interface GlyphProps {
  size?: number | string;
  className?: string;
}

function Glyph({
  d,
  size = "1em",
  className,
  strokeWidth = 2,
  filled = false,
}: GlyphProps & { d: string; strokeWidth?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d={d} />
    </svg>
  );
}

/** A seta do disco dos botões (Hero, "Get Quote", footer, envio do formulário). */
export function ArrowDownRight(props: GlyphProps) {
  return <Glyph d="M7 7l10 10M17 9v8H9" {...props} />;
}

/** A seta dos destinos externos ("Visit", `↗`). */
export function ArrowUpRight(props: GlyphProps) {
  return <Glyph d="M7 17L17 7M9 7h8v8" {...props} />;
}

/** A seta de avançar ("View All", "View product"). */
export function ArrowRight(props: GlyphProps) {
  return <Glyph d="M4 12h16M14 6l6 6-6 6" {...props} />;
}

const BULB =
  "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z";

/** A lâmpada do marquee; `filled` é o estado de hover. */
export function Bulb({
  filled = false,
  ...props
}: GlyphProps & { filled?: boolean }) {
  return <Glyph d={BULB} strokeWidth={1.5} filled={filled} {...props} />;
}
