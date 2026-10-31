import { notFound } from "next/navigation";
import type React from "react";
import GetQuote from "@/components/GetQuote";
import type { QuoteContactAsideProps } from "@/components/GetQuote/QuoteContactAside";
import type { QuotePage, Service } from "@/content";
import type { Locale } from "@/i18n/routing";
import type { QuoteFormState } from "@/lib/quote-request";

// Cenários de origem, em `v3-get-quote/specs/`:
//   get-quote-page
//     • "Layout v3 da página de orçamento"              → caso 1
//     • "O campo de empresa depende do formulário"      → casos 1 e 2
//   quote-request-intake
//     • "O estado de sucesso permite um novo envio"     → caso 3
//   quote-contact-aside
//     • "O aside degrada por grupo"                     → casos 10 a 14
//     • "Os estados do aside são exercitáveis"          → casos 10 a 15
// Os casos 4 a 9 vêm da fixture anterior (`add-get-quote-page`) e continuam
// válidos no layout v3.

const service = (slug: string, title: string): Service => ({
  key: slug,
  slug,
  title,
  shortDescription: null,
});

// A global inteira vazia, na forma de domínio: textos a `null`, listas vazias e
// as duas válvulas ligadas — é só `false` explícito que as desliga, e um global
// por preencher não tem `false` nenhum.
const EMPTY_GLOBAL: QuotePage = {
  seo: { metaTitle: null, metaDescription: null },
  hero: { headline: null, intro: null },
  availability: { enabled: true, label: null, location: null },
  form: {
    enabled: true,
    eyebrow: null,
    nameLabel: null,
    emailLabel: null,
    interestsLabel: null,
    interests: [],
    company: null,
    messageLabel: null,
    submitLabel: null,
    privacyNote: null,
    messages: {
      success: null,
      error: null,
      nameRequired: null,
      emailRequired: null,
      emailInvalid: null,
      messageRequired: null,
      tooLong: null,
    },
  },
};

const BASE: QuotePage = {
  seo: {
    metaTitle: "Get a Quote — Paradis",
    metaDescription: "Tell us what you're building.",
  },
  hero: {
    headline: "Let's build something\nthat moves you forward.",
    intro:
      "We're excited to hear what you're building. Drop the details below and we'll reply within one business day.",
  },
  availability: {
    enabled: true,
    label: "Available for new projects",
    location: "Luanda, Angola",
  },
  form: {
    enabled: true,
    eyebrow: "Get a Quote",
    nameLabel: "Your name",
    emailLabel: "Your email",
    interestsLabel: "I'm interested in…",
    interests: [
      service("ui-ux-design", "UI/UX Design"),
      service("brand-identity", "Brand Identity"),
      service("mobile-development", "Mobile Development"),
      service("web-development", "Web Development"),
    ],
    company: null,
    messageLabel: "Your project",
    submitLabel: "Send enquiry",
    privacyNote: "Your details are safe — no ads, no spam.",
    messages: {
      success: "Thanks — we've got your brief.",
      error: "Something went wrong. Please try again.",
      nameRequired: "Please tell us your name.",
      emailRequired: "Please enter your email.",
      emailInvalid: "That email doesn't look right.",
      messageRequired: "Please tell us about your project.",
      tooLong: "That's a bit too long.",
    },
  },
};

type Aside = Omit<QuoteContactAsideProps, "locale">;

const FULL_ASIDE: Aside = {
  reachHeading: "Reach Us Directly",
  socialHeading: "Elsewhere",
  email: "geral@paradis.host",
  call: {
    label: "Schedule a Call",
    href: "https://calendly.com/geral-paradis/30min",
  },
  socialLinks: [
    {
      key: "s1",
      platform: "linkedin",
      url: "https://www.linkedin.com/company/paradis-labs",
      label: "Paradis Labs on LinkedIn",
    },
    {
      key: "s2",
      platform: "instagram",
      url: "https://www.instagram.com/paradis.labs_/",
      label: "Paradis Labs on Instagram",
    },
  ],
};

