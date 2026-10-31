import { cn } from "@/lib/utils";

// O ícone de quatro quadrados das pills de secção do v3. Inline e não da
// `@solar-icons`: o `Widget6` de lá tem os quatro cantos iguais, e o do mockup
// tem um deles redondo.
function TilesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="4" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

// A pill que abre cada secção e cada cabeçalho de página no v3. `tone` segue o
// fundo onde ela vive: `dark` para o painel escuro da home, `light` para os
// cabeçalhos de página sobre branco.
export default function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 self-start rounded-full border py-1 pr-3.5 pl-2.5 text-sm leading-[22px] font-medium",
        tone === "dark"
          ? "border-secondary/30 bg-secondary/8 text-secondary"
          : "border-border bg-white text-primary",
        className,
      )}
    >
      <TilesIcon />
      {children}
    </div>
  );
}
