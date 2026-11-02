"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "loading" | "done";

// Uma navegação que nunca chega a mudar o pathname (abortada, erro de rede)
// não pode deixar a barra presa no topo para sempre.
const SAFETY_TIMEOUT_MS = 15_000;
const FADE_OUT_MS = 300;

// O destino de um clique, se ele for uma navegação para outra página do site.
//
// Só isto inicia a barra. Fica de fora o que não muda de rota no mesmo
// separador: links externos, `target="_blank"`, `download`, cliques com
// modificador (abrem noutro separador), `mailto:`/`tel:` (outro protocolo, logo
// outro origin) e âncoras na página corrente — o pathname não muda e a barra
// nunca teria fim.
function navigationTarget(event: MouseEvent): URL | null {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;

  return url;
}

// A barra fina acima do navbar enquanto uma navegação está pendente (#17).
//
// **Por que um listener delegado e não `useLinkStatus`.** O hook só funciona
// dentro de um `<Link>`, e uma barra global não é descendente de nenhum; a ponte
// exigiria trocar todos os `next/link` do site — incluindo os que chegam por
// `Button asChild` — por um wrapper. Um listener no `document` vê todos os
// cliques sem tocar em nenhum link. O custo aceite: `router.push` não inicia a
// barra, e o site não o usa para navegar entre páginas.
//
// O fim é a mudança de pathname, que é quando a nova rota fica activa.
export default function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      for (const id of timers.current) window.clearTimeout(id);
      timers.current = [];
    };

    const onClick = (event: MouseEvent) => {
      if (!navigationTarget(event)) return;
      clearTimers();
      setPhase("loading");
      timers.current.push(
        window.setTimeout(() => setPhase("done"), SAFETY_TIMEOUT_MS),
      );
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, []);

  // `pathname` é a dependência, não um valor lido: o efeito corre a cada troca
  // de rota, e é isso que fecha a barra.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ver acima
  useEffect(() => {
    setPhase((current) => (current === "loading" ? "done" : current));
  }, [pathname]);

  useEffect(() => {
    if (phase !== "done") return;
    const id = window.setTimeout(() => setPhase("idle"), FADE_OUT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-primary",
        // Movimento reduzido: a barra aparece inteira e só a opacidade muda —
        // o estado pendente continua visível, sem animação de largura.
        "motion-reduce:scale-x-100 motion-reduce:transition-opacity motion-reduce:duration-200",
        phase === "idle" && "opacity-0 motion-safe:scale-x-0",
        // Avança depressa e abranda à medida que se aproxima de 80%: não há
        // progresso real a medir, só a promessa de que algo está a acontecer.
        phase === "loading" &&
          "opacity-100 motion-safe:scale-x-[0.8] motion-safe:transition-transform motion-safe:duration-[8000ms] motion-safe:ease-out",
        phase === "done" &&
          "opacity-0 motion-safe:scale-x-100 motion-safe:transition-[transform,opacity] motion-safe:duration-300",
      )}
    />
  );
}
