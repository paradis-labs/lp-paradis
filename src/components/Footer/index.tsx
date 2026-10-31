import { ArrowRightDown } from "@solar-icons/react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import Reveal from "@/components/Reveal";
import type { Footer as FooterContent, FooterSocialLink } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedCtaHref } from "@/lib/locale-href";
import { SOCIAL_ICONS } from "@/lib/social-platforms";
import CalendlyCta from "../CalendlyCta";
import RollText from "../RollText";

type SocialLink = FooterSocialLink;

// O gutter lateral dos três blocos do footer, num só sítio (#21). Cresce até ao
// `px-14` das secções da home a partir de `lg`; abaixo disso os 56px deixariam
// ~200px de conteúdo num ecrã de 320px. Em `xl` cai para zero: o `max-width` do
// `container` (1280px) já afasta o conteúdo das margens.
const FOOTER_GUTTER = "px-6 sm:px-10 lg:px-14 xl:px-0";

// Os literais que antes estavam soltos no JSX. Eles não desaparecem — viram o
// piso de cada campo, porque a leitura do CMS inverte o risco: antes o texto
// era garantido por estar em código, agora um campo vazio no banco o
// substituiria por nada. Um botão sem rótulo é regressão pior que um botão em
// inglês numa página em português. `cta.heading` está `null` em produção hoje,
// então este piso é exercitado no primeiro render, não é precaução teórica.
//
// Um piso por idioma, e não um piso só em inglês: o tipo obriga a escrever os
// dois, e um campo vazio em `/pt` cai em português. As cópias `pt` seguem o
// texto que os editores puseram no hcms.
const FALLBACK_LOGO_URL = "/logo-white.svg";

const FALLBACK: Record<
  Locale,
  {
    logoAlt: string;
    tagline: string;
    ctaHeading: string;
    primaryLabel: string;
    outlineLabel: string;
    copyright: string;
  }
> = {
  en: {
    logoAlt: "Paradis Logo",
    tagline: "Because we were born into this world",
    ctaHeading: "Ready to build?",
    primaryLabel: "Get Quote - For Free",
    outlineLabel: "Schedule a Call",
    copyright: "Paradis.Labs - All rights reserved.",
  },
  pt: {
    logoAlt: "Logótipo da Paradis",
    tagline: "Porque nascemos para isto",
    ctaHeading: "Pronto para construir?",
    primaryLabel: "Pedir orçamento - Grátis",
    outlineLabel: "Agendar uma chamada",
    copyright: "Paradis Labs - Todos os direitos reservados.",
  },
};

// O ano do copyright é composto em runtime (`footer-content-authority`), mas a
// página é pré-renderizada, e um `new Date()` solto é um valor instável que o
// `cacheComponents` recusa. Fica num escopo cacheado que se revalida todos os
// dias: o ano acompanha a virada no máximo um dia depois, sem JavaScript.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

