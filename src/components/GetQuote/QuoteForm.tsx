"use client";

import { ArrowRightDown } from "@solar-icons/react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  type QuoteErrorCode,
  type QuoteFormState,
  type QuoteMessages,
  type QuoteSubmission,
  quoteSubmissionSchema,
  toFieldErrors,
} from "@/lib/quote-request";
import { cn } from "@/lib/utils";
import Button from "../Button";

// Restrições de bundle que este módulo cumpre, cada uma por um erro já pago
// neste repo (ver a capability `get-quote-page`):
//
//   • NENHUM import de `@/i18n/navigation`. Tanto o `Link` quanto o
//     `getPathname` de lá arrastam o parser ICU do `@formatjs`: +33,6 KB num
//     único chunk, medido no footer. Este formulário não navega, então não
//     precisa de nenhum dos dois — e o texto já chega traduzido do servidor.
//   • Ícones só por import nominal. O erro que o `Button` documentava (12,7 MB
//     retidos por `Icons[nome]` sobre um `import * as`) começou por indexação
//     dinâmica. O `+` dos chips e o escudo da nota são SVG inline.

export interface QuoteInterest {
  slug: string;
  title: string;
}

interface QuoteFormProps {
  action: (
    previous: QuoteFormState,
    formData: FormData,
  ) => Promise<QuoteFormState>;
  interests: QuoteInterest[];
  labels: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    /** `null` quando o formulário do hcms não declara o campo `company`. */
    company: string | null;
    optional: string;
    interests: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    privacyNote: string;
    successNote: string;
    sendAnother: string;
  };
  messages: QuoteMessages;
  /**
   * O estado com que o formulário arranca. Só a fixture o passa, para mostrar
   * a confirmação sem submeter — na página é sempre `idle`.
   */
  initialState?: QuoteFormState;
}

type FieldErrors = Partial<Record<keyof QuoteSubmission, QuoteErrorCode>>;

const LABEL = "text-sm leading-5 font-medium text-primary";

// Os inputs do v3: 52px, contorno de 1,5px, anel de 4px no foco.
const INPUT =
  "h-13 w-full rounded-xl border-[1.5px] border-border bg-white px-4 text-base leading-6 text-foreground outline-none transition-[border-color,box-shadow] duration-300 ease-soft placeholder:text-[#8a9296] hover:border-haze focus:border-primary focus:shadow-[0_0_0_4px_rgba(33,37,40,0.08)] aria-invalid:border-red-600 motion-reduce:transition-none";

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="transition-transform duration-450 ease-soft group-aria-pressed:rotate-45 motion-reduce:transition-none"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// O formulário e a confirmação. "Send another" remonta este componente (a
// `key` muda no pai): limpa os campos, os chips e o estado da action de uma
// vez, sem nenhum reset manual que possa esquecer uma peça.
export default function QuoteForm(props: QuoteFormProps) {
  const [round, setRound] = useState(0);

  return (
    <QuoteFormRound
      key={round}
      {...props}
      // Depois do primeiro "Send another" arranca sempre vazio.
      initialState={round > 0 ? undefined : props.initialState}
      focusOnMount={round > 0}
      onReset={() => setRound((current) => current + 1)}
    />
  );
}

