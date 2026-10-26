import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { type BasePayload, getPayload } from "payload";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { toRichText } from "../rich-text";
import type {
  Contact,
  Cta,
  Faq,
  Footer,
  FooterLinkGroup,
  FooterSocialLink,
  Hero,
  Homepage,
  Media,
  NavBar,
  NavButton,
  NavLink,
  Project,
  QuotePage,
  QuoteRequestInput,
  Service,
  Testimonial,
} from "../types";

// O provider Payload: o único ficheiro do site que fala com o Payload para ler
// ou gravar conteúdo (as exceções são `payload.config.ts`, `collections/` e o
// route group `(payload)`, que SÃO o Payload).
//
// Cada leitura faz o mesmo percurso: Local API → validação zod da resposta crua
// → mapeamento para o tipo de domínio. Nada de `as T` — era isso que deixava
// passar respostas com a forma errada sem aviso (#4).
//
// **Como os erros se comportam**, e porquê:
//   • Falha de transporte ou global inteira inválida → lança. A página cai no
//     error boundary do Next. Engolir o erro serviria uma página vazia com 200,
//     e na fase 0b essa página vazia ficaria em cache.
//   • Item inválido dentro de uma lista → descartado e registado, e o resto da
//     lista renderiza. Um projecto sem `url` não pode levar a homepage com ele.

// Slugs das globals do Payload. Não saem deste ficheiro: são detalhe do CMS.
const GLOBALS = {
  navBar: "menu",
  footer: "footer",
  homepage: "homepage",
  getQuote: "get-quote-page",
} as const;

type GlobalSlug = (typeof GLOBALS)[keyof typeof GLOBALS];

let payloadInstance: BasePayload | null = null;

// Memoizado ao nível do módulo: `getPayload` inicializa o Payload inteiro
// (config, adaptador de Postgres, storage), e isso não pode acontecer a cada
// pedido.
async function getPayloadInstance(): Promise<BasePayload> {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  return payloadInstance;
}

// ── Diagnóstico ────────────────────────────────────────────────────────────

type Where = { slug: string; locale: Locale };

function reportDropped(
  where: Where,
  path: string,
  item: unknown,
  issues: z.core.$ZodIssue[],
) {
  const id =
    item && typeof item === "object" && "id" in item
      ? String((item as { id: unknown }).id)
      : undefined;
  console.error("[content] item inválido descartado", {
    ...where,
    path,
    id,
    fields: issues.map((issue) => issue.path.join(".")),
  });
}

// Valida item a item: o que falhar sai da lista, registado, e não arrasta os
// outros. Um item não populado (um id em vez de um objeto) também falha — a
// `depth` não chegou lá, e um id não serve a nenhum componente.
function parseList<S extends z.ZodType>(
  schema: S,
  raw: unknown,
  where: Where,
  path: string,
): z.infer<S>[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const result = schema.safeParse(item);
    if (result.success) return [result.data];
    reportDropped(where, path, item, result.error.issues);
    return [];
  });
}

// Uma global inteira inválida não tem item para descartar: é um erro.
function parseGlobal<S extends z.ZodType>(
  schema: S,
  raw: unknown,
  where: Where,
): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `[content] global "${where.slug}" (${where.locale}) inválida: ${result.error.issues
        .map((issue) => issue.path.join(".") || "(raiz)")
        .join(", ")}`,
    );
  }
  return result.data;
}

// ── Peças partilhadas ──────────────────────────────────────────────────────

const id = z.union([z.number(), z.string()]);
const text = z.string().nullish();

// Media que não esteja populada, ou sem `url`, vale `null`: não há imagem a
// mostrar, e o componente usa o seu piso. Não é erro — é um campo de upload
// vazio, que o editor pode deixar assim.
const rawMedia = z.unknown().transform((value): Media | null => {
  const media = z
    .object({
      url: z.string().min(1),
      alt: text,
      width: z.number().nullish(),
      height: z.number().nullish(),
    })
    .safeParse(value);
  if (!media.success) return null;
  return {
    url: media.data.url,
    alt: media.data.alt ?? null,
    width: media.data.width ?? null,
    height: media.data.height ?? null,
  };
});

