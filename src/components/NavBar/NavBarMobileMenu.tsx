"use client";

import { useLenis } from "lenis/react";
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import type { FooterSocialLink } from "@/content";
import type { Locale } from "@/i18n/routing";
import Button from "../Button";
import RollText from "../RollText";
import LocaleSwitch from "./LocaleSwitch";
import { isNavLinkActive, useNavActive } from "./NavActiveContext";

export interface MobileMenuLink {
  key: string;
  label: string;
  href: string;
  hash?: string;
  openInNewTab: boolean;
}

export interface MobileMenuButton {
  key: string;
  label: string;
  /** `null` quando o CMS não tem destino: o botão é renderizado inerte. */
  href: string | null;
  variant: "primary" | "outline";
  openInNewTab: boolean;
}

const COPY: Record<
  Locale,
  { open: string; close: string; navigation: string; cta: string }
> = {
  en: {
    open: "Open menu",
    close: "Close menu",
    navigation: "NAVIGATION",
    cta: "Ready to build?",
  },
  pt: {
    open: "Abrir menu",
    close: "Fechar menu",
    navigation: "NAVEGAÇÃO",
    cta: "Pronto para construir?",
  },
};

// Só os ícones que o mockup mostra. O conjunto é fechado em código pela razão
// que o `Footer` documenta: um mapa sobre um namespace impede o tree-shaking.
// Plataforma sem ícone cai no nome visível.
const SOCIAL_ICONS: Partial<Record<FooterSocialLink["platform"], LucideIcon>> =
  {
    linkedin: Linkedin,
    instagram: Instagram,
  };

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NavBarMobileMenuProps {
  links: MobileMenuLink[];
  buttons: MobileMenuButton[];
  socialLinks: FooterSocialLink[];
  locale: Locale;
}

// O menu mobile do v3: um painel escuro preso à barra, com os links numerados
// e, abaixo de `md`, os CTAs, o switch de idioma e as redes — que nesse
// tamanho saem da barra.
//
// Vive DENTRO da `<nav>`, e não num portal, de propósito: o foco fica contido
// "no painel e na barra" (`mobile-navigation-menu`), e é a `<nav>` inteira o
// âmbito da contenção. O portal existia para escapar do containing block que o
// `backdrop-filter` cria para descendentes `fixed`; o painel do v3 é
// `absolute`, posicionado em relação à barra, e esse containing block é
// precisamente o que se quer.
export default function NavBarMobileMenu({
  links,
  buttons,
  socialLinks,
  locale,
}: NavBarMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const { activeHash } = useNavActive();
  const pathname = usePathname();
  const copy = COPY[locale];

  const close = useCallback(() => setIsOpen(false), []);

  // Scroll do fundo travado enquanto está aberto. O Lenis conduz o scroll por
  // conta própria e não respeita `overflow: hidden`, por isso para também.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      root.style.overflow = "";
      lenis?.start();
    };
  }, [isOpen, lenis]);

  // Escape fecha e devolve o foco ao botão; Tab circula dentro da `<nav>`. O
  // listener só existe com o menu aberto.
  useEffect(() => {
    if (!isOpen) return;
    const nav = toggleRef.current?.closest("nav");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !nav) return;
      const focusable = [
        ...nav.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // A partir de `lg` o menu não existe: um painel aberto ao rodar o tablet
  // ficaria preso por cima da barra desktop.
  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setIsOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [isOpen]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label={isOpen ? copy.close : copy.open}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex size-11 cursor-pointer items-center justify-center justify-self-end rounded-full border-[1.5px] border-border bg-white text-primary lg:hidden"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path
            d={isOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          data-lenis-prevent
          data-cursor-tone="light"
          className="absolute top-[calc(100%+8px)] right-2 left-2 flex h-[calc(100dvh-108px)] min-h-140 flex-col justify-between gap-8 overflow-x-hidden overflow-y-auto rounded-[20px] bg-primary px-6 pt-7 pb-6 text-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)] lg:hidden"
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full mask-[radial-gradient(ellipse_90%_60%_at_100%_0%,black,transparent)]"
          >
            <defs>
              <pattern
                id="menu-grid"
                width="90"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M.5 30V.5H90"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#menu-grid)" />
          </svg>

          <div className="relative flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-[0.1em] text-white/50">
              {copy.navigation}
            </span>
            <ul className="flex list-none flex-col p-0">
              {links.map((link, index) => {
                const active = isNavLinkActive(link, activeHash, pathname);
                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      onClick={close}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={
                        link.openInNewTab ? "noopener noreferrer" : undefined
                      }
                      aria-current={active ? "page" : undefined}
                      className={twJoin(
                        "flex min-h-15 items-center gap-4 border-b border-white/8",
                        active ? "text-white" : "text-white/72",
                      )}
                    >
                      <span className="w-6 text-xs font-medium text-white/40 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-gilroy text-[28px] leading-[1.1] font-medium tracking-[-0.02em]">
                        <RollText>{link.label}</RollText>
                      </span>
                      <span
                        aria-hidden="true"
                        className={twJoin(
                          "inline-flex size-8 items-center justify-center rounded-full",
                          active
                            ? "bg-white text-primary"
                            : "bg-white/8 text-white/70",
                        )}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Abaixo de `md` os CTAs, o switch e as redes saem da barra e vivem
              aqui. Entre `md` e `lg` continuam na barra, e este bloco some. */}
          <div className="relative flex flex-col gap-4 md:hidden">
            <span className="font-gilroy text-[22px] font-medium">
              {copy.cta}
            </span>
            {buttons.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {buttons.map((button) =>
                  button.href ? (
                    <Button
                      key={button.key}
                      href={button.href}
                      openInNewTab={button.openInNewTab}
                      onClick={close}
                      variant={
                        button.variant === "outline"
                          ? "outline-inverted"
                          : "inverted"
                      }
                      size="lg"
                      textSwap
                      className="w-full"
                    >
                      {button.label}
                    </Button>
                  ) : (
                    <Button
                      key={button.key}
                      variant={
                        button.variant === "outline"
                          ? "outline-inverted"
                          : "inverted"
                      }
                      size="lg"
                      className="w-full"
                    >
                      {button.label}
                    </Button>
                  ),
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <LocaleSwitch
                locale={locale}
                className="min-h-11 border-white/25 bg-transparent pr-4 pl-3 text-white hover:bg-white/10"
              />
              {socialLinks.length > 0 && (
                <ul className="flex list-none gap-2 p-0 text-white/80">
                  {socialLinks.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform];
                    return (
                      <li key={social.key}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="inline-flex size-11 items-center justify-center rounded-full border border-white/16"
                        >
                          {Icon ? (
                            <Icon aria-hidden="true" className="size-4.5" />
                          ) : (
                            <span aria-hidden="true" className="text-xs">
                              {social.label.slice(0, 2)}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
