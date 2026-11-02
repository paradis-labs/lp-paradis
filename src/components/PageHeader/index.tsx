import Eyebrow from "@/components/Eyebrow";
import LitText from "@/components/LitText";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

// O lead do v3 é bicolor: a primeira frase no tom do texto, o resto em `mist`.
// O CMS dá uma só string, por isso o corte é na primeira pontuação final
// seguida de espaço; sem segunda frase, o lead fica todo no primeiro tom.
function splitLead(lead: string): [string, string | null] {
  const match = /^(.+?[.!?])\s+(\S[\s\S]*)$/.exec(lead.trim());
  return match ? [match[1], match[2]] : [lead, null];
}

interface PageHeaderProps {
  eyebrow?: string | null;
  /** No lugar do eyebrow: o breadcrumb do detalhe de produto. */
  breadcrumb?: React.ReactNode;
  title: string;
  lead?: string | null;
  /** Ações à direita do título (ex.: o CTA "Visit" do detalhe de produto). */
  children?: React.ReactNode;
  className?: string;
}

// O cabeçalho das páginas que não são a home no v3 (Products, Get Quote e o
// detalhe de produto do canvas): um cartão com contorno sobre a grelha de
// 90×30 mascarada a partir do canto superior direito, a pill, o H1 e o lead.
// As medidas são as do `.work-head` do canvas: padding de 88/80/72px a partir
// de 768px (40/20px abaixo), coluna do título até 1000px, 40px até às ações,
// e o H1 a 72px, 56px abaixo de 1024px e 40px abaixo de 768px.
//
// Server component, e a entrada é a mesma do hero (`data-enter`, só CSS): o H1
// é o LCP destas páginas e entra só por deslocamento, pela mesma razão.
//
// O lead acende letra a letra ao carregar (`LitText mode="enter"`), e não com
// o scroll: acima da dobra, o modo de scroll abria-o meio cinzento. O H1 não
// acende, porque o `gradient-text` ignora a opacidade das letras.
export default function PageHeader({
  eyebrow,
  breadcrumb,
  title,
  lead,
  children,
  className,
}: PageHeaderProps) {
  const [leadFirst, leadRest] = lead?.trim() ? splitLead(lead) : ["", null];
  return (
    <section
      className={cn(
        "relative m-2 overflow-hidden rounded-2xl border bg-white px-5 py-10 md:m-4 md:px-20 md:pt-22 md:pb-18",
        className,
      )}
    >
      <GridPattern
        width={90}
        height={30}
        x={-1}
        y={-1}
        className="mask-[radial-gradient(ellipse_70%_90%_at_100%_0%,white,transparent)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7">
        {breadcrumb ? (
          <div
            data-enter
            style={{ "--enter-delay": "0.4s" } as React.CSSProperties}
          >
            {breadcrumb}
          </div>
        ) : eyebrow?.trim() ? (
          <div
            data-enter
            style={{ "--enter-delay": "0.4s" } as React.CSSProperties}
          >
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        {/* O H1 e o lead são uma coluna, e as ações alinham com o fundo dela:
            ao lado do lead, e não do título. */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end lg:gap-10">
          <div className="flex max-w-250 flex-col gap-4">
            <h1
              data-enter="solid"
              style={{ "--enter-delay": "0.5s" } as React.CSSProperties}
              className="gradient-text pb-1.5 font-gilroy text-[40px] leading-[1.05] font-bold tracking-[-0.04em] text-balance md:text-[56px] lg:text-[72px]"
            >
              {title}
            </h1>
            {lead?.trim() ? (
              <p
                data-enter
                style={{ "--enter-delay": "0.6s" } as React.CSSProperties}
                className="max-w-155 text-xl leading-8 text-pretty text-primary"
              >
                <LitText
                  mode="enter"
                  tone="inherit"
                  delay={0.7}
                  span={1.2}
                  text={
                    leadRest
                      ? [
                          { text: leadFirst },
                          { text: leadRest, className: "text-mist" },
                        ]
                      : leadFirst
                  }
                />
              </p>
            ) : null}
          </div>
          {children ? (
            <div
              data-enter
              style={{ "--enter-delay": "0.7s" } as React.CSSProperties}
              className="shrink-0"
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
