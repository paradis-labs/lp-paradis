import type { LucideIcon } from "lucide-react";
import { Dribbble, Instagram, Linkedin } from "lucide-react";
import type { FooterSocialLink } from "@/content";

type Platform = FooterSocialLink["platform"];

// Os ícones das redes, partilhados pelo footer e pelo aside de `/get-quote`.
//
// Só as três plataformas que o mockup pede. O conjunto é fechado em código de
// propósito: um mapa aberto sobre um namespace (`Icons[nome]` em cima de um
// `import * as`) impede o tree-shaking, e é o erro que `Button/index.tsx`
// documentava ter custado 12,7 MB. Plataforma fora do mapa cai no nome
// visível, então acrescentar uma é um import a mais e nada além disso.
export const SOCIAL_ICONS: Partial<Record<Platform, LucideIcon>> = {
  dribbble: Dribbble,
  linkedin: Linkedin,
  instagram: Instagram,
};

// O nome visível de cada plataforma. Cobre nove contra os três ícones, e a
// diferença não é descuido: um ícone é um import de componente e paga bundle,
// uma string paga bytes.
//
// `other` fica **deliberadamente de fora** — não há nome de marca a derivar de
// "outro". Só nesse caso o link cai no `label`, que é cópia imperfeita por ser o
// nome acessível, mas visível. Omitir o link seria o pior modo de falha.
//
// Isto não vem do CMS de propósito: o `label` é o nome acessível ("Paradis on
// LinkedIn"), e pô-lo à vista mostraria essa frase dentro da pill. Nomes de
// marca também não se traduzem, então derivar em código não custa localização.
const SOCIAL_NAMES: Partial<Record<Platform, string>> = {
  dribbble: "Dribbble",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  github: "GitHub",
  twitter: "Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  discord: "Discord",
  whatsapp: "WhatsApp",
};

/** O nome visível de uma rede: o da plataforma, ou o `label` para `other`. */
export function socialName(social: FooterSocialLink): string {
  return SOCIAL_NAMES[social.platform] ?? social.label;
}
