"use client";

import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

// O item do FAQ do v3: contorno de 1,5px que escurece, fundo e sombra quando
// aberto. O estado vem do `data-state` que o Radix escreve, e não de uma prop,
// para aparência e `aria-expanded` não poderem divergir.
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/item rounded-2xl border-[1.5px] border-border bg-white transition-[border-color,background-color,box-shadow] duration-400 ease-soft data-[state=open]:border-primary data-[state=open]:bg-snow data-[state=open]:shadow-[0_12px_32px_-16px_rgba(21,23,24,0.25)] motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

// O ícone de mais/menos do v3: o traço vertical encolhe para zero ao abrir, e
// o disco escurece e roda meia volta.
function PlusMinus() {
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-[background-color,color,transform] duration-[400ms,400ms,450ms] ease-soft group-hover/trigger:scale-108 group-data-[state=open]/item:rotate-180 group-data-[state=open]/item:bg-primary group-data-[state=open]/item:text-white motion-reduce:transition-none">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 12h12" />
        <path
          d="M12 6v12"
          className="origin-center transition-transform duration-450 ease-soft group-data-[state=open]/item:scale-y-0 motion-reduce:transition-none"
        />
      </svg>
    </span>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger flex min-h-16 flex-1 cursor-pointer items-center justify-between gap-4 rounded-2xl px-6 py-[18px] text-left text-[17px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
        {...props}
      >
        {children}
        <PlusMinus />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// O conteúdo abre por `grid-template-rows` (`.faq-body` em `globals.css`), não
// por `height`: a altura nunca é animada, e o filho com `min-h-0` é que se
// deixa recortar. Keyframes e não transição, porque o Radix só desmonta o
// conteúdo fechado no `animationend`.
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="faq-body"
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn("faq-text px-6 pb-[22px]", className)}>
          {children}
        </div>
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
