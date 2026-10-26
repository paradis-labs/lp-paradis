// Os tipos de domínio do conteúdo do site.
//
// **Desenhados a partir do que a UI consome, não do schema do CMS.** Nada aqui
// sabe que o Payload existe: não há ids numéricos, não há relações `id | objeto`,
// não há árvores Lexical. É isto que permite trocar de CMS (Directus, na fase 3
// de `migrate-cms-to-directus`) sem tocar num único componente — o provider é
// que se dobra a estes tipos, nunca o contrário.
//
// Duas regras, ambas para o #8 (tipos demasiado opcionais escondiam o que era
// obrigatório):
//
//   • `T | null` só onde o editor pode deixar o campo vazio e a UI tem piso
//     declarado para isso. O que a UI precisa para fazer sentido — o `url` de
//     uma media, o `url` de um projecto — é obrigatório, e o provider descarta
//     o item que não o tenha.
//   • Listas são sempre arrays, vazios quando não há itens. Nunca `null`.
//
// Os nomes de campo seguem os que os componentes já liam, de propósito: a
// costura muda de onde os dados vêm, não como a UI os chama.

/** Identificador opaco, estável entre pedidos. Serve `key` e âncoras de UI. */
export type ContentKey = string;

/**
 * HTML de rich text já sanitizado. O tipo marcado é o que garante que só HTML
 * que passou por `toRichText` chega a um `dangerouslySetInnerHTML`.
 */
export type RichText = string & { readonly __brand: "RichText" };

export type Media = {
  /**
   * Já resolvido pelo provider: `/cdn/<chave>` com o Payload,
   * `${CMS_URL}/assets/<id>` com o hcms.
   */
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export type Cta = {
  label: string | null;
  url: string | null;
};

// ── Navbar ─────────────────────────────────────────────────────────────────

export type NavLink = {
  key: ContentKey;
  label: string;
  url: string;
  openInNewTab: boolean;
};

export type NavButton = {
  key: ContentKey;
  label: string;
  /** Pode vir vazio: o `Header` renderiza então um botão inerte. */
  url: string;
  variant: "primary" | "outline";
  openInNewTab: boolean;
};

export type NavBar = {
  logo: {
    image: Media | null;
    imageLight: Media | null;
    url: string | null;
    width: number | null;
    height: number | null;
  } | null;
  links: NavLink[];
  buttons: NavButton[];
};

// ── Footer ─────────────────────────────────────────────────────────────────

export type FooterSocialPlatform =
  | "dribbble"
  | "linkedin"
  | "instagram"
  | "github"
  | "twitter"
  | "facebook"
  | "youtube"
  | "discord"
  | "whatsapp"
  | "other";

export type FooterSocialLink = {
  key: ContentKey;
  platform: FooterSocialPlatform;
  url: string;
  /** O nome acessível do link, não texto visível. */
  label: string;
};

export type FooterLink = {
  key: ContentKey;
  name: string;
  href: string;
  isExternal: boolean;
};

export type FooterLinkGroup = {
  key: ContentKey;
  title: string;
  links: FooterLink[];
};

export type FooterButton = {
  label: string | null;
  href: string | null;
};

export type Footer = {
  logo: Media | null;
  tagline: string | null;
  directContact: {
    reachHeading: string | null;
    emailHeading: string | null;
    socialHeading: string | null;
  };
  linkGroups: FooterLinkGroup[];
  cta: {
    heading: string | null;
    primaryButton: FooterButton;
    outlineButton: FooterButton;
  };
  copyrightText: string | null;
  socialLinks: FooterSocialLink[];
};

// A prop da faixa de contacto direto do footer: a junção das suas duas fontes.
// Os títulos vêm do grupo `directContact` do footer, que é cópia traduzível; o
// e-mail vem do contacto da empresa, que é um facto com dono próprio e não se
// traduz.
//
// O nome difere do grupo do CMS de propósito — `contactBand` aqui,
// `directContact` lá. São formas diferentes com o mesmo conteúdo nominal, e com
// o mesmo nome a interseção `Footer & { ... }` no componente exigiria as duas
// ao mesmo tempo, o que nenhum valor satisfaz.
//
// Os títulos entram crus, tal como todos os outros textos do footer: o piso é
// aplicado dentro do componente, que já é onde vivem os pisos da tagline, do
// heading do CTA e dos rótulos dos botões.
export type FooterContactBand = {
  reachHeading?: string | null;
  socialHeading?: string | null;
  /** Ausente quando não há contacto com e-mail. */
  email?: string | null;
};

// ── Contacto da empresa ────────────────────────────────────────────────────

export type Contact = {
  email: string | null;
};

// ── Coleções referidas pelas páginas ──────────────────────────────────────

export type Hero = {
  headline: string;
  subheadline: string | null;
  description: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  backgroundImage: Media | null;
};

export type Service = {
  key: ContentKey;
  title: string;
  slug: string;
  shortDescription: string | null;
};

export type Project = {
  key: ContentKey;
  title: string;
  description: string;
  coverImage: Media | null;
  /** Destino externo do projecto. Um projecto sem ele não é renderizado. */
  url: string;
  /** O rótulo do link do card. Vazio, a UI usa o seu piso ("Discover More"). */
  linkLabel: string | null;
};

export type TestimonialSocial =
  | "instagram"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "youtube"
  | "github"
  | "whatsapp"
  | "discord"
  | "other";

export type Testimonial = {
  key: ContentKey;
  authorName: string;
  tag: string;
  social: TestimonialSocial;
  avatar: Media | null;
  quote: string;
  /** ISO 8601. Hoje é a data da última edição do testemunho no CMS. */
  date: string;
};

export type Faq = {
  key: ContentKey;
  question: string;
  answer: RichText;
};

// ── Homepage ───────────────────────────────────────────────────────────────

type Section<T> = {
  enabled: boolean;
  title: string | null;
  subtitle: string | null;
  items: T[];
};

export type Homepage = {
  hero: { enabled: boolean; item: Hero | null };
  services: Section<Service> & {
    ourServicesCT: {
      title: string | null;
      description: string | null;
      backgroundVideo: Media | null;
    };
    primaryCta: Cta;
  };
  projects: Section<Project> & { primaryCta: Cta };
  testimonials: Section<Testimonial>;
  faqs: Section<Faq>;
};

// ── Página de orçamento ────────────────────────────────────────────────────

export type QuotePage = {
  seo: { metaTitle: string | null; metaDescription: string | null };
  hero: { headline: string | null; intro: string | null };
  availability: {
    /** Só `false` explícito no CMS desliga a pill. */
    enabled: boolean;
    label: string | null;
    location: string | null;
  };
  form: {
    /** Só `false` explícito no CMS desliga o formulário. */
    enabled: boolean;
    eyebrow: string | null;
    nameLabel: string | null;
    emailLabel: string | null;
    interestsLabel: string | null;
    interests: Service[];
    messageLabel: string | null;
    submitLabel: string | null;
    privacyNote: string | null;
    messages: {
      success: string | null;
      error: string | null;
      nameRequired: string | null;
      emailRequired: string | null;
      emailInvalid: string | null;
      messageRequired: string | null;
      tooLong: string | null;
    };
  };
};

// ── Escrita ────────────────────────────────────────────────────────────────

export type QuoteRequestInput = {
  name: string;
  email: string;
  message: string;
  /** Os serviços escolhidos, já resolvidos por `findServicesBySlugs`. */
  services: Service[];
  submittedLocale: string;
};