const EMPTY_ASIDE: Aside = {
  reachHeading: null,
  socialHeading: null,
  email: null,
  call: null,
  socialLinks: [],
};

const WITH_COMPANY: QuotePage = {
  ...BASE,
  form: { ...BASE.form, company: { label: "Company" } },
};

const CASES: Array<{
  scenario: string;
  prop: string;
  expected: string;
  args: QuotePage;
  aside?: Aside;
  initialFormState?: QuoteFormState;
}> = [
  {
    scenario: "Completo, com o campo de empresa declarado no hcms",
    prop: 'form.company: { label: "Company" } + aside completo',
    expected:
      "cartão com título e subtítulo, nome · e-mail · empresa (optional) em duas colunas, chips, textarea com placeholder, botão com disco; o aside à direita a partir de 1024px, sticky",
    args: WITH_COMPANY,
  },
  {
    scenario: "Sem o campo de empresa no hcms (o estado de produção hoje)",
    prop: "form.company: null",
    expected:
      "a grelha mostra só nome e e-mail, lado a lado, sem célula vazia — e a submissão não envia empresa",
    args: BASE,
  },
  {
    scenario: "Estado de sucesso",
    prop: 'initialFormState: { status: "success" }',
    expected:
      'a confirmação substitui o formulário com role=status; "Send another" devolve o formulário vazio, sem chips, com o foco no nome',
    args: BASE,
    initialFormState: { status: "success" },
  },
  {
    scenario: "Global inteira sem conteúdo",
    prop: "EMPTY_GLOBAL — textos a null, listas vazias",
    expected:
      "renderiza sem lançar erro, com o piso de cada campo, e o layout permanece íntegro — headline, intro, pill e formulário todos presentes",
    args: EMPTY_GLOBAL,
    aside: EMPTY_ASIDE,
  },
  {
    scenario: "Nenhum serviço ligado",
    prop: "form.interests: []",
    expected:
      "a secção de interesses desaparece INTEIRA, incluindo o rótulo — não fica um cabeçalho a apontar para o nada — e o resto do formulário continua utilizável",
    args: { ...BASE, form: { ...BASE.form, interests: [] } },
  },
  {
    scenario: "Pill de disponibilidade desativada",
    prop: "availability.enabled: false",
    expected:
      "a pill não é renderizada e o parágrafo de intro não muda de alinhamento nem herda espaço vazio no lugar dela",
    args: {
      ...BASE,
      availability: { ...BASE.availability, enabled: false },
    },
  },
  {
    scenario: "Pill ativa sem localidade",
    prop: 'availability.location: ""',
    expected:
      "a pill mostra só o ponto e o texto de estado; o separador `·` que precede a localidade também desaparece",
    args: {
      ...BASE,
      availability: { ...BASE.availability, location: "" },
    },
  },
  {
    scenario: "Botão sem rótulo authorado",
    prop: 'form.submitLabel: ""',
    expected:
      "o botão exibe o piso em código e permanece um destino rotulado, nunca uma pílula sem texto",
    args: { ...BASE, form: { ...BASE.form, submitLabel: "" } },
  },
  {
    scenario: "Formulário desligado",
    prop: "form.enabled: false",
    expected:
      "o formulário não é renderizado, e o cabeçalho e o aside continuam a ser apresentados",
    args: { ...BASE, form: { ...BASE.form, enabled: false } },
  },
  {
    scenario: "ASIDE — sem e-mail",
    prop: "aside.email: null",
    expected:
      "o grupo de contacto direto some inteiro, com o título; chamada e redes continuam, e a primeira linha divisória desaparece com ele",
    args: BASE,
    aside: { ...FULL_ASIDE, email: null },
  },
  {
    scenario: "ASIDE — sem botão de chamada",
    prop: "aside.call: null",
    expected: "o grupo de chamada some inteiro; e-mail e redes continuam",
    args: BASE,
    aside: { ...FULL_ASIDE, call: null },
  },
  {
    scenario: "ASIDE — sem redes",
    prop: "aside.socialLinks: []",
    expected: "o grupo de redes some inteiro; e-mail e chamada continuam",
    args: BASE,
    aside: { ...FULL_ASIDE, socialLinks: [] },
  },
  {
    scenario: "ASIDE — títulos esvaziados no admin",
    prop: 'reachHeading: "", socialHeading: "   "',
    expected: "os dois títulos caem no piso em código, nenhum fica em branco",
    args: BASE,
    aside: { ...FULL_ASIDE, reachHeading: "", socialHeading: "   " },
  },
  {
    scenario: "ASIDE — vazio",
    prop: "aside sem e-mail, chamada nem redes",
    expected:
      "o aside não existe no DOM, e o cartão do formulário ocupa a largura toda — nenhuma coluna vazia ao lado",
    args: BASE,
    aside: EMPTY_ASIDE,
  },
  {
    scenario: "ASIDE — plataforma sem nome derivável",
    prop: 'socialLinks: [{ platform: "other", … }]',
    expected:
      "a pill continua a renderizar e a ser clicável, com o `label` como texto visível; as outras mostram o nome de marca",
    args: BASE,
    aside: {
      ...FULL_ASIDE,
      socialLinks: [
        ...FULL_ASIDE.socialLinks,
        {
          key: "s3",
          platform: "other",
          url: "https://paradis.host",
          label: "Paradis Labs elsewhere",
        },
      ],
    },
  },
];

