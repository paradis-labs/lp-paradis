import Reveal from "@/components/Reveal";
import type { FooterSocialLink } from "@/content";
import type { Locale } from "@/i18n/routing";
import { textOr } from "@/lib/cms-text";
import { SOCIAL_ICONS, socialName } from "@/lib/social-platforms";
import CalendlyCta from "../CalendlyCta";
import RollText from "../RollText";

// Os dois primeiros são pisos de campos do CMS (`directContact` do footer),
// vindos da faixa que o footer desta rota tinha. Os dois últimos são cópia de
// UI sem campo no hcms.
const COPY: Record<
  Locale,
  {
    reachHeading: string;
    socialHeading: string;
    callHeading: string;
    callNote: string;
  }
> = {
  en: {
    reachHeading: "Reach Us Directly",
    socialHeading: "Elsewhere",
    callHeading: "Prefer to talk?",
    callNote: "30 minutes, no commitment.",
  },
  pt: {
    reachHeading: "Fale connosco directamente",
    socialHeading: "Noutros sítios",
    callHeading: "Prefere falar?",
    callNote: "30 minutos, sem compromisso.",
  },
};

export interface QuoteContactAsideProps {
  locale: Locale;
  /** Os títulos crus de `directContact` do footer; o piso é aplicado aqui. */
  reachHeading: string | null;
  socialHeading: string | null;
  /** De `Contact.email`; ausente, o grupo não renderiza. */
  email: string | null;
  /** O botão `outline` do CTA do footer, já com o prefixo de locale. */
  call: { label: string; href: string } | null;
  socialLinks: FooterSocialLink[];
}

/** O aside só existe quando tem pelo menos um grupo. */
export function hasContactAside({
  email,
  call,
  socialLinks,
}: Pick<QuoteContactAsideProps, "email" | "call" | "socialLinks">) {
  return Boolean(email?.trim() || call || socialLinks.length > 0);
}

// O aside de contacto de `/get-quote` (`quote-contact-aside`): e-mail, chamada
// e redes, ao lado do formulário. Herda o conteúdo da faixa de contacto que o
// footer desta rota tinha, com as mesmas fontes e as mesmas regras — o e-mail é
// do `Contact`, os títulos do `directContact`, o nome visível das redes deriva
// da plataforma e o `label` authorado é o nome acessível.
//
// Cada grupo cai sozinho quando não tem conteúdo, com o título junto: um título
// sem o que ele anuncia é pior que a ausência do grupo. Quem chama decide se o
// aside existe de todo (`hasContactAside`).
export default function QuoteContactAside({
  locale,
  reachHeading,
  socialHeading,
  email,
  call,
  socialLinks,
}: QuoteContactAsideProps) {
  const copy = COPY[locale];
  const address = email?.trim();
  const groups: { key: string; node: React.ReactNode }[] = [];

  if (address) {
    groups.push({
      key: "reach",
      node: (
        <div className="flex flex-col gap-2.5">
          <span className="text-sm text-white/64">
            {textOr(reachHeading, copy.reachHeading)}
          </span>
          {/* `mailto:` não é rota: não leva prefixo de locale nem é um `Link`. */}
          <a
            href={`mailto:${address}`}
            className="inline-flex items-center gap-2 self-start font-gilroy text-[26px] leading-[1.2] font-medium tracking-[-0.01em] break-all text-white"
          >
            <RollText>{address}</RollText>
            <span className="roll-arrow text-lg" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      ),
    });
  }

  if (call) {
    groups.push({
      key: "call",
      node: (
        <div className="flex flex-col gap-3.5">
          <span className="text-sm text-white/64">{copy.callHeading}</span>
          <CalendlyCta
            variant="outline-inverted"
            href={call.href}
            textSwap
            className="self-start px-6.5"
          >
            {call.label}
          </CalendlyCta>
          <span className="text-sm leading-[22px] text-white/56">
            {copy.callNote}
          </span>
        </div>
      ),
    });
  }

  if (socialLinks.length > 0) {
    groups.push({
      key: "social",
      node: (
        <div className="flex flex-col gap-3.5">
          <span className="text-sm text-white/64">
            {textOr(socialHeading, copy.socialHeading)}
          </span>
          {/* Pela ordem authorada, como na barra inferior do footer. */}
          <ul className="flex list-none flex-wrap gap-2.5 p-0">
            {socialLinks.map((social) => {
              const Icon = SOCIAL_ICONS[social.platform];
              return (
                <li key={social.key}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/16 pr-4.5 pl-3.5 text-sm font-medium text-white transition-colors duration-200 hover:border-white/50"
                  >
                    {Icon && <Icon aria-hidden="true" className="size-4" />}
                    <RollText>{socialName(social)}</RollText>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ),
    });
  }

  return (
    <Reveal
      as="aside"
      data-cursor-tone="light"
      className="relative flex flex-col gap-8 overflow-hidden rounded-2xl bg-primary px-5 py-7 text-white md:px-8 md:py-9 lg:sticky lg:top-28"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full mask-[radial-gradient(ellipse_90%_60%_at_100%_0%,black,transparent)]"
      >
        <defs>
          <pattern
            id="quote-aside-grid"
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
        <rect width="100%" height="100%" fill="url(#quote-aside-grid)" />
      </svg>
      {groups.map((group, index) => (
        <div
          key={group.key}
          className={
            index > 0 ? "relative border-t border-white/12 pt-7" : "relative"
          }
        >
          {group.node}
        </div>
      ))}
    </Reveal>
  );
}