const rawCta = z
  .object({ label: text, url: text })
  .nullish()
  .transform(
    (cta): Cta => ({ label: cta?.label ?? null, url: cta?.url ?? null }),
  );

// O grupo de secção da homepage. O Payload devolve sempre o objeto do grupo,
// mesmo vazio — mas `nullish` cobre um documento criado antes do campo existir,
// e por isso quem lê usa `?.`.
function section<S extends z.ZodRawShape>(extra: S) {
  return z
    .object({
      enabled: z.boolean().nullish(),
      title: text,
      subtitle: text,
      items: z.array(z.unknown()).nullish(),
      ...extra,
    })
    .nullish();
}

// ── Coleções ───────────────────────────────────────────────────────────────

const rawService = z.object({
  id,
  title: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: text,
});

function toService(raw: z.infer<typeof rawService>): Service {
  return {
    key: String(raw.id),
    title: raw.title,
    slug: raw.slug,
    shortDescription: raw.shortDescription ?? null,
  };
}

const rawProject = z.object({
  id,
  title: z.string(),
  description: z.string(),
  coverImage: rawMedia,
  url: z.string().min(1),
});

const rawTestimonial = z.object({
  id,
  authorName: z.string(),
  tag: z.string(),
  social: z.enum([
    "instagram",
    "linkedin",
    "twitter",
    "facebook",
    "youtube",
    "github",
    "whatsapp",
    "discord",
    "other",
  ]),
  avatar: rawMedia,
  quote: z.string(),
  updatedAt: z.string(),
});

const rawFaq = z.object({
  id,
  question: z.string(),
  // A árvore Lexical. A forma interna é do conversor; aqui basta haver raiz.
  answer: z.object({ root: z.object({}).loose() }).loose(),
});

const rawHero = z.object({
  headline: z.string(),
  subheadline: text,
  description: z.string(),
  primaryCta: rawCta,
  secondaryCta: rawCta,
  backgroundImage: rawMedia,
});

function toHero(raw: z.infer<typeof rawHero>): Hero {
  return {
    headline: raw.headline,
    subheadline: raw.subheadline ?? null,
    description: raw.description,
    primaryCta: raw.primaryCta,
    secondaryCta: raw.secondaryCta,
    backgroundImage: raw.backgroundImage,
  };
}

// ── Globals ────────────────────────────────────────────────────────────────

async function readGlobal(slug: GlobalSlug, locale: Locale): Promise<unknown> {
  const payload = await getPayloadInstance();
  // `depth: 2` popula as relações de primeiro nível e as medias dentro delas
  // (a homepage → projecto → coverImage).
  return payload.findGlobal({ slug, depth: 2, locale });
}

const rawNavBar = z.object({
  logo: z
    .object({
      image: rawMedia,
      imageLight: rawMedia,
      url: text,
      width: z.number().nullish(),
      height: z.number().nullish(),
    })
    .nullish(),
  links: z.array(z.unknown()).nullish(),
  buttons: z.array(z.unknown()).nullish(),
});

const rawNavLink = z.object({
  id: id.nullish(),
  label: z.string(),
  url: z.string(),
  openInNewTab: z.boolean().nullish(),
});

const rawNavButton = z.object({
  id: id.nullish(),
  label: z.string(),
  // Vazio é válido: o `Header` renderiza um botão inerte.
  url: z.string().nullish(),
  variant: z.enum(["primary", "outline"]).nullish(),
  openInNewTab: z.boolean().nullish(),
});

export async function getNavBar(locale: Locale): Promise<NavBar> {
  const where = { slug: GLOBALS.navBar, locale };
  const raw = parseGlobal(
    rawNavBar,
    await readGlobal(where.slug, locale),
    where,
  );

  return {
    logo: raw.logo
      ? {
          image: raw.logo.image,
          imageLight: raw.logo.imageLight,
          url: raw.logo.url ?? null,
          width: raw.logo.width ?? null,
          height: raw.logo.height ?? null,
        }
      : null,
    links: parseList(rawNavLink, raw.links, where, "links").map(
      (link, index): NavLink => ({
        key: String(link.id ?? `${index}:${link.url}`),
        label: link.label,
        url: link.url,
        openInNewTab: link.openInNewTab ?? false,
      }),
    ),
    buttons: parseList(rawNavButton, raw.buttons, where, "buttons").map(
      (button, index): NavButton => ({
        key: String(button.id ?? `${index}:${button.label}`),
        label: button.label,
        url: button.url ?? "",
        variant: button.variant ?? "primary",
        openInNewTab: button.openInNewTab ?? false,
      }),
    ),
  };
}

