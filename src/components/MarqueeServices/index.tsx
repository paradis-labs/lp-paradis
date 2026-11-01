import { Bulb } from "@/components/Glyphs";
import type { Service } from "@/content";
import MarqueePause from "./MarqueePause";

// A lâmpada em contorno e a preenchida, empilhadas na mesma célula: a troca é
// por `opacity`, no mesmo ritmo da cor do texto, e a caixa nunca muda de
// tamanho. É o traço do canvas (`Glyphs`), server-renderable como o resto.
function Lightbulb() {
  return (
    <span aria-hidden="true" className="grid">
      <Bulb
        size={22}
        className="[grid-area:1/1] transition-opacity duration-300 group-hover/item:opacity-0"
      />
      <Bulb
        size={22}
        filled
        className="[grid-area:1/1] opacity-0 transition-opacity duration-300 group-hover/item:opacity-100"
      />
    </span>
  );
}

// O marquee de serviços do v3: uma faixa CSS contínua de 45 s que pausa no
// hover (`.marquee-track` em `globals.css`), com fade nas pontas. Cada serviço
// fica em destaque sob o ponteiro (cor plena e lâmpada preenchida); o `hover:`
// do Tailwind só existe com `@media (hover: hover)`, e um toque não o prende.
//
// A lista vai duas vezes porque a faixa anda metade da sua largura: é o que faz
// o fim de um ciclo coincidir com o início do seguinte. A segunda cópia é
// `aria-hidden` — um leitor de ecrã lê os serviços uma vez.
//
// Fora da viewport e com a aba oculta, o `MarqueePause` põe `data-paused` no
// contentor (`idle-runtime-budget`). A velocidade ligada ao scroll do
// `ScrollVelocityRow` não passou para o v3.
export default function MarqueeServices({
  services,
  label,
}: {
  services: Service[];
  /** O nome acessível da faixa ("Services"), já localizado. */
  label: string;
}) {
  const copies = [0, 1] as const;

  return (
    <MarqueePause
      label={label}
      style={{ "--enter-delay": "0.7s" } as React.CSSProperties}
      className="marquee w-full overflow-hidden border-b py-6 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="marquee-track flex w-max items-center">
        {copies.map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex list-none items-center p-0"
          >
            {services.map((service) => (
              <li
                key={service.key}
                className="group/item flex items-center gap-3.5 pr-10 text-primary/60 transition-colors duration-300 hover:text-primary"
              >
                <Lightbulb />
                <span className="text-lg font-medium tracking-[0.02em] whitespace-nowrap">
                  {service.title.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </MarqueePause>
  );
}
