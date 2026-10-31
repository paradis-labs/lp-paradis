import { ArrowRight } from "@solar-icons/react";
import Reveal from "@/components/Reveal";
import type { Homepage } from "@/content";
import type { Locale } from "@/i18n/routing";
import CalendlyCta from "../CalendlyCta";
import Card from "../Card";
import SectionHeading from "../SectionHeading";

// Só para leitores de ecrã: o link de cada projecto abre noutra aba, e quem não
// vê o ícone tem de o ouvir antes de clicar.
const NEW_TAB_HINT: Record<Locale, string> = {
  en: "(opens in a new tab)",
  pt: "(abre num novo separador)",
};

const BADGE: Record<Locale, string> = {
  en: "Our Products",
  pt: "Produtos",
};

// O piso do link do card, quando o projecto não traz rótulo do CMS (o hcms
// nunca traz).
const LINK_LABEL: Record<Locale, string> = {
  en: "Discover More",
  pt: "Saber mais",
};

// O texto do cursor sobre a capa.
const CURSOR_TEXT: Record<Locale, string> = {
  en: "Discover",
  pt: "Ver",
};

export default function ProductsSection({
  projects,
  ctaHref,
  locale,
}: {
  projects: Homepage["projects"];
  locale: Locale;
  // Destino do CTA, já resolvido pelo servidor — prefixo de locale aplicado ao
  // que é interno, `undefined` quando não há destino authorado. Sem destino o
  // "View All" não renderiza: um botão inerte numa secção que lista produtos
  // promete uma página que não existe.
  ctaHref?: string;
}) {
  const items = projects.items;

  return (
    <div className="flex w-full flex-col justify-start gap-12 px-5 md:px-10 xl:px-14">
      <SectionHeading
        badge={BADGE[locale]}
        title={projects.title}
        subtitle={projects.subtitle}
      >
        {ctaHref && projects.primaryCta.label ? (
          <CalendlyCta
            variant="inverted"
            href={ctaHref}
            trailingIcon={ArrowRight}
            circleIcon
            textSwap
            className="border-[1.5px] pl-8 font-semibold"
          >
            {projects.primaryCta.label}
          </CalendlyCta>
        ) : null}
      </SectionHeading>
      <Reveal
        group
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {items.map((project, index) => (
          <div
            key={project.key}
            data-rv-item
            style={
              {
                "--rv-delay": `${(index * 0.12).toFixed(2)}s`,
              } as React.CSSProperties
            }
          >
            <Card
              className="text-white"
              title={project.title}
              description={project.description}
              image={
                project.coverImage
                  ? {
                      src: project.coverImage.url,
                      alt: project.coverImage.alt ?? project.title,
                      width: project.coverImage.width ?? undefined,
                      height: project.coverImage.height ?? undefined,
                    }
                  : null
              }
              anchor={{
                label: project.linkLabel ?? LINK_LABEL[locale],
                href: project.url,
                newTabHint: NEW_TAB_HINT[locale],
              }}
              cursorText={CURSOR_TEXT[locale]}
            />
          </div>
        ))}
      </Reveal>
    </div>
  );
}