const rawFooterButton = z
  .object({ label: text, href: text })
  .nullish()
  .transform((button) => ({
    label: button?.label ?? null,
    href: button?.href ?? null,
  }));

const rawFooter = z.object({
  logo: rawMedia,
  tagline: text,
  directContact: z
    .object({ reachHeading: text, emailHeading: text, socialHeading: text })
    .nullish(),
  linkGroups: z.array(z.unknown()).nullish(),
  cta: z
    .object({
      heading: text,
      primaryButton: rawFooterButton,
      outlineButton: rawFooterButton,
    })
    .nullish(),
  copyrightText: text,
  socialLinks: z.array(z.unknown()).nullish(),
});

const rawFooterLinkGroup = z.object({
  id: id.nullish(),
  title: z.string(),
  links: z.array(z.unknown()).nullish(),
});

const rawFooterLink = z.object({
  id: id.nullish(),
  name: z.string(),
  href: z.string(),
  isExternal: z.boolean().nullish(),
});

const rawFooterSocial = z.object({
  id: id.nullish(),
  platform: z.enum([
    "dribbble",
    "linkedin",
    "instagram",
    "github",
    "twitter",
    "facebook",
    "youtube",
    "discord",
    "whatsapp",
    "other",
  ]),
  url: z.string(),
  label: z.string(),
});

export async function getFooter(locale: Locale): Promise<Footer> {
  const where = { slug: GLOBALS.footer, locale };
  const raw = parseGlobal(
    rawFooter,
    await readGlobal(where.slug, locale),
    where,
  );

  const linkGroups = parseList(
    rawFooterLinkGroup,
    raw.linkGroups,
    where,
    "linkGroups",
  ).map(
    (group, index): FooterLinkGroup => ({
      key: String(group.id ?? `${index}:${group.title}`),
      title: group.title,
      links: parseList(
        rawFooterLink,
        group.links,
        where,
        `linkGroups.${index}.links`,
      ).map((link, linkIndex) => ({
        key: String(link.id ?? `${linkIndex}:${link.href}`),
        name: link.name,
        href: link.href,
        isExternal: link.isExternal ?? false,
      })),
    }),
  );

  return {
    logo: raw.logo,
    tagline: raw.tagline ?? null,
    directContact: {
      reachHeading: raw.directContact?.reachHeading ?? null,
      emailHeading: raw.directContact?.emailHeading ?? null,
      socialHeading: raw.directContact?.socialHeading ?? null,
    },
    linkGroups,
    cta: {
      heading: raw.cta?.heading ?? null,
      primaryButton: raw.cta?.primaryButton ?? { label: null, href: null },
      outlineButton: raw.cta?.outlineButton ?? { label: null, href: null },
    },
    copyrightText: raw.copyrightText ?? null,
    socialLinks: parseList(
      rawFooterSocial,
      raw.socialLinks,
      where,
      "socialLinks",
    ).map(
      (social, index): FooterSocialLink => ({
        key: String(social.id ?? `${index}:${social.url}`),
        platform: social.platform,
        url: social.url,
        label: social.label,
      }),
    ),
  };
}

const rawHomepage = z.object({
  hero: z
    .object({ enabled: z.boolean().nullish(), item: z.unknown() })
    .nullish(),
  services: section({
    ourServicesCT: z
      .object({ title: text, description: text, backgroundVideo: rawMedia })
      .nullish(),
    primaryCta: rawCta,
  }),
  projects: section({ primaryCta: rawCta }),
  testimonials: section({}),
  faqs: section({}),
});

