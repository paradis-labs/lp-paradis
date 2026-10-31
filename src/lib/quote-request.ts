import { z } from "zod";
import type { Locale } from "@/i18n/routing";

// O contrato da submissão de `/get-quote`, partilhado pela Server Action e pelo
// componente de cliente. O cliente valida para dar retorno imediato; a action
// **revalida tudo**, porque o cliente é contornável — o schema aqui é um só
// para as duas pontas não poderem divergir.

// Tetos de comprimento. Servem duas coisas ao mesmo tempo: sanidade de dados e
// a primeira linha contra lixo automatizado, já que o `create` da coleção é
// público por necessidade (formulário anónimo).
export const QUOTE_LIMITS = {
  name: 120,
  email: 200,
  message: 4000,
  company: 160,
  interests: 12,
} as const;

// Conjunto FECHADO de códigos de erro. Cada um casa com um campo de
// `form.messages` na global `get-quote-page` — é essa correspondência que
// permite à action devolver códigos e nunca texto, deixando a tradução do lado
// do CMS. Acrescentar um código aqui obriga a acrescentar o campo lá.
export const QUOTE_ERROR_CODES = [
  "nameRequired",
  "emailRequired",
  "emailInvalid",
  "messageRequired",
  "tooLong",
] as const;

export type QuoteErrorCode = (typeof QUOTE_ERROR_CODES)[number];

// Verificação pragmática de formato, no espírito da validação do `type="email"`
// do HTML. Deliberadamente não tenta ser RFC 5322: o campo `email` do Payload
// valida outra vez na gravação, e uma regex ambiciosa aqui só produziria falsos
// negativos em endereços legítimos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Os slugs dos serviços. Ver o campo `slug` de `collections/Services.ts`: o
// hook de geração produz minúsculas, dígitos, `-` e `_`.
const SLUG_PATTERN = /^[\w-]+$/;

export const quoteSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "nameRequired")
    .max(QUOTE_LIMITS.name, "tooLong"),
  email: z
    .string()
    .trim()
    .min(1, "emailRequired")
    .max(QUOTE_LIMITS.email, "tooLong")
    .regex(EMAIL_PATTERN, "emailInvalid"),
  message: z
    .string()
    .trim()
    .min(1, "messageRequired")
    .max(QUOTE_LIMITS.message, "tooLong"),
  // Opcional. Vazio depois do trim conta como ausente — a action passa `null`
  // ao provider, que só o grava se o formulário do hcms declarar o campo.
  company: z.string().trim().max(QUOTE_LIMITS.company, "tooLong").optional(),
  // Slugs de serviço, não ids: o slug é a identidade estável de um interesse
  // (um `title` reescrito no CMS não pode invalidar submissões antigas). A
  // action resolve-os contra a coleção e descarta o que não existir.
  interests: z
    .array(z.string().regex(SLUG_PATTERN))
    .max(QUOTE_LIMITS.interests)
    .default([]),
  // Honeypot. Um humano nunca o vê, logo nunca o preenche. Preenchido, a action
  // devolve sucesso e não grava — responder com erro ensinaria o bot a evitá-lo.
  honeypot: z.string().default(""),
});

export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;

// O estado que a action devolve ao cliente. Erros de validação vêm por código e
// por campo; o texto é resolvido no cliente a partir das mensagens do CMS que
// ele já recebeu.
export type QuoteFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error" }
  | {
      status: "invalid";
      fieldErrors: Partial<Record<keyof QuoteSubmission, QuoteErrorCode>>;
    };

// Piso de cada mensagem, pela razão que `lib/cms-text.ts` documenta: o campo
// correspondente da global pode estar vazio, e uma mensagem de erro em branco
// deixa o visitante sem saber o que corrigir. Um piso por idioma: em `/pt`, uma
// mensagem vazia no CMS cai em português. As cópias `pt` são as do formulário
// `quote_request` no hcms.
export type QuoteMessages = Record<
  QuoteErrorCode | "success" | "error",
  string
>;

export const QUOTE_MESSAGE_FALLBACK: Record<Locale, QuoteMessages> = {
  en: {
    success:
      "Thanks — we've got your brief. We'll reply within one business day.",
    error: "Something went wrong sending your enquiry. Please try again.",
    nameRequired: "Please tell us your name.",
    emailRequired: "Please enter your email.",
    emailInvalid: "That email doesn't look right.",
    messageRequired: "Please tell us about your project.",
    tooLong: "That's a bit too long — please shorten it.",
  },
  pt: {
    success:
      "Obrigado — recebemos o seu briefing. Respondemos dentro de um dia útil.",
    error: "Algo correu mal ao enviar o seu pedido. Tente novamente.",
    nameRequired: "Diga-nos o seu nome.",
    emailRequired: "Indique o seu e-mail.",
    emailInvalid: "Esse e-mail não parece válido.",
    messageRequired: "Fale-nos do seu projecto.",
    tooLong: "É um pouco longo — encurte, por favor.",
  },
};

// Traduz o `ZodError` para o mapa de códigos por campo. Só o primeiro erro de
// cada campo interessa — o formulário mostra uma mensagem por campo.
export function toFieldErrors(
  issues: z.ZodError<QuoteSubmission>["issues"],
): Partial<Record<keyof QuoteSubmission, QuoteErrorCode>> {
  const fieldErrors: Partial<Record<keyof QuoteSubmission, QuoteErrorCode>> =
    {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = field as keyof QuoteSubmission;
    if (fieldErrors[key]) continue;
    if ((QUOTE_ERROR_CODES as readonly string[]).includes(issue.message)) {
      fieldErrors[key] = issue.message as QuoteErrorCode;
    }
  }

  return fieldErrors;
}
