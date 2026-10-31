import { ArrowRightDown } from "@solar-icons/react";
import CalendlyCta from "@/components/CalendlyCta";
import FAQSection from "@/components/FAQSection";
import Hero from "@/components/Hero";
import LitText from "@/components/LitText";
import MarqueeServices from "@/components/MarqueeServices";
import ProductsSection from "@/components/ProductsSection";
import Reveal from "@/components/Reveal";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { VideoAutoPause } from "@/components/ui/video-autopause";
import { getHomepage } from "@/content";
import { requireLocale } from "@/i18n/require-locale";
import type { Locale } from "@/i18n/routing";
import { localizedCtaHref } from "@/lib/locale-href";

// O nome acessível do marquee de serviços.
const MARQUEE_LABEL: Record<Locale, string> = {
  en: "Services",
  pt: "Serviços",
};

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await props.params).locale);
  const { hero, services, projects, faqs, testimonials } =
    await getHomepage(locale);

  const videoUrl = services.ourServicesCT.backgroundVideo?.url ?? undefined;

  // O cartão "Still have questions?" do FAQ reutiliza o CTA de chamada do hero.
  const callHref = hero.item
    ? localizedCtaHref(hero.item.secondaryCta.url, locale)
    : undefined;
  const callLabel = hero.item?.secondaryCta.label;
  const callCta =
    callHref && callLabel ? { label: callLabel, href: callHref } : undefined;

  return (
    <main>
      {hero.enabled && hero.item && (
        <Hero
          {...hero.item}
          primaryCtaHref={localizedCtaHref(hero.item.primaryCta.url, locale)}
          secondaryCtaHref={callHref}
        />
      )}
      {services.items.length > 0 && (
        <MarqueeServices
          services={services.items}
          label={MARQUEE_LABEL[locale]}
        />
      )}
      <div className="flex w-full flex-col items-center pb-11">
        <section className="container mx-auto flex w-full flex-col gap-5 px-3 py-12 leading-8 md:px-4 xl:px-0">
          <Reveal
            id="about-us"
            className="relative z-2 flex w-full flex-col gap-7 px-5 py-10 md:px-6 xl:w-149.5 xl:px-0"
          >
            <div className="flex flex-col gap-5">
              {services.title && (
                <h2 className="font-gilroy text-[30px] leading-[1.15] font-medium tracking-[-0.02em] text-balance md:text-[40px]">
                  <LitText text={services.title} />
                </h2>
              )}
              {services.subtitle && (
                <p className="text-[19px] leading-[31px] text-muted-foreground">
                  {services.subtitle}
                </p>
              )}
            </div>
            {services.primaryCta.label && (
              <div>
                <CalendlyCta
                  variant="outline"
                  href={localizedCtaHref(services.primaryCta.url, locale)}
                  trailingIcon={ArrowRightDown}
                  circleIcon
                  textSwap
                >
                  {services.primaryCta.label}
                </CalendlyCta>
              </div>
            )}
          </Reveal>
          <div className="services_notch_corner flex w-full flex-col items-center justify-center gap-6 md:relative md:pt-102 xl:-mt-102">
            <Reveal
              grow
              className="video_shape relative hidden h-117.5 w-full overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_70%_30%,#31373d_0%,#212528_45%,#151718_100%)] md:absolute md:top-0 md:right-0 md:block xl:w-149.5"
            >
              {/* Sem `autoPlay` e com `preload="none"` (P1 da Motion spec):
                  com `autoPlay` o browser descarregava o MP4 inteiro no load,
                  com o vídeo abaixo da dobra. Quem o põe a tocar é o
                  `VideoAutoPause`, quando entra no ecrã. */}
              <VideoAutoPause>
                <video
                  className="size-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="none"
                >
                  <source
                    src={videoUrl}
                    type="video/mp4"
                    media="(min-width: 768px)"
                  />
                </video>
              </VideoAutoPause>
            </Reveal>
            <div
              data-cursor-tone="light"
              className="services_shape flex w-full flex-col gap-20 rounded-2xl bg-primary py-12 md:gap-26 md:pt-34 md:pb-16 xl:gap-32"
            >
              <div id="services">
                <ServicesSection services={services} locale={locale} />
              </div>
              <div id="products">
                <ProductsSection
                  projects={projects}
                  locale={locale}
                  ctaHref={localizedCtaHref(projects.primaryCta.url, locale)}
                />
              </div>
              <div id="testimonials">
                <TestimonialsSection
                  testimonials={testimonials}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </section>
        <section
          id="faqs"
          className="container mx-auto flex w-full flex-col gap-5 px-5 pt-16 pb-12 leading-8 md:px-6 xl:px-0"
        >
          <FAQSection {...faqs} locale={locale} callCta={callCta} />
        </section>
      </div>
    </main>
  );
}
