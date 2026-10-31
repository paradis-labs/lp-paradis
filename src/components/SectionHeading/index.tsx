import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import Eyebrow from "../Eyebrow";

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
// O título deixou de ser `TextReveal` palavra a palavra: o v3 revela o bloco
// inteiro, e o efeito por palavra criava dois nós de animação por palavra.
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
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="max-w-180 text-lg leading-[30px] text-white/64">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-1">{children}</div> : null}
    </Reveal>
  );
}
