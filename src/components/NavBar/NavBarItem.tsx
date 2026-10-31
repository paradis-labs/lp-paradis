"use client";

import Link from "next/link";
import type React from "react";
import { twJoin } from "tailwind-merge";
import RollText from "../RollText";
import { useIsNavLinkActive } from "./NavActiveContext";

interface NavBarItemProps {
  // O destino JÁ resolvido pelo `Header`: prefixo de locale aplicado ao que é
  // interno. O hash da secção vem à parte, calculado a partir do `url` CRU do
  // CMS antes do prefixo, para a relação com `activeHash` não depender da forma
  // do prefixo.
  href: string;
  hash?: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
}

// Um link da barra desktop. O rótulo rola no hover (`RollText`), e a cópia que
// entra já é da cor do link activo — o hover antecipa o estado.
export default function NavBarItem({
  href,
  hash,
  openInNewTab = false,
  children,
}: NavBarItemProps) {
  const isActive = useIsNavLinkActive(href, hash);

  return (
    <li className="flex h-10 items-center px-[18px]">
      <Link
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        aria-current={isActive ? "page" : undefined}
        className={twJoin(
          "text-[15px] leading-5",
          isActive ? "font-semibold text-foreground" : "text-stone",
        )}
      >
        <RollText className="h-5" hoverClassName="text-foreground">
          {children}
        </RollText>
      </Link>
    </li>
  );
}
