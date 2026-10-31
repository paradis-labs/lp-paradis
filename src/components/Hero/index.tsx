import { ArrowRightDown } from "@solar-icons/react";
import type { Hero as Herotype } from "@/content";
import CalendlyCta from "../CalendlyCta";
import { GridPattern } from "../ui/grid-pattern";

interface HeroProps extends Herotype {
  // Os destinos dos dois CTAs, JÁ resolvidos pelo servidor: prefixo de locale
  // aplicado ao que é interno, `undefined` quando não há destino authorado.
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
}

const delay = (seconds: number) =>
  ({ "--enter-delay": `${seconds}s` }) as React.CSSProperties;

// O hero do v3. Server component: a entrada em sequência é uma animação de CSS
// (`[data-enter]` em `globals.css`) e corre sem JavaScript, por isso já não há
// `motion` aqui nem estado inicial serializado no HTML.
//
// O H1 entra só por deslocamento (`data-enter="solid"`): é o LCP, e um LCP com
// `opacity: 0` só conta quando aparece (`scroll-reveal-animations`, "O H1 do
// hero é pintado no primeiro frame"). O mockup anima-o com fade; o desvio é
// deliberado.
//
// O `CursorGlow` que vivia dentro do H1 saiu com o cursor novo. Levava
// `cursor: none` no título, que estragava a selecção de texto.
export default function Hero(args: HeroProps) {
  return (
    <section className="relative m-2 flex items-center justify-center overflow-hidden rounded-2xl border bg-white p-3 md:m-4 md:px-10 md:py-14 xl:px-20 xl:py-18">
      <GridPattern
        width={90}
        height={30}
        x={-1}
        y={-1}
        className="mask-[radial-gradient(ellipse_80%_80%_at_center,transparent,white)]"
      />
      <div className="relative z-10 rounded-2xl bg-white/90 p-5 text-center md:p-10">
        <div className="mx-auto flex max-w-280 flex-col items-center gap-6 py-8 md:gap-7 md:py-16">
          <h1
            data-enter="solid"
            style={delay(0.4)}
            className="gradient-text max-w-275 font-gilroy text-4xl leading-[1.18] font-bold tracking-[-0.035em] text-balance md:text-5xl md:leading-[1.12] lg:text-[56px] xl:text-[64px]"
          >
            {args.headline}
          </h1>
          <p
            data-enter
            style={delay(0.5)}
            className="max-w-135 text-lg leading-8 text-pretty text-primary"
          >
            {args.description}
          </p>
          <div
            data-enter
            style={delay(0.6)}
            // 426px é a largura do mockup, mas como mínimo e não como máximo
            // a partir de `md`: em PT os rótulos são mais compridos e, com
            // teto, o segundo CTA caía para outra linha. Abaixo de `md`
            // empilham a toda a largura, como no mockup.
            className="flex w-full max-w-106.5 flex-wrap justify-center gap-4 md:w-auto md:max-w-none md:min-w-106.5 md:flex-nowrap"
          >
            {args.primaryCta.label && (
              <CalendlyCta
                className="flex-[1_1_100%] md:flex-auto"
                variant="primary"
                href={args.primaryCtaHref}
                trailingIcon={ArrowRightDown}
                circleIcon
                textSwap
              >
                {args.primaryCta.label}
              </CalendlyCta>
            )}
            {args.secondaryCta.label && (
              <CalendlyCta
                className="flex-[1_1_100%] md:flex-auto"
                variant="outline"
                href={args.secondaryCtaHref}
                textSwap
              >
                {args.secondaryCta.label}
              </CalendlyCta>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