function Case({
  index,
  scenario,
  prop,
  expected,
  children,
}: {
  index: number;
  scenario: string;
  prop: string;
  expected: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t-4 border-dashed border-neutral-400">
      <header className="bg-neutral-100 px-4 py-3 text-neutral-900">
        <p className="text-sm font-semibold">
          {index}. {scenario}
        </p>
        <p className="mt-1 font-mono text-xs text-neutral-700">{prop}</p>
        <p className="mt-1 text-xs text-neutral-600">
          <span className="font-semibold">esperado:</span> {expected}
        </p>
      </header>
      {children}
    </section>
  );
}

export default async function GetQuoteFixturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { locale } = (await params) as { locale: Locale };

  return (
    <div className="bg-white">
      <header className="px-4 py-8 text-neutral-900">
        <h1 className="text-2xl font-semibold">
          Get Quote — estados degradados
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-700">
          Fixture só de desenvolvimento. Cada bloco renderiza o{" "}
          <code className="font-mono">GetQuote</code> da aplicação com props
          fabricadas em código — nenhuma consulta ao CMS alimenta os estados
          abaixo.
        </p>
        <p className="mt-2 max-w-3xl text-sm font-semibold text-neutral-900">
          Contagem esperada: 15 páginas fabricadas. Os formulários são reais e a
          Server Action está ligada — submeter aqui GRAVA em{" "}
          <code className="font-mono">form_submissions</code> no hcms.
        </p>
        <p className="mt-1 max-w-3xl text-xs text-neutral-600">
          Cenários de origem:{" "}
          <code className="font-mono">
            add-get-quote-page/specs/get-quote-page
          </code>{" "}
          e{" "}
          <code className="font-mono">
            add-get-quote-page/specs/quote-request-intake
          </code>
          . Ver o mapa caso-a-cenário no topo deste ficheiro.
        </p>
      </header>

      {CASES.map((c, i) => (
        <Case
          key={c.scenario}
          index={i + 1}
          scenario={c.scenario}
          prop={c.prop}
          expected={c.expected}
        >
          <GetQuote
            {...c.args}
            locale={locale}
            aside={c.aside ?? FULL_ASIDE}
            initialFormState={c.initialFormState}
          />
        </Case>
      ))}
    </div>
  );
}
