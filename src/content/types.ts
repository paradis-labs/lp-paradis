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
  /** Já resolvido pelo provider: `${CMS_URL}/assets/<id>/<nome>`. */
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
  /**
   * As redes do site, as mesmas do footer e pela mesma ordem. O menu mobile do
   * v3 mostra-as na barra inferior.
   */
  socialLinks: FooterSocialLink[];
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
  /**
   * O slug da página de detalhe (`/products/<slug>`), o de `en-US` nos dois
   * idiomas. `null` num projecto sem slug: o cartão abre então o site externo.
   */
  slug: string | null;
  /** O nome da categoria no locale pedido ("Fintech · Prepaid cards"). */
  category: string | null;
  tags: string[];
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

// ── Página de produtos ─────────────────────────────────────────────────────

/**
 * A listagem `/products`. O cabeçalho é o do bloco `#products` da home — o
 * mesmo texto que a secção mostra —, por isso não há página própria no CMS.
 */
export type ProductsPage = {
  eyebrow: string | null;
  title: string | null;
  lead: string | null;
  items: Project[];
};

// ── Detalhe de produto ─────────────────────────────────────────────────────

/** Os ícones dos cartões de características: o `select` `steps[].icon` do hcms. */
export const PRODUCT_ICONS = [
  "swap",
  "trend",
  "shield",
  "calculator",
  "globe",
  "clock",
] as const;

export type ProductIcon = (typeof PRODUCT_ICONS)[number];

export type ProductStep = {
  /** `null` sem ícone, ou com um valor fora de `PRODUCT_ICONS`. */
  icon: ProductIcon | null;
  title: string;
  body: string | null;
};

/**
 * O projecto com os campos da página `/products/<slug>`. Todos opcionais: um
 * projecto sem eles é uma página com cabeçalho, capa e ficha.
 */
export type ProductDetail = Project & {
  market: string | null;
  platform: string | null;
  challenge: string | null;
  solution: string | null;
  steps: ProductStep[];
  gallery: Media[];
  /** `null` sem testemunho ligado, ou com ele em rascunho. */
  testimonial: Testimonial | null;
};

export type ProductPage = {
  product: ProductDetail;
  /** Os outros projectos do site, para "More Products". */
  others: Project[];
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
    /**
     * O campo de empresa, opcional. `null` quando o formulário do hcms não
     * declara um campo `company`: a página não o mostra, e a escrita não o
     * envia.
     */
    company: { label: string | null } | null;
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
  /**
   * A empresa, aparada. `null` quando vazia. Só chega ao hcms se o formulário
   * declarar o campo — quem decide é o provider, na escrita.
   */
  company: string | null;
  /** Os serviços escolhidos, já resolvidos por `findServicesBySlugs`. */
  services: Service[];
  submittedLocale: string;
};