// `?? fallback` não basta: o Payload grava string vazia quando um campo de texto
// é limpo no admin, e `"" ?? x` devolve `""`. Só-espaços também conta como
// vazio; o valor original é devolvido intacto quando há conteúdo.
function textOr(value: string | null | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

// Toda rota pública é prefixada por locale, então um `href` relativo precisa do
// prefixo para não tirar o usuário do idioma corrente. O que não começa com `/`
// — `#ancora`, `mailto:`, URL absoluta — sai intacto: prefixar qualquer um
// deles quebraria o destino.
function isRoutedHref(href: string): boolean {
  return href.startsWith("/");
}

// O prefixo é montado à mão, e isso é deliberado — a alternativa idiomática
// custa caro. Tanto o `Link` quanto o `getPathname` de `@/i18n/navigation`
// arrastam o runtime de cliente do next-intl (o parser ICU do `@formatjs`,
// reconhecível por `clonePosition`/`bumpSpace`) para o bundle: **+33,6 KB** num
// único chunk, 34.259 → 67.909 bytes, medido com build limpo nas duas pontas.
// Os dois importam do mesmo módulo, então dão exatamente o mesmo custo —
// 3.623.131 bytes com qualquer um dos dois, contra 3.589.441 sem nenhum.
//
// O preço de evitá-los é este acoplamento: a linha abaixo replica o
// `localePrefix: "always"` que é o default do next-intl e que `routing.ts` não
// sobrescreve. Se `routing.ts` passar a definir `localePrefix`, esta função
// precisa acompanhar — não há nada que force isso automaticamente.
//
// O hash cai naturalmente: `/#products`, que existe no conteúdo hoje, vira
// `/pt/#products`.
//
// **CONVERGÊNCIA PARCIAL, e onde está a fronteira.** Os dois botões do bloco
// `cta` já usam `localizedCtaHref` de `@/lib/locale-href`, importado no topo
// deste ficheiro — a migração que a nota de dívida em `lib/locale-href.ts`
// previa começou por eles, porque `add-calendly-popup-cta` tinha de lhes tocar
// de qualquer forma. Esta cópia local sobrevive apenas para o `FooterHref`, que
// serve os `linkGroups` e precisa também de `isRoutedHref` e do ramo `external`.
//
// Ou seja: há agora DUAS regras de prefixo neste ficheiro, e elas são iguais. Se
// divergirem, os links das colunas e os botões do CTA passam a resolver locale
// de formas diferentes, sem erro de tipo e sem aviso do build. Quem terminar a
// migração apaga esta função e passa o `FooterHref` a usar a de `lib/`.
function localizedHref(href: string, locale: Locale): string {
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

// Um destino do footer, escolhendo o elemento pelo tipo de `href`. Externo
// nunca recebe prefixo de locale; interno relativo sempre recebe.
function FooterHref({
  href,
  external,
  locale,
  className,
  children,
  ...rest
}: {
  href: string;
  external?: boolean;
  locale: Locale;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<"a">) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (isRoutedHref(href)) {
    return (
      <Link href={localizedHref(href, locale)} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

// Um ícone social. O `label` authorado é o nome acessível — os três ícones não
// têm texto na tela, e um `<svg>` sozinho numa âncora não produz nome nenhum.
// Plataforma sem ícone mapeado degrada para o rótulo visível em vez de
// desaparecer: um link authorado que simplesmente não renderiza, sem erro e sem
// pista, é o pior modo de falha possível aqui.
function SocialIconLink({ social }: { social: SocialLink }) {
  const Icon = SOCIAL_ICONS[social.platform];

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/16 text-white/80 transition-colors duration-200 hover:border-white/50 hover:text-white"
    >
      {Icon ? (
        <Icon aria-hidden="true" className="size-4.5" />
      ) : (
        <span className="text-xs font-normal">{social.label}</span>
      )}
    </a>
  );
}

// O `locale` vem por prop, do layout, que já o resolveu para buscar este mesmo
// global. `getLocale()` de `next-intl/server` faria o mesmo sem tocar o call
// site, mas seria um segundo import de next-intl aqui — e é justamente o que a
// nota em `localizedHref` explica que sai caro.
//
// `ctaBand` é a única variação por rota (`route-scoped-footer`): `/get-quote`
// passa `false`, porque a página já é o destino do "Ready to build?". O
// contacto direto e as redes, que esta rota tinha numa faixa própria, vivem
// agora no aside da página (`quote-contact-aside`).
export default function Footer({
  locale,
  ctaBand = true,
  ...args
}: FooterContent & {
  locale: Locale;
  ctaBand?: boolean;
}) {
  const cta = args.cta;
  const socialLinks = args.socialLinks;
  const fallback = FALLBACK[locale];

  return (
    <footer
      data-cursor-tone="light"
      className="relative flex w-full flex-col items-center overflow-hidden bg-primary text-white"
    >
      {/* A grelha mascarada no topo e o halo do canto, do v3. Decoração: ficam
          por baixo de tudo e não recebem eventos. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 size-full mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      >
        <defs>
          <pattern
            id="footer-grid"
            width="90"
            height="30"
            patternUnits="userSpaceOnUse"
            x="-1"
            y="-1"
          >
            <path
              d="M.5 30V.5H90"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-grid)" />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-60 -right-30 z-0 size-160 rounded-full bg-[radial-gradient(circle,rgba(110,121,126,0.35),rgba(33,37,40,0)_65%)]"
      />

      {/* A faixa "Ready to build?" abre o footer no v3. */}
      {ctaBand && (
        <div
          className={`relative z-10 container ${FOOTER_GUTTER} border-b border-white/12 pt-22 pb-14`}
        >
          <Reveal className="flex flex-col items-start justify-between gap-10 md:flex-row md:flex-wrap md:items-end">
            <h2 className="gradient-text-inverse max-w-160 font-gilroy text-4xl leading-[1.05] font-bold tracking-[-0.035em] md:text-[44px] lg:text-5xl">
              {textOr(cta?.heading, fallback.ctaHeading)}
            </h2>
            {/* `CalendlyCta` é um leaf de CLIENTE, e é o que permite ao destino
              do Calendly abrir popup em vez de navegar sem este ficheiro
              ganhar `"use client"` — os 33,6 KB que o comentário de
              `localizedHref` acima mediu continuam de fora.

              O prefixo de locale é aplicado AQUI, no servidor: o leaf não
              importa nada de `@/i18n`, é essa a condição de ele ser barato.

              `localizedCtaHref` devolve `undefined` para `""` e para `#`, e
              nesse caso o `Button` renderiza `<button>` inerte em vez de uma
              âncora que salta para o topo. */}
            <div className="flex w-full flex-wrap gap-3 md:w-auto md:shrink-0">
              <CalendlyCta
                className="flex-[1_1_100%] font-semibold md:flex-auto"
                variant="inverted"
                size="lg"
                href={localizedCtaHref(cta?.primaryButton?.href, locale)}
                trailingIcon={ArrowRightDown}
                circleIcon
                textSwap
              >
                {textOr(cta?.primaryButton?.label, fallback.primaryLabel)}
              </CalendlyCta>
              <CalendlyCta
                className="flex-[1_1_100%] border-2 px-7.5 md:flex-auto"
                variant="outline-inverted"
                size="lg"
                href={localizedCtaHref(cta?.outlineButton?.href, locale)}
                textSwap
              >
                {textOr(cta?.outlineButton?.label, fallback.outlineLabel)}
              </CalendlyCta>
            </div>
          </Reveal>
        </div>
      )}

      <div
        className={`relative z-10 container ${FOOTER_GUTTER} flex flex-col gap-12 pt-14 pb-10`}
      >
        <div className="flex flex-col gap-2.5">
          <Image
            src={args.logo?.url ?? FALLBACK_LOGO_URL}
            alt={args.logo?.alt ?? fallback.logoAlt}
            width={163}
            height={31}
            className="h-[31px] w-auto object-contain object-left"
          />
          <span className="text-[13px] text-white/70">
            {textOr(args.tagline, fallback.tagline)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {args.linkGroups.map((group) => (
            <div className="flex flex-col gap-3.5" key={group.key}>
              <span className="text-[13px] font-semibold tracking-[0.06em] text-white/56 uppercase">
                {group.title}
              </span>
              <ul className="flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[22px]">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <FooterHref
                      href={link.href}
                      external={link.isExternal}
                      locale={locale}
                      className="inline-flex items-center gap-1.5 text-white"
                    >
                      <RollText>{link.name}</RollText>
                      {link.isExternal && (
                        // Decoração: o nome acessível do link é o rótulo
                        // authorado, sem sufixo vindo da seta.
                        <span className="roll-arrow" aria-hidden="true">
                          ↗
                        </span>
                      )}
                    </FooterHref>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center border-t border-white/12">
        {/* Empilha em telas estreitas: o copyright e três ícones não cabem na
            mesma linha em ~390px. */}
        <div
          className={`container ${FOOTER_GUTTER} flex flex-col gap-4 py-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between`}
        >
          <span className="text-sm text-white/70">
            &copy; <CopyrightYear />{" "}
            {textOr(args.copyrightText, fallback.copyright)}
          </span>
          {socialLinks.length > 0 && (
            <ul className="flex list-none flex-row items-center gap-2 p-0">
              {socialLinks.map((social) => (
                <li key={social.key}>
                  <SocialIconLink social={social} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
