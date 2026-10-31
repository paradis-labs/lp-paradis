"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface NavActiveContextValue {
  activeHash: string | null;
}

const NavActiveContext = createContext<NavActiveContextValue>({
  activeHash: null,
});

export function useNavActive() {
  return useContext(NavActiveContext);
}

// Se um link do navbar é o corrente. Duas regras, e a primeira ganha:
//
//   • um link de secção (`/#services`) é corrente quando a secção está a meio
//     da viewport;
//   • um link de página (`/products`, `/`) é corrente quando o pathname é
//     exactamente o seu destino — e nenhuma secção está activa. Sem a segunda
//     condição, na home "Home" e "Services" ficavam correntes ao mesmo tempo.
//
// Correspondência exacta e não por prefixo: com prefixo, `/en` (Home) seria
// corrente em todas as páginas.
export function isNavLinkActive(
  link: { href: string; hash?: string },
  activeHash: string | null,
  pathname: string,
) {
  if (link.hash) return link.hash === activeHash;
  return !activeHash && link.href === pathname;
}

export function useIsNavLinkActive(href: string, hash?: string) {
  const { activeHash } = useNavActive();
  const pathname = usePathname();
  return isNavLinkActive({ href, hash }, activeHash, pathname);
}

interface NavActiveProviderProps {
  ids: string[];
  children: ReactNode;
}

export function NavActiveProvider({ ids, children }: NavActiveProviderProps) {
  const [activeHash, setActiveHash] = useState<string | null>(null);

  // Evita recriar o observer a cada render por causa de um novo array de ids.
  const idsKey = ids.join(",");

  // O pathname entra nas dependências: numa navegação de cliente o layout fica,
  // a página troca, e as secções observadas deixam de ser as do DOM.
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: `pathname` não é lido no efeito, é o gatilho para voltar a ligar os observers à página nova
  useEffect(() => {
    const sectionIds = idsKey ? idsKey.split(",") : [];
    if (sectionIds.length === 0) return;

    // Mantém a razão de interseção de cada seção e marca como ativa a mais visível.
    const ratios = new Map<string, number>();
    const observed = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }

        if (best) {
          setActiveHash(best);
          return;
        }
        // Nenhuma secção na faixa. Entre duas secções mantém-se a anterior,
        // para o link não piscar no intervalo; acima da primeira não há secção
        // corrente, e o link de página ("Home") volta a sê-lo.
        const first = document.getElementById(sectionIds[0]);
        if (first && first.getBoundingClientRect().top > window.innerHeight / 2)
          setActiveHash(null);
      },
      {
        // Seção fica ativa ao cruzar a faixa central da viewport.
        rootMargin: "-45% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    // A página chega por streaming e pode hidratar depois do header: no
    // arranque deste efeito as secções podem ainda não estar no DOM. Observa-se
    // o que já existe e, enquanto faltar alguma, vigia-se o DOM até ela chegar.
    // Antes procurava-se uma vez só, e quando o header ganhava a corrida não se
    // observava nada — o link corrente nunca mudava.
    const attach = () => {
      for (const id of sectionIds) {
        if (observed.has(id)) continue;
        const element = document.getElementById(id);
        if (!element) continue;
        observer.observe(element);
        observed.add(id);
      }
      return observed.size === sectionIds.length;
    };

    let mutations: MutationObserver | null = null;
    if (!attach()) {
      mutations = new MutationObserver(() => {
        if (attach()) mutations?.disconnect();
      });
      mutations.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      mutations?.disconnect();
    };
  }, [idsKey, pathname]);

  const value = useMemo(() => ({ activeHash }), [activeHash]);

  return (
    <NavActiveContext.Provider value={value}>
      {children}
    </NavActiveContext.Provider>
  );
}
