import { ArrowRightUp } from "@solar-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ProductIcon, ProductPage } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";
import Button from "../Button";
import Eyebrow from "../Eyebrow";
import LitText from "../LitText";
import PageHeader from "../PageHeader";
import ProductCard from "../ProductCard";
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
    more: string;
    moreTitle: string;
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
    more: "More Products",
    moreTitle: "Keep exploring what we build.",
    viewAll: "View All",
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
    more: "Mais produtos",
    moreTitle: "Continue a explorar o que construímos.",
    viewAll: "Ver todos",
  },
};

// O URL do produto sem protocolo nem barra final, para o "Live at".
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// A página de detalhe de produto do v3 (artboard "v3 · Product detail —
// Kitenda", `product-detail-page`). Cada secção só renderiza com conteúdo: um
// projecto sem os campos de detalhe é um cabeçalho, a capa, a ficha com "Live
// at" e "More Products".
export default function ProductDetail({
  content,
  locale,
}: {
  content: ProductPage;
  locale: Locale;
}) {
  const { product, others } = content;
  const copy = COPY[locale];

  const facts = [
    { label: copy.category, value: product.category },
    { label: copy.market, value: product.market },
    { label: copy.platform, value: product.platform },
  ].filter((fact): fact is { label: string; value: string } => !!fact.value);

  const showPanel =
    !!product.challenge || !!product.solution || product.steps.length > 0;
  const [firstShot, ...restShots] = product.gallery;

  return (
    <main>
      <PageHeader
        breadcrumb={
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-mist"
          >
            <Link
              href={localizedHref("/products", locale)}
              className="text-primary"
            >
              <RollText>{copy.breadcrumb}</RollText>
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.title}</span>
          </nav>
        }
        title={product.title}
        titleSize="xl"
        lead={product.description}
      >
        <Button
          href={product.url}
          openInNewTab
          variant="primary"
          size="lg"
          trailingIcon={ArrowRightUp}
          circleIcon
          textSwap
          className="border-2"
        >
          {copy.visit(product.title)}
        </Button>
      </PageHeader>

      <Reveal
        grow
        cursorText={locale === "pt" ? "Explorar" : "Explore"}
        className="relative mx-2 flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-primary md:mx-4 md:h-160"
      >
        {product.coverImage ? (
          <Image
            src={product.coverImage.url}
            alt=""
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
              <span className="roll-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </Reveal>
      </section>

      {showPanel ? (
        <section
          data-cursor-tone="light"
          className="relative mx-2 flex justify-center overflow-clip rounded-2xl bg-primary px-5 pt-16 pb-14 text-white md:mx-4 md:px-14 md:pt-28 md:pb-24"
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full mask-[radial-gradient(ellipse_60%_50%_at_100%_0%,black,transparent)]"
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
          <div className="relative flex w-full max-w-292 flex-col gap-16 md:gap-28">
            {product.challenge ? (
              <Reveal className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                <Eyebrow tone="dark" className="justify-self-start">
                  {copy.challenge}
                </Eyebrow>
                <p className="font-gilroy text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[36px] lg:text-[44px]">
                  <LitText text={product.challenge} tone="dark" />
                </p>
              </Reveal>
            ) : null}
            {product.solution || product.steps.length > 0 ? (
              <Reveal className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                <Eyebrow tone="dark" className="justify-self-start">
                  {copy.solution}
                </Eyebrow>
                <div className="flex flex-col gap-10">
                  {product.solution ? (
                    <p className="font-gilroy text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[36px] lg:text-[44px]">
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

      {firstShot ? (
        <section className="flex w-full justify-center px-3 pt-24 pb-6 md:px-4 xl:px-0">
          <Reveal className="grid w-full max-w-7xl gap-6 md:grid-cols-2">
            {[firstShot, ...restShots].map((shot, index) => (
              <div
                key={shot.url}
                data-cursor-text={locale === "pt" ? "Ver" : "View"}
                className={
                  index === 0
                    ? "group relative h-70 overflow-hidden rounded-2xl border bg-primary md:col-span-2 md:h-140"
                    : "group relative h-70 overflow-hidden rounded-2xl border bg-primary md:h-105"
                }
              >
                <Image
                  src={shot.url}
                  alt={shot.alt ?? ""}
                  fill
                  sizes={
                    index === 0
                      ? "(min-width: 1280px) 1280px, 100vw"
                      : "(min-width: 768px) 50vw, 100vw"
                  }
                  className="object-cover transition-transform duration-600 ease-[ease] group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </div>
            ))}
          </Reveal>
        </section>
      ) : null}

      {product.testimonial ? (
        <section className="flex w-full justify-center px-5 py-24 md:px-6">
          <Reveal className="w-full max-w-240">
            <figure className="m-0 flex flex-col items-center gap-8 text-center">
              <blockquote className="m-0 font-gilroy text-[26px] leading-[1.3] font-medium tracking-[-0.02em] text-balance text-foreground md:text-[34px]">
                {product.testimonial.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 text-left">
                {product.testimonial.avatar ? (
                  <Image
                    src={product.testimonial.avatar.url}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                  />
                ) : null}
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold">
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

      {others.length > 0 ? (
        <section className="flex w-full justify-center px-3 pt-12 pb-24 md:px-4 xl:px-0">
          <div className="flex w-full max-w-7xl flex-col gap-10">
            <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="flex flex-col gap-4">
                <Eyebrow>{copy.more}</Eyebrow>
                <h2 className="font-gilroy text-[30px] leading-[1.15] font-medium tracking-[-0.02em] md:text-4xl">
                  {copy.moreTitle}
                </h2>
              </div>
              <Button
                href={localizedHref("/products", locale)}
                variant="outline"
                trailingIcon={ArrowRightUp}
                circleIcon
                textSwap
              >
                {copy.viewAll}
              </Button>
            </Reveal>
            <Reveal group className="grid gap-6 min-[900px]:grid-cols-2">
              {others.map((project, index) => (
                <ProductCard
                  key={project.key}
                  project={project}
                  number={index + 1}
                  locale={locale}
                />
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}
    </main>
  );
}

// Os ícones dos cartões de características, de traço a 18px. Lista fechada
// (`ProductIcon`), pela mesma razão das redes do `Footer`: um mapa aberto
// sobre uma biblioteca de ícones impede o tree-shaking. Os três primeiros são
// os do mockup.
const FEATURE_ICON_PATHS: Record<ProductIcon, string> = {
  swap: "M7 7h13l-4-4M17 17H4l4 4",
  trend: "M3 17l6-6 4 4 8-8M14 7h7v7",
  shield: "M12 3l7 3v6c0 4.4-3 8.2-7 9-4-0.8-7-4.6-7-9V6l7-3z",
  calculator:
    "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
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
