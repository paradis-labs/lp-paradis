import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/Glyphs";
import type { ProductIcon, ProductPage } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";
import Button from "../Button";
import ExternalArrow from "../ExternalArrow";
import Eyebrow from "../Eyebrow";
import GalleryLightbox from "../GalleryLightbox";
import LitText from "../LitText";
import NextProductCard from "../NextProductCard";
import PageHeader from "../PageHeader";
import Reveal from "../Reveal";
import RollText from "../RollText";

const COPY: Record<
  Locale,
  {
    breadcrumb: string;
    visit: (title: string) => string;
    category: string;
    market: string;
    platform: string;
    liveAt: string;
    challenge: string;
    solution: string;
    next: string;
    viewAll: string;
  }
> = {
  en: {
    breadcrumb: "Our Products",
    visit: (title) => `Visit ${title}`,
    category: "Category",
    market: "Market",
    platform: "Platform",
    liveAt: "Live at",
    challenge: "The Challenge",
    solution: "The Solution",
    next: "Next product",
    viewAll: "View all products",
  },
  pt: {
    breadcrumb: "Produtos",
    visit: (title) => `Visitar ${title}`,
    category: "Categoria",
    market: "Mercado",
    platform: "Plataforma",
    liveAt: "Disponível em",
    challenge: "O desafio",
    solution: "A solução",
    next: "Próximo produto",
    viewAll: "Ver todos os produtos",
  },
};

// O URL do produto sem protocolo nem barra final, para o "Live at".
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// As iniciais do autor do testemunho sem foto: a primeira letra das duas
// primeiras palavras ("Alfredo Vidinhas" → "AV").
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

