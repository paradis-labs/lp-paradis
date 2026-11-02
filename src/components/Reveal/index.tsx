"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

// Um só observer para todos os blocos da página. Disparo único e sem margem
// negativa (`scroll-reveal-animations`): o mockup usa `rootMargin: -8%` e
// `threshold: 0.12`, e não são replicados — com disparo único, uma zona morta
// nas bordas seria permanente.
let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observe(element: Element, onEnter: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0 },
  );
  callbacks.set(element, onEnter);
  observer.observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}

type State = "idle" | "out" | "in";

interface RevealProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  as?: "div" | "aside" | "section";
  /**
   * O bloco é o contentor de uma grelha: é ele que é observado, e os
   * `[data-rv-item]` lá dentro animam com o atraso de `--rv-delay`. É o caso das
   * grelhas do painel escuro — os cartões vivem dentro de um `clip-path`, e
   * observá-los um a um é o deadlock que `scroll-reveal-animations` proíbe.
   */
  group?: boolean;
  /** Entra por escala em vez de deslocamento (o vídeo dos serviços). */
  grow?: boolean;
  /** Repassado ao elemento: o painel do aside declara o tom do cursor. */
  "data-cursor-tone"?: "light" | "dark";
  /** Repassado como `data-cursor-text` (o texto do cursor sobre o bloco). */
  cursorText?: string;
}

// A revelação ao scroll do v3, uma vez por bloco. As regras visuais estão em
// `globals.css` (bloco "Motion v3"); aqui só se decide o estado.
//
// O estado é do React e muda só no efeito deste componente, ou seja depois de
// ele estar hidratado. A primeira versão escrevia classes e atributos no DOM a
// partir de um componente do layout, e a página — que hidrata depois, por
// streaming — chegava ao React com atributos que o servidor não tinha: aviso de
// hidratação, e um re-render podia apagar a marca e voltar a esconder o bloco.
//
// Três estados, e a ordem evita o flash que `text-visibility-guarantees`
// proíbe:
//
//   idle  o HTML do servidor. Visível: sem JavaScript, com o bundle bloqueado
//         ou com a hidratação morta, nada sai daqui.
//   out   oculto, à espera de entrar. Só os blocos que estão ABAIXO da dobra no
//         arranque passam por aqui — esses ninguém os viu.
//   in    revelado, para sempre. Um bloco que já está no ecrã no arranque vai
//         directo para aqui, sem animar.
export default function Reveal({
  children,
  className,
  style,
  id,
  as: Tag = "div",
  group = false,
  grow = false,
  "data-cursor-tone": cursorTone,
  cursorText,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("idle");
  const revealed = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || revealed.current) return;
    if (typeof IntersectionObserver === "undefined") return;

    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      revealed.current = true;
      setState("in");
      return;
    }

    setState("out");
    return observe(element, () => {
      revealed.current = true;
      setState("in");
    });
  }, []);

  const stateAttribute = group
    ? { "data-rv-group": state }
    : { "data-rv": state };

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={style}
      data-rv-grow={grow ? "" : undefined}
      data-cursor-tone={cursorTone}
      data-cursor-text={cursorText}
      {...stateAttribute}
    >
      {children}
    </Tag>
  );
}