export async function getHomepage(locale: Locale): Promise<Homepage> {
  const where = { slug: GLOBALS.homepage, locale };
  const raw = parseGlobal(
    rawHomepage,
    await readGlobal(where.slug, locale),
    where,
  );

  // O hero é um único item: inválido, a secção fica sem item e não renderiza —
  // a mesma degradação de uma lista que perde um elemento.
  const heroItem = rawHero.safeParse(raw.hero?.item);
  if (raw.hero?.item != null && !heroItem.success) {
    reportDropped(where, "hero.item", raw.hero.item, heroItem.error.issues);
  }

  const { services, projects, testimonials, faqs } = raw;

  return {
    hero: {
      enabled: raw.hero?.enabled ?? false,
      item: heroItem.success ? toHero(heroItem.data) : null,
    },
    services: {
      enabled: services?.enabled ?? false,
      title: services?.title ?? null,
      subtitle: services?.subtitle ?? null,
      ourServicesCT: {
        title: services?.ourServicesCT?.title ?? null,
        description: services?.ourServicesCT?.description ?? null,
        backgroundVideo: services?.ourServicesCT?.backgroundVideo ?? null,
      },
      primaryCta: services?.primaryCta ?? { label: null, url: null },
      items: parseList(
        rawService,
        services?.items,
        where,
        "services?.items",
      ).map(toService),
    },
    projects: {
      enabled: projects?.enabled ?? false,
      title: projects?.title ?? null,
      subtitle: projects?.subtitle ?? null,
      primaryCta: projects?.primaryCta ?? { label: null, url: null },
      items: parseList(
        rawProject,
        projects?.items,
        where,
        "projects?.items",
      ).map(
        (project): Project => ({
          key: String(project.id),
          title: project.title,
          description: project.description,
          coverImage: project.coverImage,
          url: project.url,
          // O Payload não tem rótulo por projecto.
          linkLabel: null,
        }),
      ),
    },
    testimonials: {
      enabled: testimonials?.enabled ?? false,
      title: testimonials?.title ?? null,
      subtitle: testimonials?.subtitle ?? null,
      items: parseList(
        rawTestimonial,
        testimonials?.items,
        where,
        "testimonials?.items",
      ).map(
        (testimonial): Testimonial => ({
          key: String(testimonial.id),
          authorName: testimonial.authorName,
          tag: testimonial.tag,
          social: testimonial.social,
          avatar: testimonial.avatar,
          quote: testimonial.quote,
          date: testimonial.updatedAt,
        }),
      ),
    },
    faqs: {
      enabled: faqs?.enabled ?? false,
      title: faqs?.title ?? null,
      subtitle: faqs?.subtitle ?? null,
      items: parseList(rawFaq, faqs?.items, where, "faqs?.items").map(
        (faq): Faq => ({
          key: String(faq.id),
          question: faq.question,
          answer: toRichText(
            convertLexicalToHTML({
              // O container é da UI: o `FAQSection` põe o seu próprio
              // `<div class="payload-richtext">`, como o `<RichText>` fazia.
              disableContainer: true,
              // O zod só confirmou que há raiz; a forma dos nós é contrato
              // do conversor, que já tolera nós que não conhece.
              data: faq.answer as unknown as Parameters<
                typeof convertLexicalToHTML
              >[0]["data"],
            }),
          ),
        }),
      ),
    },
  };
}

const rawQuotePage = z.object({
  seo: z.object({ metaTitle: text, metaDescription: text }).nullish(),
  hero: z.object({ headline: text, intro: text }).nullish(),
  availability: z
    .object({ enabled: z.boolean().nullish(), label: text, location: text })
    .nullish(),
  form: z
    .object({
      enabled: z.boolean().nullish(),
      eyebrow: text,
      nameLabel: text,
      emailLabel: text,
      interestsLabel: text,
      interests: z.array(z.unknown()).nullish(),
      messageLabel: text,
      submitLabel: text,
      privacyNote: text,
      messages: z
        .object({
          success: text,
          error: text,
          nameRequired: text,
          emailRequired: text,
          emailInvalid: text,
          messageRequired: text,
          tooLong: text,
        })
        .nullish(),
    })
    .nullish(),
});