function QuoteFormRound({
  action,
  interests,
  labels,
  messages,
  initialState = { status: "idle" },
  focusOnMount,
  onReset,
}: QuoteFormProps & { focusOnMount: boolean; onReset: () => void }) {
  const [state, formAction, isPending] = useActionState<
    QuoteFormState,
    FormData
  >(action, initialState);

  const [selected, setSelected] = useState<string[]>([]);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Depois de "Send another", o foco volta ao primeiro campo: o botão que o
  // tinha deixou de existir, e sem isto o foco caía no `<body>`.
  useEffect(() => {
    if (focusOnMount) nameRef.current?.focus();
  }, [focusOnMount]);

  const serverErrors: FieldErrors =
    state.status === "invalid" ? state.fieldErrors : {};

  function errorFor(field: keyof QuoteSubmission): string | null {
    const code = clientErrors[field] ?? serverErrors[field];
    return code ? messages[code] : null;
  }

  function toggleInterest(slug: string) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const parsed = quoteSubmissionSchema.safeParse({
      name: data.get("name") ?? "",
      email: data.get("email") ?? "",
      message: data.get("message") ?? "",
      company: data.get("company") ?? undefined,
      interests: data.getAll("interests").map(String),
      honeypot: "",
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientErrors(toFieldErrors(parsed.error.issues));
      return;
    }

    setClientErrors({});
  }

  if (state.status === "success") {
    return (
      // `<output>` tem o papel `status`: a confirmação é anunciada quando
      // substitui o formulário, sem roubar o foco.
      <output className="flex min-h-130 flex-col items-start justify-center gap-5">
        <span
          aria-hidden="true"
          className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-white"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <h2 className="gradient-text font-gilroy text-[32px] leading-[1.1] font-bold tracking-[-0.03em] md:text-[40px]">
          {messages.success}
        </h2>
        <p className="max-w-115 text-lg leading-[30px] text-muted-foreground">
          {labels.successNote}
        </p>
        <Button type="button" variant="outline" textSwap onClick={onReset}>
          {labels.sendAnother}
        </Button>
      </output>
    );
  }

  const fieldError = (field: keyof QuoteSubmission, id: string) =>
    errorFor(field) ? (
      <p id={id} className="text-sm text-red-600">
        {errorFor(field)}
      </p>
    ) : null;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 overflow-hidden"
      >
        <label htmlFor="quote-website">Website</label>
        <input
          id="quote-website"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-gilroy text-[26px] leading-[1.15] font-medium tracking-[-0.02em] text-foreground md:text-[32px]">
          {labels.title}
        </h2>
        <p className="text-base leading-[26px] text-[#5b656a]">
          {labels.subtitle}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="quote-name" className={LABEL}>
            {labels.name}
          </label>
          <input
            ref={nameRef}
            id="quote-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errorFor("name"))}
            aria-describedby={errorFor("name") ? "quote-name-error" : undefined}
            className={INPUT}
          />
          {fieldError("name", "quote-name-error")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="quote-email" className={LABEL}>
            {labels.email}
          </label>
          <input
            id="quote-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errorFor("email"))}
            aria-describedby={
              errorFor("email") ? "quote-email-error" : undefined
            }
            className={INPUT}
          />
          {fieldError("email", "quote-email-error")}
        </div>

        {/* Só quando o formulário do hcms declara o campo: sem ele, a grelha
            fica com nome e e-mail, sem célula vazia. */}
        {labels.company !== null ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="quote-company" className={LABEL}>
              {labels.company}{" "}
              <span className="font-normal text-mist">{labels.optional}</span>
            </label>
            <input
              id="quote-company"
              name="company"
              type="text"
              autoComplete="organization"
              aria-invalid={Boolean(errorFor("company"))}
              aria-describedby={
                errorFor("company") ? "quote-company-error" : undefined
              }
              className={INPUT}
            />
            {fieldError("company", "quote-company-error")}
          </div>
        ) : null}
      </div>

      {interests.length > 0 ? (
        <fieldset className="m-0 border-0 p-0">
          <legend className={cn(LABEL, "mb-3 p-0")}>{labels.interests}</legend>
          <div className="flex flex-wrap gap-2.5">
            {interests.map((interest) => {
              const isSelected = selected.includes(interest.slug);
              return (
                <button
                  key={interest.slug}
                  type="button"
                  onClick={() => toggleInterest(interest.slug)}
                  aria-pressed={isSelected}
                  className="group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-border bg-white py-2.5 pr-4.5 pl-3.5 text-[15px] leading-5 font-medium text-primary transition-[background-color,color,border-color] duration-350 ease-soft hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white motion-reduce:transition-none"
                >
                  <PlusIcon />
                  {interest.title}
                </button>
              );
            })}
          </div>
          {/* A seleção viaja em inputs escondidos e não no estado do React:
              `formData.getAll("interests")` é o que a action lê. */}
          {selected.map((slug) => (
            <input key={slug} type="hidden" name="interests" value={slug} />
          ))}
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="quote-message" className={LABEL}>
          {labels.message}
        </label>
        <textarea
          id="quote-message"
          name="message"
          rows={6}
          placeholder={labels.messagePlaceholder}
          aria-invalid={Boolean(errorFor("message"))}
          aria-describedby={
            errorFor("message") ? "quote-message-error" : undefined
          }
          className={cn(INPUT, "h-auto min-h-42 resize-y py-3.5")}
        />
        {fieldError("message", "quote-message-error")}
      </div>

      <div className="flex flex-col items-start gap-5 border-t pt-8 md:flex-row md:items-center">
        {/* `disabled` durante a submissão é o que impede o duplo clique de criar
            dois documentos. */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          trailingIcon={ArrowRightDown}
          circleIcon
          textSwap
          className="w-full border-2 md:w-auto"
        >
          {labels.submit}
        </Button>
        <span className="inline-flex items-center gap-2 text-sm leading-5 text-[#5b656a]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          </svg>
          {labels.privacyNote}
        </span>
      </div>

      {/* Erro de gravação. Os valores escritos permanecem nos campos, porque
          nada os limpa — o visitante volta a submeter sem reescrever tudo. */}
      {state.status === "error" ? (
        <p role="alert" className="text-base text-red-600">
          {messages.error}
        </p>
      ) : null}
    </form>
  );
}
