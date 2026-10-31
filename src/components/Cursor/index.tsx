"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// O cursor só chega ao bundle de quem o vai ver (P2 da Motion spec do canvas):
// `ssr: false` tira-o do HTML e do chunk inicial, e o `import()` só corre
// quando o dispositivo tem rato e o visitante não pediu movimento reduzido.
// Num telefone o módulo nunca é pedido.
const Cursor = dynamic(() => import("./Cursor"), { ssr: false });

// As duas preferências são lidas num efeito e não no render: o servidor não as
// conhece, e lê-las no corpo da renderização divergia a hidratação — ver
// `@/lib/use-reduced-motion`. O primeiro render é sempre `null`, nos dois lados.
export default function CursorLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduce.matches);

    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return enabled ? <Cursor /> : null;
}