export async function getQuotePage(locale: Locale): Promise<QuotePage> {
  const where = { slug: GLOBALS.getQuote, locale };
  const raw = parseGlobal(
    rawQuotePage,
    await readGlobal(where.slug, locale),
    where,
  );
  const messages = raw.form?.messages;

  return {
    seo: {
      metaTitle: raw.seo?.metaTitle ?? null,
      metaDescription: raw.seo?.metaDescription ?? null,
    },
    hero: {
      headline: raw.hero?.headline ?? null,
      intro: raw.hero?.intro ?? null,
    },
    availability: {
      enabled: raw.availability?.enabled !== false,
      label: raw.availability?.label ?? null,
      location: raw.availability?.location ?? null,
    },
    form: {
      enabled: raw.form?.enabled !== false,
      eyebrow: raw.form?.eyebrow ?? null,
      nameLabel: raw.form?.nameLabel ?? null,
      emailLabel: raw.form?.emailLabel ?? null,
      interestsLabel: raw.form?.interestsLabel ?? null,
      interests: parseList(
        rawService,
        raw.form?.interests,
        where,
        "form.interests",
      ).map(toService),
      messageLabel: raw.form?.messageLabel ?? null,
      submitLabel: raw.form?.submitLabel ?? null,
      privacyNote: raw.form?.privacyNote ?? null,
      messages: {
        success: messages?.success ?? null,
        error: messages?.error ?? null,
        nameRequired: messages?.nameRequired ?? null,
        emailRequired: messages?.emailRequired ?? null,
        emailInvalid: messages?.emailInvalid ?? null,
        messageRequired: messages?.messageRequired ?? null,
        tooLong: messages?.tooLong ?? null,
      },
    },
  };
}

// A válvula `form.enabled`, lida sem popular nada: a Server Action consulta-a
// em cada submissão, e popular os serviços do grupo seria trabalho deitado
// fora. Só `false` explícito fecha o formulário, como no render.
export async function isQuoteFormEnabled(): Promise<boolean> {
  const payload = await getPayloadInstance();
  const settings = await payload.findGlobal({
    slug: GLOBALS.getQuote,
    depth: 0,
  });
  return settings?.form?.enabled !== false;
}

// ── Contacto ───────────────────────────────────────────────────────────────

// `limit: 1` porque quem chama quer um endereço, não uma lista: a faixa de
// contacto direto do footer mostra um só e-mail. `depth: 0` porque nada do que
// ela lê em `Contact` é relação.
//
// Devolve `null` com a coleção vazia. O `email` é `required` no schema, mas isso
// vale por documento e não garante que exista documento; quem chama trata a
// ausência.
export async function getContact(locale: Locale): Promise<Contact | null> {
  const payload = await getPayloadInstance();
  const { docs } = await payload.find({
    collection: "contact",
    limit: 1,
    depth: 0,
    locale,
  });
  const doc = docs[0];
  if (!doc) return null;
  return { email: doc.email?.trim() ? doc.email : null };
}

// ── Submissões ─────────────────────────────────────────────────────────────

// Os interesses chegam como slugs e são resolvidos contra a coleção. O que não
// corresponder a nenhum serviço fica de fora — um slug forjado não entra na
// submissão, e os interesses válidos do mesmo envio continuam.
export async function findServicesBySlugs(
  slugs: string[],
  limit: number,
): Promise<Service[]> {
  if (slugs.length === 0) return [];
  const payload = await getPayloadInstance();
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { in: slugs } },
    depth: 0,
    limit,
    pagination: false,
  });
  // Só id e slug: é tudo o que a submissão grava. Exigir o título aqui, como
  // `rawService` faz para a UI, descartaria um interesse válido por o serviço
  // não ter título no locale padrão.
  const where = { slug: "services", locale: "en" as Locale };
  return parseList(rawServiceRef, docs, where, "docs").map((service) => ({
    key: String(service.id),
    slug: service.slug,
    title: service.title ?? service.slug,
    shortDescription: null,
  }));
}

const rawServiceRef = z.object({
  id,
  slug: z.string().min(1),
  title: text,
});

export async function createQuoteRequest(
  input: QuoteRequestInput,
): Promise<void> {
  const payload = await getPayloadInstance();
  await payload.create({
    collection: "quote-requests",
    // A única via de escrita anónima: `create` exige utilizador na coleção.
    overrideAccess: true,
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
      // A relação serve a navegação no admin; o slug copiado serve a leitura
      // da submissão depois de o serviço ser apagado ou renomeado.
      services: input.services.map((service) => Number(service.key)),
      serviceSlugs: input.services.map((service) => service.slug),
      submittedLocale: input.submittedLocale as Locale,
    },
  });
}
