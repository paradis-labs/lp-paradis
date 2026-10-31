import { cn } from "@/lib/utils";

// O rótulo que rola no hover do link ou botão que o contém (`.roll` em
// `globals.css`). Duas cópias na mesma célula de grid: a de cima sai, a de
// baixo entra. A segunda é `aria-hidden`, para o nome acessível do link ser o
// rótulo uma vez só.
//
// `hoverClassName` pinta só a cópia que entra — é o caso dos links da navbar,
// que escurecem ao rolar.
export default function RollText({
  children,
  className,
  hoverClassName,
}: {
  children: React.ReactNode;
  className?: string;
  hoverClassName?: string;
}) {
  return (
    <span className={cn("roll", className)}>
      <span>{children}</span>
      <span aria-hidden="true" className={hoverClassName}>
        {children}
      </span>
    </span>
  );
}
