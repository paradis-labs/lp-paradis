import { submitQuoteRequest } from "@/app/(app)/[locale]/(pages)/get-quote/actions";
import { Reveal } from "@/components/ui/reveal";
import type { QuotePage } from "@/content";
import type { Locale } from "@/i18n/routing";
import { textOr } from "@/lib/cms-text";
import {
  QUOTE_MESSAGE_FALLBACK,
  type QuoteMessages,
} from "@/lib/quote-request";
import QuoteForm, { type QuoteInterest } from "./QuoteForm";

// O piso de cada texto, por idioma: em `/pt`, um campo vazio no CMS cai em
// português. As cópias `pt` são as do `block_form` e do formulário
// `quote_request` no hcms.
const FALLBACK: Record<
  Locale,
  {
    headline: string;
    intro: string;
    availabilityLabel: string;
    eyebrow: string;
    nameLabel: string;
    emailLabel: string;
    interestsLabel: string;
    messageLabel: string;
    submitLabel: string;
    privacyNote: string;
  }
> = {
  en: {
    headline: "Let's build something that moves you forward.",
    intro:
      "We're excited to hear what you're building. Drop the details below and we'll reply within one business day.",
    availabilityLabel: "Available for new projects",
    eyebrow: "THE BRIEF",
    nameLabel: "Your name",
    emailLabel: "Your email",
    interestsLabel: "I'm interested in…",
    messageLabel: "Tell us about your project",
    submitLabel: "Send enquiry",
    privacyNote: "Your details are safe — no ads, no spam.",
  },
  pt: {
    headline: "Vamos construir algo que o faça avançar.",
    intro:
      "Queremos saber o que está a construir. Deixe os detalhes abaixo e respondemos dentro de um dia útil.",
    availabilityLabel: "Disponíveis para novos projectos",
    eyebrow: "O BRIEFING",
    nameLabel: "O seu nome",
    emailLabel: "O seu e-mail",
    interestsLabel: "Tenho interesse em…",
    messageLabel: "Fale-nos do seu projecto",
    submitLabel: "Enviar pedido",
    privacyNote: "Os seus dados estão seguros — sem anúncios, sem spam.",
  },
};

interface GetQuoteProps extends QuotePage {
  locale: Locale;
}

export default function GetQuote({ locale, ...content }: GetQuoteProps) {
  const { availability, form } = content;
  const fallback = FALLBACK[locale];
  const messageFallback = QUOTE_MESSAGE_FALLBACK[locale];

  const headline = textOr(content.hero.headline, fallback.headline);
  const intro = textOr(content.hero.intro, fallback.intro);
  const showPill = availability.enabled;
  const availabilityLabel = textOr(
    availability.label,
    fallback.availabilityLabel,
  );
  const location = availability.location?.trim() ?? "";
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

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-20 lg:py-28">
      {/* Revelação em dois níveis (#20): o cabeçalho com stagger e o formulário
          como UM bloco. Nunca por campo — o `Reveal` volta a esconder ao sair
          da viewport, e um Tab para um campo abaixo da dobra daria foco a um
          elemento a meio da animação. As mensagens de erro vivem dentro do
          bloco do formulário, que está na viewport quando o visitante submete.

          O título entra sem atraso e sem deslocamento: é o primeiro ecrã, que o
          `template.tsx` já faz entrar, e um segundo slide por cima leria como
          duas animações a competir. */}
      <Reveal direction="none">
        <h1 className="max-w-3xl font-gilroy text-4xl font-bold gradient-text leading-[1.08] tracking-tight text-primary whitespace-pre-line sm:text-5xl lg:text-6xl xl:text-7xl">
          {headline}
        </h1>
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-14 flex flex-col gap-10 lg:mt-24 lg:flex-row lg:items-end lg:justify-between"
      >
        {showPill ? (
          <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-secondary px-5 py-2.5 text-sm text-primary">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-green-500"
            />
            {availabilityLabel}
            {location ? (
              <span className="text-neutral-400">
                {"·"} {location}
              </span>
            ) : null}
          </p>
        ) : null}

        <p className="max-w-sm text-lg leading-8 text-primary lg:text-right">
          {intro}
        </p>
      </Reveal>

      {!form.enabled ? null : (
        <Reveal>
          <section className="mt-20 lg:mt-28">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              {textOr(form.eyebrow, fallback.eyebrow)}
            </h2>

            <QuoteForm
              action={action}
              interests={interests}
              labels={{
                name: textOr(form.nameLabel, fallback.nameLabel),
                email: textOr(form.emailLabel, fallback.emailLabel),
                interests: textOr(
                  form?.interestsLabel,
                  fallback.interestsLabel,
                ),
                message: textOr(form.messageLabel, fallback.messageLabel),
                submit: textOr(form.submitLabel, fallback.submitLabel),
                privacyNote: textOr(form.privacyNote, fallback.privacyNote),
              }}
              messages={messages}
            />
          </section>
        </Reveal>
      )}
    </main>
  );
}
