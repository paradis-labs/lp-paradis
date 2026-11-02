import Reveal from "@/components/Reveal";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import type { Homepage } from "@/content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import SectionHeading from "../SectionHeading";
import TestimonialCard from "../TestimonialCard";

const BADGE: Record<Locale, string> = {
  en: "Testimonials",
  pt: "Testemunhos",
};

// As três colunas, em direcções alternadas. A segunda some abaixo de `md` e a
// terceira abaixo de `lg`, como no mockup v3.
const COLUMNS = [
  { id: "col-1", reverse: true, className: "" }, // desce — sempre visível
  { id: "col-2", reverse: false, className: "hidden md:block" }, // sobe — a partir de md
  { id: "col-3", reverse: true, className: "hidden lg:block" }, // desce — a partir de lg
];

// Os testemunhos: o visual do v3 (cartões, janela com fade) com o movimento
// que o site já tinha — colunas que deslizam na vertical, aceleram com a
// velocidade do scroll e pausam no hover. O mockup v3 desenha-as paradas; o
// movimento foi mantido por decisão de produto.
//
// A duplicação para encher a coluna é do `ScrollVelocityRow`, que mede a
// janela e clona só o necessário (`client-memory-budget`), e o loop pausa fora
// do ecrã (`idle-runtime-budget`).
//
// Só a primeira coluna é acessível: existe em todos os breakpoints e tem a
// lista toda. As outras são decoração e vão `aria-hidden`, para um leitor de
// ecrã não ler cada testemunho três vezes.
export default function TestimonialsSection({
  testimonials,
  locale,
}: {
  testimonials: Homepage["testimonials"];
  locale: Locale;
}) {
  const items = testimonials.items;

  return (
    <div className="flex w-full flex-col justify-start gap-12 px-5 md:px-10 xl:px-14">
      <SectionHeading
        badge={BADGE[locale]}
        title={testimonials.title}
        subtitle={testimonials.subtitle}
      />
      {items.length > 0 ? (
        <Reveal className="relative flex h-130 overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] md:h-150 lg:h-170">
          <ScrollVelocityContainer className="flex h-full w-full flex-row gap-4">
            {COLUMNS.map((column, index) => (
              <div
                key={column.id}
                aria-hidden={index > 0 ? true : undefined}
                className={cn("h-full min-w-0 flex-1", column.className)}
              >
                <ScrollVelocityRow
                  vertical
                  pauseOnHover
                  baseVelocity={2.5}
                  direction={column.reverse ? -1 : 1}
                  className="h-full"
                >
                  {items.map((testimonial) => (
                    <div
                      key={`${column.id}-${testimonial.key}`}
                      className="w-full pb-4"
                    >
                      <TestimonialCard
                        testimonial={testimonial}
                        locale={locale}
                      />
                    </div>
                  ))}
                </ScrollVelocityRow>
              </div>
            ))}
          </ScrollVelocityContainer>
        </Reveal>
      ) : null}
    </div>
  );
}
