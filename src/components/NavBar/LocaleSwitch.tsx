"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/i18n/routing";
import { currentLocale, otherLocale, swapLocale } from "@/lib/locale-href";
import Button from "../Button";

const LOCALE_META: Record<Locale, { code: string; flag: string }> = {
  en: { code: "EN", flag: "/flag-en.svg" },
  pt: { code: "PT", flag: "/flag-pt.svg" },
};

const SWITCH_LABEL: Record<Locale, string> = {
  en: "Switch to English",
  pt: "Mudar para português",
};

// O conteúdo da pílula, partilhado pelo switch e pelo fallback — é o que
// garante que os dois têm exactamente a mesma caixa.
function PillContent({ locale }: { locale: Locale }) {
  const meta = LOCALE_META[locale];

  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src={meta.flag}
        alt=""
        aria-hidden="true"
        width={23}
        height={23}
        className="size-5 shrink-0 rounded-full object-cover"
      />
      <span className="text-sm font-medium pr-1">{meta.code}</span>
    </span>
  );
}

function LocaleSwitchLink({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = currentLocale(pathname);
  const target = otherLocale(locale);

  const query = searchParams.toString();
  const href = `${swapLocale(pathname, target)}${query ? `?${query}` : ""}`;

  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link href={href} aria-label={SWITCH_LABEL[target]}>
        <PillContent locale={locale} />
      </Link>
    </Button>
  );
}

// O fallback do boundary. As páginas são pré-renderizadas (`cacheComponents`),
// por isso é **ele** que sai no HTML estático, e tem de ser um link real: sem
// JavaScript, ou até hidratar, é o único caminho para o outro idioma. O
// `usePathname` é conhecido no prerender (só o `useSearchParams` obriga ao
// boundary), por isso leva à mesma página no outro idioma; só a query string,
// que não existe no HTML estático, fica de fora até o switch completo assumir.
function LocaleSwitchFallback({
  className,
  locale,
}: {
  className?: string;
  locale: Locale;
}) {
  const pathname = usePathname();
  const target = otherLocale(locale);

  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link
        href={swapLocale(pathname, target)}
        aria-label={SWITCH_LABEL[target]}
      >
        <PillContent locale={locale} />
      </Link>
    </Button>
  );
}

// `useSearchParams` sem `<Suspense>` acima faz o Next renderizar no cliente toda
// a árvore até ao boundary mais próximo — e este componente vive no header do
// root layout, ou seja, em todas as rotas (#16). O boundary fica aqui, à volta
// só do switch, para que o resto do header possa ser pré-renderizado.
//
// O fallback é a mesma pílula, já com destino (ver acima). Mesma caixa, logo
// sem layout shift quando o boundary resolve.
export default function LocaleSwitch({
  className,
  locale,
}: {
  className?: string;
  locale: Locale;
}) {
  return (
    <Suspense
      fallback={<LocaleSwitchFallback className={className} locale={locale} />}
    >
      <LocaleSwitchLink className={className} />
    </Suspense>
  );
}
