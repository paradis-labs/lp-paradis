import { ArrowRight, ArrowRightDown } from "@solar-icons/react";
import { notFound } from "next/navigation";
import type React from "react";
import Button from "@/components/Button";
import CallCard from "@/components/CallCard";
import Eyebrow from "@/components/Eyebrow";
import PageHeader from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Fixture de desenvolvimento para as primitivas do v3 que servem mais de uma
// página: os botões, o `PageHeader`, o cartão de chamada e o item do FAQ.
//
// Cenários de origem, em `v3-home-reskin/specs/`:
//   v3-home-visual
//     • "Primitivas do v3 verificáveis numa fixture"     → a página inteira
//   button-hover-inversion
//     • "O preenchimento sobe em arco e o rótulo rola"   → bloco 1
//     • "Espessura constante por tamanho"                → bloco 1, linha 2
//
// O hover não está forçado — passe o rato. Com movimento reduzido ligado no
// sistema, o hover tem de saltar para o estado final sem animação.

const VARIANTS = [
  "primary",
  "outline",
  "inverted",
  "outline-inverted",
] as const;

function Block({
  title,
  note,
  dark = false,
  children,
}: {
  title: string;
  note: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-cursor-tone={dark ? "light" : undefined}
      className={
        dark
          ? "flex flex-col gap-6 rounded-2xl bg-primary p-8 text-white"
          : "flex flex-col gap-6 rounded-2xl bg-white p-8 text-foreground"
      }
    >
      <header>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs opacity-70">{note}</p>
      </header>
      {children}
    </section>
  );
}

function ButtonRows() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant={variant}
            trailingIcon={ArrowRightDown}
            circleIcon
            textSwap
          >
            {variant}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {(["sm", "default", "lg"] as const).map((size) => (
          <Button key={size} variant="outline" size={size} textSwap>
            {size}
          </Button>
        ))}
        <Button
          variant="inverted"
          trailingIcon={ArrowRight}
          circleIcon
          textSwap
          className="border-[1.5px] pl-8 font-semibold"
        >
          View All
        </Button>
      </div>
    </div>
  );
}

export default async function V3FixturePage() {
  // Primeira coisa no corpo: fora de desenvolvimento esta rota não existe.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="flex flex-col gap-8 bg-neutral-100 p-4 md:p-8">
      <header className="text-neutral-900">
        <h1 className="text-2xl font-semibold">Primitivas do v3</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-700">
          Fixture só de desenvolvimento. Cada bloco é renderizado com props
          fabricadas; nenhuma consulta ao CMS.
        </p>
      </header>

      <Block
        title="1. Botões sobre fundo claro"
        note="O painel sobe em arco e perde o arco; o rótulo e o glifo do disco rolam; o contorno não muda de espessura."
      >
        <ButtonRows />
      </Block>
      <Block
        dark
        title="1b. Botões sobre bg-primary"
        note="inverted: o painel escuro fica da cor da secção, e é o contorno branco de repouso que mantém a silhueta."
      >
        <ButtonRows />
        <div className="flex flex-wrap gap-4">
          <Eyebrow tone="dark">Our Services</Eyebrow>
        </div>
      </Block>

      <Block
        title="2. PageHeader completo"
        note="Eyebrow, H1 (entra só por deslocamento) e lead, mais uma ação à direita."
      >
        <PageHeader
          eyebrow="Our Products"
          title="Digital Products Built to Solve Real Problems"
          lead="We create innovative digital products focused on usability, performance, and real business impact."
        >
          <Button href="#" variant="primary" textSwap>
            Visit Kitenda
          </Button>
        </PageHeader>
      </Block>
      <Block
        title="2b. PageHeader só com título"
        note="Sem eyebrow nem lead: nada de pill vazia nem parágrafo em branco."
      >
        <PageHeader eyebrow="   " title="Let’s build something" />
      </Block>

      <Block
        title="3. Cartão de chamada"
        note="Contorno shine; a partir de 768px o CTA fica à direita, abaixo disso empilha a toda a largura."
      >
        <CallCard
          title="Still have questions?"
          subtitle="Talk to us on a 30-minute call."
          cta={{
            label: "Schedule a Call",
            href: "https://calendly.com/geral-paradis/30min",
          }}
        />
      </Block>

      <Block
        title="4. Itens do FAQ — aberto e fechado"
        note="O aberto tem contorno escuro, fundo e sombra, e o ícone roda; abrir o segundo fecha o primeiro. Tab + Enter também abre."
      >
        <Accordion
          type="single"
          collapsible
          defaultValue="a"
          className="flex flex-col gap-3"
        >
          <AccordionItem value="a">
            <AccordionTrigger>
              How can we start a project with Paradis?
            </AccordionTrigger>
            <AccordionContent className="text-base leading-[26px] text-muted-foreground">
              Send us a quote request or book a call — we reply within one
              business day.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>
              What services does Paradis offer?
            </AccordionTrigger>
            <AccordionContent className="text-base leading-[26px] text-muted-foreground">
              Product design, web and mobile development, integrations and AI
              solutions.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>
    </main>
  );
}
