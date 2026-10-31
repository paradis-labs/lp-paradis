import CalendlyCta from "@/components/CalendlyCta";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

// A mesma paleta do anel do `Button` — o cartão e o submit de `/get-quote` são
// as duas superfícies com shine, e lêem-se como a mesma família.
const SHINE_PALETTE = ["#5B8DEF", "#9B5BEF", "#EF5B8D", "#5BD1EF", "#5B8DEF"];

interface CallCardProps {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  className?: string;
}

// O cartão "Still have questions?" do v3: um convite a uma chamada, com
// contorno shine, por baixo de uma lista que pode não ter respondido a tudo.
//
// Recebe o CTA já resolvido e não o decide: o destino é sempre um URL
// authorado (hoje, o `secondaryCta` do hero), para o link do Calendly não
// existir duas vezes — uma no CMS e outra em código. Sem destino, quem chama
// não renderiza o cartão.
export default function CallCard({
  title,
  subtitle,
  cta,
  className,
}: CallCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-start justify-between gap-4 rounded-2xl bg-cloud px-6 py-5 md:flex-row md:items-center",
        className,
      )}
    >
      <ShineBorder borderWidth={1.25} shineColor={SHINE_PALETTE} />
      <div className="flex flex-col leading-6">
        <span className="text-base font-semibold">{title}</span>
        <span className="text-[15px] text-muted-foreground">{subtitle}</span>
      </div>
      <CalendlyCta
        variant="primary"
        size="sm"
        href={cta.href}
        textSwap
        className="relative w-full min-h-11 text-[15px] md:w-auto"
      >
        {cta.label}
      </CalendlyCta>
    </div>
  );
}
