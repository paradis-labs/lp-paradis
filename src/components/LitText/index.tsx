import { Fragment } from "react";
import { cn } from "@/lib/utils";

// Texto que acende letra a letra com o scroll (`.lit` em `globals.css`).
// Partido no servidor: cada palavra num `nowrap`, para as linhas quebrarem só
// entre palavras, e cada letra com o seu índice em `--i`. As letras são
// `aria-hidden` e a frase vai uma vez em `sr-only`, para um leitor de ecrã
// não a ler letra a letra.
//
// `tone` é a cor final: `#151718` sobre branco, branco sobre o painel escuro.
export default function LitText({
  text,
  tone = "light",
  className,
}: {
  text: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word]);
  const offsets = words.map((_, position) =>
    words.slice(0, position).reduce((n, chars) => n + chars.length, 0),
  );
  const total = words.reduce((n, chars) => n + chars.length, 0);

  return (
    <span
      className={cn(
        "lit",
        tone === "dark" ? "text-white" : "text-foreground",
        className,
      )}
      style={{ "--n": total } as React.CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((chars, position) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a frase é fixa e as palavras podem repetir-se
          <Fragment key={position}>
            {position > 0 ? " " : null}
            <span className="whitespace-nowrap">
              {chars.map((char, k) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: idem, por letra
                  key={k}
                  className="lit-c"
                  style={
                    { "--i": offsets[position] + k } as React.CSSProperties
                  }
                >
                  {char}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
