"use client";

import { useEffect, useRef } from "react";

type Mode = "" | "link" | "button" | "text";

// Quanto o círculo anda na direcção do ponteiro em cada frame. O valor do v3.
const LERP = 0.2;

// O cursor do v3: um círculo que segue o ponteiro com atraso e muda de estado
// conforme o que está por baixo — ponto, anel sobre links, disco sobre botões,
// disco grande com texto sobre `[data-cursor-text]` (as capas dos produtos).
//
// Sem estado de React. Tudo o que muda — posição, modo, tom, texto — vai
// directo para o DOM, e o CSS (`.cursor-dot` em `globals.css`) faz as
// transições. Um `setState` por evento de rato renderizava o componente a cada
// mudança de alvo, para mudar dois atributos.
//
// O loop de frames só existe enquanto o círculo não chegou ao ponteiro: parado
// o rato, o último frame não se reagenda e a página fica sem rAF nenhum
// (`idle-runtime-budget`). O `mousemove` só guarda coordenadas; o trabalho é
// feito no frame, uma vez (`scroll-frame-budget`).
//
// O tom vem de `data-cursor-tone` no ancestral mais próximo: os botões
// declaram o seu, e o painel escuro, o footer e o menu mobile declaram `light`.
// Sem `mix-blend-difference`, que obrigava a compor a página inteira em cada
// frame.
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let frame = 0;
    let shown = false;

    const tick = () => {
      x += (targetX - x) * LERP;
      y += (targetY - y) * LERP;
      dot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const moving = Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1;
      frame = moving ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!shown) {
        // A primeira posição salta, em vez de deslizar desde o canto.
        x = targetX;
        y = targetY;
        shown = true;
        dot.setAttribute("data-on", "");
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // `mouseover` só dispara ao atravessar a fronteira de um elemento, por
    // isso o `closest()` corre ao mudar de alvo e não a cada pixel.
    const onOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const textHost = target.closest<HTMLElement>("[data-cursor-text]");
      const mode: Mode = textHost
        ? "text"
        : target.closest('[data-cursor="button"], button')
          ? "button"
          : target.closest("a")
            ? "link"
            : "";
      const tone =
        target.closest<HTMLElement>("[data-cursor-tone]")?.dataset.cursorTone ??
        "dark";

      dot.dataset.mode = mode;
      dot.dataset.tone = tone;
      label.textContent = textHost?.dataset.cursorText ?? "";
    };

    const onLeave = () => {
      shown = false;
      dot.removeAttribute("data-on");
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={dotRef} aria-hidden="true" className="cursor-dot">
      <span ref={labelRef} className="cursor-dot-label" />
    </div>
  );
}
