import { ArrowRight } from "@solar-icons/react";
import type { Homepage } from "@/content";
import type { Locale } from "@/i18n/routing";
import CalendlyCta from "../CalendlyCta";
import Card from "../Card";
import SectionHeading from "../SectionHeading";
import { Reveal } from "../ui/reveal";

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

// O piso do link do card, quando o projecto não traz rótulo do CMS (o Payload
// nunca traz).
const LINK_LABEL: Record<Locale, string> = {
  en: "Discover More",
  pt: "Saber mais",
};

export default function ProductsSection({
  projects,
  ctaHref,
  locale,
}: {
  projects: Homepage["projects"];
  locale: Locale;
  // Destino do CTA, já resolvido pelo servidor — prefixo de locale aplicado ao
  // que é interno, `undefined` quando não há destino authorado. O componente
  // não recebe o locale, à imagem do `Hero`.
  ctaHref?: string;
}) {
  const items = projects.items;

  return (
    <div className="w-full h-full flex flex-col justify-start gap-14 px-14">
      <Reveal>
        <SectionHeading
          badge={BADGE[locale]}
          title={projects.title}
          subtitle={projects.subtitle}
        >
          <CalendlyCta
            variant="inverted"
            size="lg"
            href={ctaHref}
            trailingIcon={ArrowRight}
            iconProps={{
              size: 24,
            }}
            magnetic
            textSwap
          >
            <span>{projects.primaryCta.label}</span>
          </CalendlyCta>
        </SectionHeading>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {items.map((project, index) => (
          <Reveal
            key={project.key}
            delay={Math.min(index * 0.08, 0.4)}
            className="col-span-1 lg:col-span-4"
          >
            <Card
              className="text-white w-full"
              title={project.title}
              description={project.description}
              image={{
                src: project.coverImage?.url ?? "",
                alt: project.title,
              }}
              anchor={{
                label: project.linkLabel ?? LINK_LABEL[locale],
                href: project.url,
                newTabHint: NEW_TAB_HINT[locale],
              }}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
