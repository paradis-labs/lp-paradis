import { notFound } from "next/navigation";
import type React from "react";
import Footer from "@/components/Footer";
import type { Footer as FooterContent } from "@/content";
import type { Locale } from "@/i18n/routing";

// O global inteiro vazio, na forma de domínio: textos a `null`, listas vazias.
// É o que o provider entrega quando o editor não preencheu nada — já não há
// cast de `{}`, porque o tipo de domínio não tem campos opcionais por omissão.
const EMPTY_GLOBAL: FooterContent = {
  logo: null,
  tagline: null,
  directContact: {
    reachHeading: null,
    emailHeading: null,
    socialHeading: null,
  },
  linkGroups: [],
  cta: {
    heading: null,
    primaryButton: { label: null, href: null },
    outlineButton: { label: null, href: null },
  },
  copyrightText: null,
  socialLinks: [],
};

const BASE: FooterContent = {
  ...EMPTY_GLOBAL,
  tagline: "Because we were born into this world",
  linkGroups: [
    {
      key: "g1",
      title: "Quick Links",
      links: [
        { key: "k1", name: "Home", href: "/", isExternal: false },
        { key: "k2", name: "Services", href: "/#services", isExternal: false },
        {
          key: "k3",
          name: "Kitenda",
          href: "https://kitenda.paradis.host/",
          isExternal: true,
        },
      ],
    },
  ],
  cta: {
    heading: "Ready to build?",
    primaryButton: { label: "Get Quote - For Free", href: "/get-quote" },
    outlineButton: { label: "Schedule a Call", href: "/get-quote" },
  },
  copyrightText: "Paradis Labs - All rights reserved.",
  socialLinks: [
    {
      key: "s1",
      platform: "linkedin",
      url: "https://www.linkedin.com/company/paradis-labs",
      label: "Paradis Labs on LinkedIn",
    },
  ],
};

const CASES: Array<{
  scenario: string;
  prop: string;
  expected: string;
  args: FooterContent;
  ctaBand?: boolean;
}> = [
  {
    scenario: "Copyright sem texto authorado",
    prop: 'copyrightText: ""',
    expected:
      "a barra inferior exibe o fallback declarado, mantendo o ano — não fica reduzida a um símbolo de copyright solto",
    args: { ...BASE, copyrightText: "" },
  },
  {
    scenario: "Botão sem rótulo authorado",
    prop: 'cta.primaryButton.label: ""',
    expected:
      "o botão exibe o fallback e permanece um destino rotulado, nunca uma pílula sem texto",
    args: {
      ...BASE,
      cta: { ...BASE.cta, primaryButton: { label: "", href: "/get-quote" } },
    },
  },
  {
    scenario: "Global inteiro sem conteúdo",
    prop: "EMPTY_GLOBAL — textos a null, listas vazias",
    expected:
      "renderiza sem lançar erro, exibindo os fallbacks de cada campo, e o layout da página permanece íntegro",
    args: EMPTY_GLOBAL,
  },
  {
    scenario: "Nenhum link social authorado",
    prop: "socialLinks: []",
    expected:
      "nenhum ícone é renderizado, o copyright permanece alinhado à esquerda, e nenhum espaço reservado vazio aparece à direita",
    args: { ...BASE, socialLinks: [] },
  },
  {
    scenario: "Plataforma sem ícone mapeado",
    prop: 'socialLinks: [{ platform: "youtube", … }]',
    expected:
      "a entrada continua sendo um destino navegável, com o `label` como conteúdo visível em vez do ícone, e a página não quebra",
    args: {
      ...BASE,
      socialLinks: [
        {
          key: "s5",
          platform: "youtube",
          url: "https://www.youtube.com/@paradislabs",
          label: "Paradis Labs on YouTube",
        },
      ],
    },
  },
  {
    scenario: "Composição de /get-quote — sem faixa CTA",
    prop: "ctaBand: false",
    expected:
      'o footer abre directamente no logo com a tagline; não há "Ready to build?" nem os dois botões, porque a página de orçamento já é o destino deles. O resto do footer não muda',
    args: BASE,
    ctaBand: false,
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

export default async function FooterFixturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { locale } = (await params) as { locale: Locale };

  return (
    <main className="bg-white">
      <header className="px-4 py-8 text-neutral-900">
        <h1 className="text-2xl font-semibold">Footer — estados degradados</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-700">
          Fixture só de desenvolvimento. Cada bloco renderiza o{" "}
          <code className="font-mono">Footer</code> da aplicação com props
          fabricadas em código — nenhuma consulta ao CMS alimenta os estados
          abaixo, e nada é escrito no banco.
        </p>
        <p className="mt-2 max-w-3xl text-sm font-semibold text-neutral-900">
          Contagem esperada: 6 footers fabricados + 1 footer real, no fim da
          página. Total 7. Os casos 1–5 exercitam a composição de base, com a
          faixa &ldquo;Ready to build?&rdquo;; o caso 6 é a composição de{" "}
          <code className="font-mono">/get-quote</code>, sem ela. A faixa de
          contacto direto deixou de existir: o contacto da página de orçamento
          vive no aside, exercitado em{" "}
          <code className="font-mono">/fixtures/get-quote</code>.
        </p>
        <p className="mt-1 max-w-3xl text-xs text-neutral-600">
          Cenários de origem:{" "}
          <code className="font-mono">
            finish-footer-implementation/specs/footer-content-authority
          </code>
          . O sexto cenário daquele requisito — "CTA sem heading authorado" —
          não está aqui de propósito: já é verificado em produção, porque{" "}
          <code className="font-mono">cta_heading</code> é{" "}
          <code className="font-mono">null</code> e o fallback aparece em todo
          render.
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
          <Footer {...c.args} locale={locale} ctaBand={c.ctaBand} />
        </Case>
      ))}

      <section className="border-t-4 border-dashed border-neutral-400">
        <header className="bg-amber-100 px-4 py-3 text-neutral-900">
          <p className="text-sm font-semibold">
            7. CONTROLE — footer real da aplicação
          </p>
          <p className="mt-1 text-xs text-neutral-700">
            O próximo footer abaixo NÃO é fabricado. Vem do slot{" "}
            <code className="font-mono">@footer/default.tsx</code>, com os dados
            reais do CMS, como em qualquer página do site que não seja{" "}
            <code className="font-mono">/get-quote</code>. Está aqui como
            controle: &ldquo;conteúdo real e completo&rdquo;, para comparar com
            os seis acima. Não é um sétimo estado. Tem a faixa CTA, e é essa a
            composição correta para esta rota.
          </p>
        </header>
      </section>
    </main>
  );
}
