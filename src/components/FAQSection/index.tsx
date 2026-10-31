import Reveal from "@/components/Reveal";
import type { Homepage } from "@/content";
import type { Locale } from "@/i18n/routing";
import CallCard from "../CallCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const CALL_COPY: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: "Still have questions?",
    subtitle: "Talk to us on a 30-minute call.",
  },
  pt: {
    title: "Ainda tem dúvidas?",
    subtitle: "Fale connosco numa chamada de 30 minutos.",
  },
};

type FAQSectionProps = Homepage["faqs"] & {
  locale: Locale;
  /**
   * O CTA de chamada do cartão por baixo da lista, já resolvido. É o
   * `secondaryCta` do hero — o "Schedule a Call" authorado —, para o link do
   * Calendly não existir duas vezes. Sem ele o cartão não renderiza.
   */
  callCta?: { label: string; href: string };
};

// O FAQ do v3: título centrado, lista de itens com o primeiro aberto, e o
// cartão "Still have questions?" no fim.
export default function FAQSection({
  title,
  subtitle,
  items,
  locale,
  callCta,
}: FAQSectionProps) {
  const first = items[0];
  const call = CALL_COPY[locale];

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <Reveal className="flex max-w-130 flex-col items-center gap-3.5 text-center">
        {title ? (
          <h2 className="font-gilroy text-[26px] leading-[1.2] font-medium tracking-[-0.02em] md:text-[30px] lg:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="text-lg leading-[30px] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </Reveal>
      {items.length > 0 ? (
        <Reveal className="w-full max-w-220">
          <Accordion
            type="single"
            collapsible
            defaultValue={first ? `faq-${first.key}` : undefined}
            className="flex w-full flex-col gap-3"
          >
            {items.map((faq) => (
              <AccordionItem key={faq.key} value={`faq-${faq.key}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base leading-[26px] text-muted-foreground">
                  {/* O único `dangerouslySetInnerHTML` do conteúdo: `answer` é
                      `RichText`, que só sai de `toRichText`, já sanitizado. */}
                  <div
                    className="payload-richtext"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML sanitizado por `toRichText`
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      ) : null}
      {callCta ? (
        <Reveal className="w-full max-w-220">
          <CallCard title={call.title} subtitle={call.subtitle} cta={callCta} />
        </Reveal>
      ) : null}
    </div>
  );
}
