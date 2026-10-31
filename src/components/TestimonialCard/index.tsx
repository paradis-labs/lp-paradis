import {
  SiDiscord,
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { Globe } from "lucide-react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import type { Testimonial } from "@/content";
import type { Locale } from "@/i18n/routing";

type IconComponent = ComponentType<{ className?: string }>;

// LinkedIn was removed from Simple Icons (legal takedown), so we inline its logo.
function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>LinkedIn</title>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<Testimonial["social"], IconComponent> = {
  instagram: SiInstagram,
  linkedin: LinkedinIcon,
  twitter: SiX,
  facebook: SiFacebook,
  youtube: SiYoutube,
  github: SiGithub,
  whatsapp: SiWhatsapp,
  discord: SiDiscord,
  other: Globe,
};

// Só a data, como no v3 ("Sep 4, 2026"). A data é a do domínio — a última
// edição do testemunho no CMS — e nunca a de hoje.
function formatTestimonialDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

// As iniciais do autor, para quando o testemunho não tem avatar.
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function QuoteMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,0.24)"
      aria-hidden="true"
    >
      <path d="M4 18h6v-6H6c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6zm10 0h6v-6h-4c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6z" />
    </svg>
  );
}

export default function TestimonialCard({
  testimonial,
  locale,
}: {
  testimonial: Testimonial;
  locale: Locale;
}) {
  const SocialIcon = SOCIAL_ICONS[testimonial.social] ?? Globe;

  return (
    <figure className="m-0 flex flex-col gap-4 rounded-[20px] border border-white/10 bg-white/4 p-6">
      <QuoteMark />
      <blockquote className="m-0 text-base leading-[26px] text-white/82">
        {testimonial.quote}
      </blockquote>
      <figcaption className="flex items-center gap-2.5 border-t border-white/8 pt-4">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar.url}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#4b5563] text-xs font-semibold text-white"
          >
            {initials(testimonial.authorName)}
          </span>
        )}
        <div className="flex flex-1 flex-col leading-[18px]">
          <span className="text-sm font-semibold text-white">
            {testimonial.authorName}
          </span>
          <span className="text-xs text-white/56">
            {testimonial.tag} ·{" "}
            <time dateTime={testimonial.date}>
              {formatTestimonialDate(testimonial.date, locale)}
            </time>
          </span>
        </div>
        <span className="inline-flex size-7 items-center justify-center rounded-md border border-white/16 text-white/70">
          <SocialIcon className="size-3.5" />
        </span>
      </figcaption>
    </figure>
  );
}
