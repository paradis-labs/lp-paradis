import {
  Chart,
  Cpu,
  Filters,
  Laptop,
  Palette2,
  ServerPath,
  Smartphone,
} from "@solar-icons/react";
import type React from "react";
import Reveal from "@/components/Reveal";
import type { Homepage } from "@/content";
import type { Locale } from "@/i18n/routing";
import SectionHeading from "../SectionHeading";

const BADGE: Record<Locale, string> = {
  en: "Our Services",
  pt: "Serviços",
};

type ServiceLayoutSpacer = { transparent: true; className: string };

type ServiceLayoutCard = {
  // Merge key — the service `slug` that `@/content` delivers, the same for
  // both providers (the `en-US` slug on the hcms).
  slug: string;
  Icon: React.ElementType;
  className: string;
  // Shown only when the CMS has no service with this slug — in the route's
  // locale, so a missing service never brings English into `/pt`.
  fallback: Record<Locale, { name: string; description: string }>;
};

type ServiceLayoutCell = ServiceLayoutSpacer | ServiceLayoutCard;

// The grid layout (positions + spacers + icons) lives in code, keyed by slug.
// The CMS only provides the content (title / shortDescription), merged by slug.
const SERVICE_LAYOUT: ServiceLayoutCell[] = [
  {
    transparent: true,
    className:
      "hidden md:block md:col-span-3 md:row-span-3 md:col-start-1 md:row-start-1",
  }, // 6
  {
    transparent: true,
    className: "hidden md:block md:col-span-6 md:col-start-4 md:row-start-1",
  }, // 8
  {
    transparent: true,
    className:
      "hidden md:block md:col-span-3 md:row-span-3 md:col-start-10 md:row-start-1",
  }, // 5
  {
    slug: "ui-ux-design",
    Icon: Palette2,
    fallback: {
      en: {
        name: "UI/UX Design",
        description:
          "Designing intuitive and engaging digital experiences that users love.",
      },
      pt: {
        name: "Design UI/UX",
        description:
          "Desenhamos experiências digitais intuitivas e envolventes, que os utilizadores adoram.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-2",
  },
  {
    slug: "brand-identity",
    Icon: Filters,
    fallback: {
      en: {
        name: "Brand Identity",
        description:
          "Building memorable visual identities that elevate your brand presence.",
      },
      pt: {
        name: "Identidade de marca",
        description:
          "Criamos identidades visuais memoráveis que reforçam a presença da sua marca.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-7 md:row-start-2",
  },
  {
    slug: "mobile-development",
    Icon: Smartphone,
    fallback: {
      en: {
        name: "Mobile Development",
        description:
          "Creating fast, scalable, and user-focused mobile applications.",
      },
      pt: {
        name: "Desenvolvimento mobile",
        description:
          "Criamos aplicações móveis rápidas, escaláveis e centradas no utilizador.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-2 md:row-start-4",
  },
  {
    slug: "web-development",
    Icon: Laptop,
    fallback: {
      en: {
        name: "Web Development",
        description:
          "Developing modern websites and web platforms built for performance.",
      },
      pt: {
        name: "Desenvolvimento web",
        description:
          "Desenvolvemos sites e plataformas web modernas, pensadas para o desempenho.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-4 md:row-span-2 md:col-start-5 md:row-start-4",
  },
  {
    slug: "api-integrations",
    Icon: ServerPath,
    fallback: {
      en: {
        name: "API & Integrations",
        description:
          "Connecting systems and services to streamline digital operations.",
      },
      pt: {
        name: "APIs e integrações",
        description:
          "Ligamos sistemas e serviços para simplificar as operações digitais.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-9 md:row-start-4",
  },
  {
    transparent: true,
    className:
      "hidden md:block md:col-span-3 md:row-span-4 md:col-start-1 md:row-start-6",
  }, // 23
  {
    slug: "ai-solutions",
    Icon: Cpu,
    fallback: {
      en: {
        name: "AI Solutions",
        description:
          "AI-powered solutions that automate and enhance digital experiences.",
      },
      pt: {
        name: "Soluções de IA",
        description:
          "Soluções com inteligência artificial que automatizam e melhoram experiências digitais.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-6",
  },
  {
    slug: "product-strategy",
    Icon: Chart,
    fallback: {
      en: {
        name: "Product Strategy",
        description:
          "Strategic guidance for smarter digital growth and innovation.",
      },
      pt: {
        name: "Estratégia de produto",
        description:
          "Orientação estratégica para um crescimento digital e uma inovação mais inteligentes.",
      },
    },
    className:
      "min-h-[120px] md:min-h-0 md:col-span-3 md:row-span-2 md:col-start-7 md:row-start-6",
  },
  {
    transparent: true,
    className:
      "hidden md:block md:col-span-3 md:row-span-4 md:col-start-10 md:row-start-6",
  }, // 24
  {
    transparent: true,
    className:
      "hidden md:block md:col-span-6 md:row-span-2 md:col-start-4 md:row-start-8",
  }, // 22
];

export default function ServicesSection({
  services,
  locale,
}: {
  services: Homepage["services"];
  locale: Locale;
}) {
  // Merge by slug: pull editable content from the CMS, falling back to the
  // hardcoded copy when a slot has no matching service.
  const servicesBySlug = new Map(
    services.items.map((s) => [s.slug, s] as const),
  );

  // O stagger do v3 é por cartão, e só os cartões revelam: as células vazias
  // são moldura e ficam paradas.
  let cardIndex = 0;

  return (
    <div className="flex w-full flex-col justify-start gap-8">
      <div className="px-5 md:px-10 xl:px-14">
        <SectionHeading
          badge={BADGE[locale]}
          title={services.ourServicesCT.title}
          subtitle={services.ourServicesCT.description}
        />
      </div>
      {/*
        Sem `grid-rows`: as linhas são todas implícitas, dimensionadas por
        `auto-rows`. Havia aqui um `md:grid-rows-[repeat(20px)]` que não é CSS
        válido — `repeat()` exige contagem e trilha — e portanto não produzia
        efeito nenhum, apesar de parecer intencional.

        O contentor é o elemento observado (`data-rv-group`) e os cartões
        animam por baixo dele: estão dentro do `clip-path` do painel, e
        observá-los um a um é o deadlock que `scroll-reveal-animations` proíbe.
      */}
      <Reveal
        group
        className="relative flex w-full flex-col gap-4 px-5 leading-5 md:grid md:auto-rows-[60px] md:grid-cols-12 md:px-0"
      >
        <div className="pointer-events-none absolute inset-0 z-20 hidden [background:radial-gradient(ellipse_65%_55%_at_center,transparent_55%,var(--color-primary)_92%)] md:block" />
        {SERVICE_LAYOUT.map((cell) => {
          if ("transparent" in cell) {
            return (
              <div
                key={cell.className}
                aria-hidden="true"
                className={`${cell.className} pointer-events-none rounded-xl border border-white/5 bg-white/4`}
              />
            );
          }
          const service = servicesBySlug.get(cell.slug);
          const fallback = cell.fallback[locale];
          const name = service?.title ?? fallback.name;
          const description = service?.shortDescription ?? fallback.description;
          const ItemIcon = cell.Icon;
          const delay = `${(cardIndex++ * 0.07).toFixed(2)}s`;
          return (
            <div
              key={cell.slug}
              data-rv-item
              style={{ "--rv-delay": delay } as React.CSSProperties}
              className={`${cell.className} flex flex-col justify-start gap-2.5 overflow-hidden rounded-xl border border-white/8 bg-linear-to-b from-white/10 to-white/2 p-4`}
            >
              {/*
                Sem `h-full`: a célula tem altura definida pelo grid e recorta
                o transbordo, então um irmão que reivindique 100% da altura faz
                os dois encolherem e espreme a descrição contra o recorte.
                O header ocupa a altura do próprio conteúdo; o resto é da
                descrição.
              */}
              <div className="flex w-full flex-row items-center justify-start gap-2.5 text-white">
                <span className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                  {ItemIcon && <ItemIcon size={16} color="#fff" />}
                </span>
                <h3 className="text-[15px] font-semibold">{name}</h3>
              </div>
              <p className="text-sm leading-[21px] text-white/64">
                {description}
              </p>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
