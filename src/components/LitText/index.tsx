import { Fragment } from "react";
import { cn } from "@/lib/utils";

type Segment = { text: string; className?: string };

// Texto que acende letra a letra (`.lit` em `globals.css`). Partido no
// servidor: cada palavra num `nowrap`, para as linhas quebrarem só entre
// palavras, e cada letra com o seu índice em `--i`. As letras são
// `aria-hidden` e a frase vai uma vez em `sr-only`, para um leitor de ecrã
// não a ler letra a letra.
//
// `mode` diz o que acende as letras: `scroll` liga-as ao scroll do bloco;
// `enter` acende-as uma vez ao carregar, a partir de `delay` e ao longo de
// `span` segundos, para os blocos acima da dobra, que com `scroll` abririam
// meio cinzentos.
//
// `text` pode vir em segmentos, cada um com a sua classe (o lead bicolor do
// `PageHeader`): o índice continua de um segmento para o seguinte, por isso
// acendem como uma só frase.
//
// `tone` é a cor final: `#151718` sobre branco, branco sobre o painel escuro,
// ou `inherit` para ficar com a cor do pai (os subtítulos em muted).
//
// Não serve dentro de `gradient-text`: o `background-clip: text` ignora a
// opacidade das letras, e o efeito não se vê.
export default function LitText({
  text,
  tone = "light",
  mode = "scroll",
  delay = 0,
  span = 1,
  className,
}: {
  text: string | Segment[];
  tone?: "light" | "dark" | "inherit";
  mode?: "scroll" | "enter";
  delay?: number;
  span?: number;
  className?: string;
}) {
  const segments = (typeof text === "string" ? [{ text }] : text).map(
    (segment) => ({
      className: segment.className,
      words: segment.text
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => [...word]),
    }),
  );
  let total = 0;
  const offsets = segments.map(({ words }) =>
    words.map((chars) => {
      const offset = total;
      total += chars.length;
      return offset;
    }),
  );
  const sentence = segments
    .flatMap(({ words }) => words.map((chars) => chars.join("")))
    .join(" ");

  return (
    <span
      className={cn(
        "lit",
        tone === "dark" && "text-white",
        tone === "light" && "text-foreground",
        className,
      )}
      data-mode={mode}
      style={
        {
          "--n": total,
          ...(mode === "enter"
            ? { "--lit-delay": `${delay}s`, "--lit-span": `${span}s` }
            : {}),
        } as React.CSSProperties
      }
    >
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
        {segments.map(({ words, className: segmentClass }, s) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: os segmentos são fixos
          <Fragment key={s}>
            {s > 0 ? " " : null}
            <span className={segmentClass}>
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
                          {
                            "--i": offsets[s][position] + k,
                          } as React.CSSProperties
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
