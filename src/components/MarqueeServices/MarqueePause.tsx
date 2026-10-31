"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

// O contentor do marquee, que pausa a faixa fora da viewport e com a aba
// oculta (`data-paused`, lido por `.marquee` em `globals.css`). Uma animação de
// CSS fora do ecrã continua a ser composta, e `idle-runtime-budget` pede que
// seja desassinada, não ignorada.
//
// O estado é do React pela razão que o `Reveal` documenta: mexer no atributo de
// fora, antes de a página hidratar, divergia do HTML do servidor.
export default function MarqueePause({
  label,
  className,
  style,
  children,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    let inView = true;
    const sync = () =>
      setPaused(!inView || document.visibilityState === "hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <section
      ref={ref}
      aria-label={label}
      data-paused={paused ? "" : undefined}
      data-enter
      style={style}
      className={className}
    >
      {children}
    </section>
  );
}
