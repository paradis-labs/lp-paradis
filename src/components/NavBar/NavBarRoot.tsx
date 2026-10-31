import type React from "react";
import { twJoin } from "tailwind-merge";

interface NavBarRootProps {
  children: React.ReactNode;
  className?: string;
}

// A barra do v3: sticky e em glass em todas as posições de scroll.
//
// O glass era só do estado `scrolled`, com um listener de scroll a decidir, e
// a nota dizia porquê: no topo o fundo era opaco e o `backdrop-filter` não se
// via mas continuava a ser recalculado. No v3 o fundo é translúcido sempre
// (`white/55`), o blur vê-se sempre, e o listener deixa de ter razão de ser.
//
// 20px e não os 40px de antes (P2 da Motion spec do canvas). Se o orçamento de
// `scroll-frame-budget` falhar em mobile, o recurso é descer para 12px.
//
// A grelha tem três colunas a partir de `lg` (logo · links · ações), e por
// baixo encolhe com o que se vê: logo · ações · menu entre `md` e `lg`, logo ·
// menu abaixo de `md`. Os filhos escondidos em cada breakpoint não ocupam
// coluna, porque `hidden` os tira do fluxo da grelha.
export default function NavBarRoot({ children, className }: NavBarRootProps) {
  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-40 flex w-full justify-center bg-white/55 py-6 backdrop-blur-[20px] backdrop-saturate-[1.6]"
    >
      <div
        className={twJoin(
          "grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 md:grid-cols-[minmax(0,1fr)_auto_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
          className,
        )}
      >
        {children}
      </div>
    </nav>
  );
}
