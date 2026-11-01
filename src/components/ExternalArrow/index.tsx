import { ArrowUpRight } from "@/components/Glyphs";
import { cn } from "@/lib/utils";

// A seta `↗` dos links externos, em SVG e não como caractere. O U+2197 não
// existe na Inter servida (`subsets: ["latin"]`) nem no "Inter Fallback", e o
// iOS resolve-o com a Apple Color Emoji: a seta saía como emoji. `1em` segue o
// `font-size` do contexto, e `.roll-arrow` dá o deslocamento no hover.
//
// Decoração: o nome acessível do link é o rótulo, sem sufixo vindo da seta.
export default function ExternalArrow({ className }: { className?: string }) {
  return (
    <span className={cn("roll-arrow", className)} aria-hidden="true">
      <ArrowUpRight />
    </span>
  );
}
