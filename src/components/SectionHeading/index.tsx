import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import Eyebrow from "../Eyebrow";
import LitText from "../LitText";

interface SectionHeadingProps {
  badge: ReactNode;
  title?: string | null;
  subtitle?: string | null;
  // Optional trailing content (e.g. a CTA button) rendered below the text.
  children?: ReactNode;
}

// O cabeçalho das três secções do painel escuro (serviços, produtos,
// testemunhos): a pill, o título e o subtítulo, com a revelação de disparo
// único do v3.
//
// O título e o subtítulo acendem letra a letra com o scroll (`LitText`), cada
// um no seu intervalo, por isso o subtítulo acende depois do título; os dois
// acabam a branco. Não é o `TextReveal` palavra a palavra de antes: este
// efeito é CSS, sem nós de animação em JS.
export default function SectionHeading({
  badge,
  title,
  subtitle,
  children,
}: SectionHeadingProps) {
  return (
    <Reveal className="flex w-full flex-col justify-start gap-5">
      <Eyebrow tone="dark">{badge}</Eyebrow>
      <div className="flex flex-col gap-3 text-white">
        {title ? (
          <h2 className="max-w-190 font-gilroy text-[26px] leading-[1.2] font-medium tracking-[-0.02em] text-balance md:text-[30px] lg:text-4xl">
            <LitText text={title} tone="dark" />
          </h2>
        ) : null}
        {subtitle ? (
          <p className="max-w-180 text-lg leading-[30px]">
            <LitText text={subtitle} tone="dark" />
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-1">{children}</div> : null}
    </Reveal>
  );
}