// A página de detalhe de produto do v3 (artboard "v3 · Product detail —
// Kitenda", `product-detail-page`). Cada secção só renderiza com conteúdo: um
// projecto sem os campos de detalhe é um cabeçalho, a capa, a ficha com "Live
// at" e "Next product".
export default function ProductDetail({
  content,
  locale,
}: {
  content: ProductPage;
  locale: Locale;
}) {
  const { product, next } = content;
  const copy = COPY[locale];

  // O artboard tem "Pricing" na segunda entrada, mas o hcms não tem esse
  // campo, e o `market` guarda o mercado ("Angola"). Fica "Market" até o
  // template ter um `pricing` (`v3-product-detail-match-design`, D5).
  const facts = [
    { label: copy.category, value: product.category },
    { label: copy.market, value: product.market },
    { label: copy.platform, value: product.platform },
  ].filter((fact): fact is { label: string; value: string } => !!fact.value);

  const showPanel =
    !!product.challenge || !!product.solution || product.steps.length > 0;

  return (
    <main>
      <PageHeader
        breadcrumb={
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2.5 text-sm leading-5.5 text-[#5b656a]"
          >
            <Link
              href={localizedHref("/products", locale)}
              className="inline-flex items-center gap-2 font-medium text-primary"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12H4M10 6l-6 6 6 6" />
              </svg>
              <RollText>{copy.breadcrumb}</RollText>
            </Link>
            <span aria-hidden="true" className="text-[#c4c8cb]">
              /
            </span>
            <span aria-current="page">{product.title}</span>
          </nav>
        }
        title={product.title}
        lead={product.lead ?? product.description}
      >
        <Button
          href={product.url}
          openInNewTab
          variant="primary"
          size="lg"
          trailingIcon={ArrowUpRight}
          circleIcon
          textSwap
          className="border-2"
        >
          {copy.visit(product.shortName ?? product.title)}
        </Button>
      </PageHeader>

      <Reveal
        grow
        cursorText={locale === "pt" ? "Explorar" : "Explore"}
        className="relative mx-2 flex h-85 items-center justify-center overflow-hidden rounded-2xl bg-cover-ground md:mx-4 md:h-190"
      >
        {/* O "Explore" leva ao mesmo sítio que o "Visit" acima. Link só para
            o rato: o teclado e o leitor de ecrã já têm o "Visit", com nome. */}
        {/* biome-ignore lint/a11y/useAnchorContent: link redundante só de rato (`clickable-covers`); o acessível é o "Visit", e expô-lo duplicava o destino. */}
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          {product.coverImage ? (
            <Image
              src={product.coverImage.url}
              alt={product.coverImage.alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="font-gilroy text-6xl font-bold tracking-[-0.04em] text-white/92 md:text-8xl"
            >
              {product.title}
            </span>
          )}
        </a>
      </Reveal>

      <section className="flex w-full justify-center px-5 pt-14 pb-18 md:px-6 xl:px-0">
        <Reveal className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-2 border-t pt-5">
              <span className="text-sm leading-5 text-[#5b656a]">
                {fact.label}
              </span>
              <span className="text-[17px] leading-[26px] font-medium text-foreground">
                {fact.value}
              </span>
            </div>
          ))}
          <div className="flex flex-col gap-2 border-t pt-5">
            <span className="text-sm leading-5 text-[#5b656a]">
              {copy.liveAt}
            </span>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start text-[17px] leading-[26px] font-medium break-all text-foreground"
            >
              <RollText>{displayUrl(product.url)}</RollText>
              <ExternalArrow />
            </a>
          </div>
        </Reveal>
      </section>

      {showPanel ? (
        <section
          data-cursor-tone="light"
          className="relative m-2 flex justify-center overflow-clip rounded-2xl bg-primary px-5 py-14 text-white md:mx-4 md:my-0 md:px-14 md:pt-28 md:pb-26"
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full mask-[radial-gradient(ellipse_60%_40%_at_100%_0%,black,transparent)]"
          >
            <defs>
              <pattern
                id="product-panel-grid"
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
            <rect width="100%" height="100%" fill="url(#product-panel-grid)" />
          </svg>
          {/* A pill fica por cima do texto grande, e não ao lado; os cartões
              de características ficam a 56px do texto da solução. */}
          <div className="relative flex w-full max-w-292 flex-col gap-30">
            {product.challenge ? (
              <Reveal className="flex flex-col gap-7">
                <Eyebrow tone="dark">{copy.challenge}</Eyebrow>
                <p className="max-w-240 font-gilroy text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[36px] lg:text-[44px]">
                  <LitText text={product.challenge} tone="dark" />
                </p>
              </Reveal>
            ) : null}
            {product.solution || product.steps.length > 0 ? (
              <Reveal className="flex flex-col gap-7">
                <Eyebrow tone="dark">{copy.solution}</Eyebrow>
                <div className="flex flex-col gap-14">
                  {product.solution ? (
                    <p className="max-w-240 font-gilroy text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[36px] lg:text-[44px]">
                      <LitText text={product.solution} tone="dark" />
                    </p>
                  ) : null}
                  {product.steps.length > 0 ? (
                    <ul className="grid list-none gap-4 p-0 lg:grid-cols-3">
                      {product.steps.map((step, index) => (
                        <li
                          key={`${index}-${step.title}`}
                          className="flex flex-col gap-3 rounded-xl border border-white/8 bg-linear-to-b from-white/10 to-white/2 p-5 transition-[background-color,border-color] duration-400 ease-soft hover:border-white/16 hover:bg-white/7 motion-reduce:transition-none"
                        >
                          <div className="flex items-center gap-3">
                            {step.icon ? (
                              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                                <FeatureIcon icon={step.icon} />
                              </span>
                            ) : null}
                            <h3 className="text-[17px] leading-6 font-semibold">
                              {step.title}
                            </h3>
                          </div>
                          {step.body ? (
                            <p className="text-[15px] leading-6 text-white/64">
                              {step.body}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {product.gallery.length > 0 ? (
        <section className="gutter flex w-full justify-center pt-24 pb-6">
          <Reveal className="grid w-full max-w-7xl gap-6 md:grid-cols-2">
            <GalleryLightbox
              shots={product.gallery}
              title={product.title}
              locale={locale}
            />
          </Reveal>
        </section>
      ) : null}

      {product.testimonial ? (
        <section className="flex w-full justify-center px-5 py-24 md:px-6">
          <Reveal className="w-full max-w-240">
            <figure className="m-0 flex flex-col items-center gap-8 text-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="#c4c8cb"
                aria-hidden="true"
              >
                <path d="M4 18h6v-6H6c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6zm10 0h6v-6h-4c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6z" />
              </svg>
              <blockquote className="m-0 font-gilroy text-2xl leading-[1.3] font-medium tracking-[-0.02em] text-balance text-foreground md:text-[34px]">
                {product.testimonial.quote}
              </blockquote>
              <figcaption className="flex flex-col items-center gap-3">
                {product.testimonial.avatar ? (
                  <Image
                    src={product.testimonial.avatar.url}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  // O nome já está escrito por baixo: as iniciais são só
                  // decoração.
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
                  >
                    {initials(product.testimonial.authorName)}
                  </span>
                )}
                <span className="flex flex-col items-center gap-0.5 leading-5">
                  <span className="text-base font-semibold text-foreground">
                    {product.testimonial.authorName}
                  </span>
                  <span className="text-sm text-[#5b656a]">
                    {product.testimonial.tag}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </section>
      ) : null}

      {next ? (
        <section className="gutter flex w-full justify-center pb-28">
          <Reveal className="flex w-full max-w-7xl flex-col gap-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-gilroy text-[32px] leading-[1.15] font-medium tracking-[-0.02em] text-foreground">
                <LitText text={copy.next} />
              </h2>
              <Link
                href={localizedHref("/products", locale)}
                className="inline-flex items-center gap-2.5 text-base font-medium text-foreground"
              >
                <RollText>{copy.viewAll}</RollText>
                <span className="roll-arrow" data-dir="x" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
            <NextProductCard project={next} locale={locale} />
          </Reveal>
        </section>
      ) : null}
    </main>
  );
}

// Os ícones dos cartões de características, de traço a 18px. Lista fechada
// (`ProductIcon`), pela mesma razão das redes do `Footer`: um mapa aberto
// sobre uma biblioteca de ícones impede o tree-shaking. Os traços são os dos
// quatro artboards de produto; `globe` e `clock` são de antes deles.
const FEATURE_ICON_PATHS: Record<ProductIcon, string> = {
  swap: "M7 7h13l-4-4M17 17H4l4 4",
  trend: "M3 17l6-6 4 4 8-8M14 7h7v7",
  shield: "M12 3l7 3v6c0 4.4-3 8.2-7 9-4-0.8-7-4.6-7-9V6l7-3z",
  calculator: "M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  heart: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z",
  calendar: "M3 5h18v14H3zM3 10h18M8 3v4M16 3v4",
  filter: "M4 6h16M7 12h10M10 18h4",
  bank: "M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6",
  chat: "M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z",
  leaf: "M12 21c-4 0-7-3-7-7 0-5 4-9 7-11 3 2 7 6 7 11 0 4-3 7-7 7zM12 21V10",
  bag: "M3 9h18l-2 11H5L3 9zM8 9V6a4 4 0 0 1 8 0v3",
};

function FeatureIcon({ icon }: { icon: ProductIcon }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={FEATURE_ICON_PATHS[icon]} />
    </svg>
  );
}
