import type { Service } from "@/content";
import MarqueePause from "./MarqueePause";

// A lâmpada do mockup, inline: o marquee é server component, e um ícone da
// `@solar-icons` seria uma fronteira de cliente só para desenhar um traço.
function Lightbulb() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

// O marquee de serviços do v3: uma faixa CSS contínua de 45 s que pausa no
// hover (`.marquee-track` em `globals.css`), com fade nas pontas.
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
      <div className="marquee-track flex w-max items-center text-primary/60">
        {copies.map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex list-none items-center p-0"
          >
            {services.map((service) => (
              <li key={service.key} className="flex items-center gap-3.5 pr-10">
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
