import type React from "react";

// Os links da barra, ao centro. Só a partir de `lg`: abaixo disso vivem no menu
// mobile, numerados.
export default function NavBarItemsList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ul className="hidden h-10 list-none items-center gap-1 p-0 lg:flex">
      {children}
    </ul>
  );
}
