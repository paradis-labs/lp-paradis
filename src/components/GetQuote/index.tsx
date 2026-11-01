import { submitQuoteRequest } from "@/app/(app)/[locale]/(pages)/get-quote/actions";
import Reveal from "@/components/Reveal";
import type { QuotePage } from "@/content";
import type { Locale } from "@/i18n/routing";
import { textOr } from "@/lib/cms-text";
import {
  QUOTE_MESSAGE_FALLBACK,
  type QuoteFormState,
  type QuoteMessages,
} from "@/lib/quote-request";
import { cn } from "@/lib/utils";
import PageHeader from "../PageHeader";
import QuoteContactAside, {
  hasContactAside,
  type QuoteContactAsideProps,
} from "./QuoteContactAside";
import QuoteForm, { type QuoteInterest } from "./QuoteForm";

// Os pisos dos campos do CMS (os primeiros) e a cópia de UI que o v3 trouxe sem
// campo no hcms (a partir de `cardTitle`). Um piso por idioma: em `/pt` um
// campo vazio cai em português, e nenhuma string em inglês chega à rota.
const FALLBACK: Record<
  Locale,
  {
    headline: string;
    intro: string;
    eyebrow: string;
    nameLabel: string;
    emailLabel: string;
    companyLabel: string;
    interestsLabel: string;
    messageLabel: string;
    submitLabel: string;
    privacyNote: string;
    cardTitle: string;
    cardSubtitle: string;
    messagePlaceholder: string;
    optional: string;
    successTitle: string;
    sendAnother: string;
  }
> = {
  en: {
    headline: "Let's build something that moves you forward.",
    intro:
      "We're excited to hear what you're building. Drop the details below and we'll reply within one business day.",
    eyebrow: "Get a Quote",
    nameLabel: "Your name",
    emailLabel: "Your email",
    companyLabel: "Company",
    interestsLabel: "I'm interested in…",
    messageLabel: "Your project",
    submitLabel: "Send enquiry",
    privacyNote: "Your details are safe — no ads, no spam.",
    cardTitle: "Tell us about your project",
    cardSubtitle: "A few details are enough to get started.",
    messagePlaceholder:
      "Goals, timeline, budget range — anything that helps us understand it.",
    optional: "(optional)",
    successTitle: "Thanks — your enquiry is in.",
    sendAnother: "Send another",
  },
  pt: {
    headline: "Vamos construir algo que o faça avançar.",
    intro:
      "Queremos saber o que está a construir. Deixe os detalhes abaixo e respondemos dentro de um dia útil.",
    eyebrow: "Pedir orçamento",
    nameLabel: "O seu nome",
    emailLabel: "O seu e-mail",
    companyLabel: "Empresa",
    interestsLabel: "Tenho interesse em…",
    messageLabel: "O seu projecto",
    submitLabel: "Enviar pedido",
    privacyNote: "Os seus dados estão seguros — sem anúncios, sem spam.",
    cardTitle: "Fale-nos do seu projecto",
    cardSubtitle: "Bastam alguns detalhes para começar.",
    messagePlaceholder:
      "Objectivos, prazos, orçamento — tudo o que nos ajude a perceber.",
    optional: "(opcional)",
    successTitle: "Obrigado — o seu pedido chegou.",
    sendAnother: "Enviar outro",
  },
};

interface GetQuoteProps extends QuotePage {
  locale: Locale;
  /** O conteúdo do aside de contacto, já lido pela rota. */
  aside: Omit<QuoteContactAsideProps, "locale">;
  /** Só para a fixture: o estado inicial do formulário. */
  initialFormState?: QuoteFormState;
}

// A página de orçamento do v3: o `PageHeader`, e por baixo o cartão do
// formulário com o aside de contacto ao lado (`get-quote-page`,
// `quote-contact-aside`). Server component: só o formulário é cliente, e
// recebe apenas strings resolvidas e a lista de chips.
export default function GetQuote({
  locale,
  aside,
  initialFormState,
  ...content
}: GetQuoteProps) {
  const { form } = content;
  const fallback = FALLBACK[locale];
  const messageFallback = QUOTE_MESSAGE_FALLBACK[locale];

  const headline = textOr(content.hero.headline, fallback.headline);
  const intro = textOr(content.hero.intro, fallback.intro);
  // O provider já garante slug e título não vazios; só-espaços continua a
  // contar como vazio, e um chip sem rótulo não é selecionável por ninguém.
  const interests: QuoteInterest[] = form.interests.flatMap((service) => {
    const slug = service.slug.trim();
    const title = service.title.trim();
    return slug && title ? [{ slug, title }] : [];
  });

  const messages: QuoteMessages = {
    success: textOr(form.messages.success, messageFallback.success),
    error: textOr(form.messages.error, messageFallback.error),
    nameRequired: textOr(
      form.messages.nameRequired,
      messageFallback.nameRequired,
    ),
    emailRequired: textOr(
      form.messages.emailRequired,
      messageFallback.emailRequired,
    ),
    emailInvalid: textOr(
      form.messages.emailInvalid,
      messageFallback.emailInvalid,
    ),
    messageRequired: textOr(
      form.messages.messageRequired,
      messageFallback.messageRequired,
    ),
    tooLong: textOr(form.messages.tooLong, messageFallback.tooLong),
  };

  const action = submitQuoteRequest.bind(null, locale);
  const showAside = hasContactAside(aside);

  return (
    <main>
      <PageHeader
        eyebrow={textOr(form.eyebrow, fallback.eyebrow)}
        title={headline}
        lead={intro}
      />

      {form.enabled || showAside ? (
        <section className="flex w-full justify-center pt-2 pb-24">
          <div
            className={cn(
              "gutter grid w-full max-w-7xl items-start gap-6",
              form.enabled && showAside && "lg:grid-cols-[minmax(0,1fr)_400px]",
            )}
          >
            {form.enabled ? (
              <Reveal className="rounded-2xl border bg-white px-5 py-6 md:p-10">
                <QuoteForm
                  action={action}
                  interests={interests}
                  labels={{
                    title: fallback.cardTitle,
                    subtitle: fallback.cardSubtitle,
                    name: textOr(form.nameLabel, fallback.nameLabel),
                    email: textOr(form.emailLabel, fallback.emailLabel),
                    company: form.company
                      ? textOr(form.company.label, fallback.companyLabel)
                      : null,
                    optional: fallback.optional,
                    interests: textOr(
                      form.interestsLabel,
                      fallback.interestsLabel,
                    ),
                    message: textOr(form.messageLabel, fallback.messageLabel),
                    messagePlaceholder: textOr(
                      form.messagePlaceholder,
                      fallback.messagePlaceholder,
                    ),
                    submit: textOr(form.submitLabel, fallback.submitLabel),
                    privacyNote: textOr(form.privacyNote, fallback.privacyNote),
                    successTitle: textOr(
                      form.successTitle,
                      fallback.successTitle,
                    ),
                    sendAnother: textOr(
                      form.successAgainLabel,
                      fallback.sendAnother,
                    ),
                  }}
                  messages={messages}
                  initialState={initialFormState}
                />
              </Reveal>
            ) : null}
            {showAside ? (
              <QuoteContactAside locale={locale} {...aside} />
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
