// Paridade de domínio entre os dois providers de `@/content`.
//
//   npm run cms:parity
//
// Chama cada leitura dos providers Payload e hcms, **sem cache** (importa os
// providers, não `@/content`), para `en` e `pt`, e compara os objetos de
// domínio campo a campo. A ordem das listas conta.
//
// **Normaliza** o que difere por natureza, ou só na forma, como o
// `cms/hcms/verify-content.ts` da fase 2:
//   • a `key` opaca sai, e o URL de uma media passa a marcador (a presença conta);
//   • nos textos, espaços colapsados e aspas tipográficas iguais às retas;
//   • nos URLs internos (`url`, `href`), o prefixo de locale sai e `#secção`
//     vale `/#secção`, porque é a mesma âncora.
//
// **Classifica** o que sobra:
//   • **acrescenta**: o Payload não tinha o valor, ou, em `pt`, tinha o inglês
//     (o fallback de locale do Payload), e o hcms preenche. Listado, não falha;
//   • **aceite**: o caminho está em `cms/parity/accepted-differences.json`, com
//     o motivo. Entra por PR, para que aceitar seja uma decisão visível;
//   • **diferença**: tudo o resto. Sai com código 1.
//
// Corre com `payload run` (Local API no mesmo processo); o `payload run` sai com
// 0 depois de importar o script, por isso o código de saída é fixado aqui. Só
// leituras nos dois CMS, com o `push` de schema do adaptador desligado.

process.env.PAYLOAD_MIGRATING = "true";

import { readFileSync } from "node:fs";
import * as hcms from "@/content/providers/hcms";
import * as payload from "@/content/providers/payload";
import type { Locale } from "@/i18n/routing";

const LOCALES: Locale[] = ["en", "pt"];

type Provider = Pick<
  typeof payload,
  "getNavBar" | "getFooter" | "getContact" | "getHomepage" | "getQuotePage"
>;

const READS: Record<string, (provider: Provider, locale: Locale) => unknown> = {
  getNavBar: (provider, locale) => provider.getNavBar(locale),
  getFooter: (provider, locale) => provider.getFooter(locale),
  getContact: (provider, locale) => provider.getContact(locale),
  getHomepage: (provider, locale) => provider.getHomepage(locale),
  getQuotePage: (provider, locale) => provider.getQuotePage(locale),
};

// ── Normalização ───────────────────────────────────────────────────────────

const normalizeText = (text: string) =>
  text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

function normalizeUrl(url: string) {
  let value = url.trim().replace(/^\/(en|pt)(?=[/#?]|$)/, "");
  if (value === "") value = "/";
  if (value.startsWith("#") && value.length > 1) value = `/${value}`;
  return value.replace(/(.)\/(?=$|[#?])/, "$1");
}

// Um texto vazio vale `null`: o Payload grava `""` num campo limpo, o hcms
// `null`, e para a UI são o mesmo campo vazio.
function normalize(value: unknown, key = ""): unknown {
  if (typeof value === "string") {
    const text =
      key === "url" || key === "href"
        ? normalizeUrl(value)
        : normalizeText(value);
    return text === "" ? null : text;
  }
  if (Array.isArray(value)) return value.map((entry) => normalize(entry));
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const isMedia = "url" in object && "alt" in object && "width" in object;
    return Object.fromEntries(
      Object.entries(object)
        .filter(([name]) => name !== "key")
        .map(([name, entry]) => [
          name,
          isMedia && name === "url" ? "(media)" : normalize(entry, name),
        ]),
    );
  }
  return value;
}

// ── Diff ───────────────────────────────────────────────────────────────────

type Segment = string | number;
type Difference = {
  path: string;
  segments: Segment[];
  payload: unknown;
  hcms: unknown;
  note?: string;
};

const pathOf = (segments: Segment[]) =>
  segments
    .map((segment) =>
      typeof segment === "number" ? `[${segment}]` : `.${segment}`,
    )
    .join("");

function diff(
  a: unknown,
  b: unknown,
  root: string,
  segments: Segment[],
  out: Difference[],
) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      out.push({
        path: root + pathOf(segments),
        segments,
        payload: a,
        hcms: b,
        note: `${a.length} itens no Payload, ${b.length} no hcms`,
      });
    for (let index = 0; index < Math.min(a.length, b.length); index++)
      diff(a[index], b[index], root, [...segments, index], out);
    return;
  }
  if (
    a &&
    b &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys)
      diff(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        root,
        [...segments, key],
        out,
      );
    return;
  }
  if (JSON.stringify(a) !== JSON.stringify(b))
    out.push({ path: root + pathOf(segments), segments, payload: a, hcms: b });
}

function at(source: unknown, segments: Segment[]): unknown {
  let current = source;
  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

// ── Exceções aceites ───────────────────────────────────────────────────────

// `(*)` é qualquer locale, `[*]` qualquer índice, `**` qualquer resto.
type Accepted = { path: string; reason: string; pattern: RegExp };

function loadAccepted(problems: string[]): Accepted[] {
  const raw = JSON.parse(
    readFileSync(
      new URL("./accepted-differences.json", import.meta.url),
      "utf8",
    ),
  ) as { differences?: { path?: string; reason?: string }[] };
  return (raw.differences ?? []).flatMap((entry) => {
    if (!entry?.path || !entry.reason?.trim()) {
      problems.push(`exceção sem "path" ou "reason": ${JSON.stringify(entry)}`);
      return [];
    }
    const source = entry.path
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\(\*\\\)/g, "\\((en|pt)\\)")
      .replace(/\\\[\*\\\]/g, "\\[\\d+\\]")
      .replace(/\*\*/g, ".*");
    return [
      {
        path: entry.path,
        reason: entry.reason,
        pattern: new RegExp(`^${source}$`),
      },
    ];
  });
}

// ── Relatório ──────────────────────────────────────────────────────────────

const show = (value: unknown) =>
  value === undefined ? "(ausente)" : JSON.stringify(value);

async function main() {
  const problems: string[] = [];
  const accepted = loadAccepted(problems);
  const used = new Set<Accepted>();
  const failing: Difference[] = [];
  const acceptedHits: { difference: Difference; reason: string }[] = [];
  const additions: Difference[] = [];

  for (const [name, run] of Object.entries(READS)) {
    const results: Record<Locale, { payload: unknown; hcms: unknown }> =
      {} as never;
    for (const locale of LOCALES) {
      const [fromPayload, fromHcms] = await Promise.all([
        run(payload, locale),
        run(hcms, locale),
      ]);
      results[locale] = {
        payload: normalize(fromPayload),
        hcms: normalize(fromHcms),
      };
    }

    for (const locale of LOCALES) {
      const differences: Difference[] = [];
      diff(
        results[locale].payload,
        results[locale].hcms,
        `${name}(${locale})`,
        [],
        differences,
      );
      for (const difference of differences) {
        const exception = accepted.find((entry) =>
          entry.pattern.test(difference.path),
        );
        if (exception) {
          used.add(exception);
          acceptedHits.push({ difference, reason: exception.reason });
          continue;
        }
        // Em `pt`, um valor do Payload igual ao de `en` é o fallback de
        // locale dele: não havia tradução. Só para textos.
        const untranslated =
          locale === "pt" &&
          typeof difference.payload === "string" &&
          difference.payload === at(results.en.payload, difference.segments);
        if (
          !difference.note &&
          !isEmpty(difference.hcms) &&
          (isEmpty(difference.payload) || untranslated)
        )
          additions.push(difference);
        else failing.push(difference);
      }
    }
  }

  const unused = accepted.filter((entry) => !used.has(entry));
  const lines: string[] = [];
  const out = (line = "") => lines.push(line);
  const header = (title: string, count: number) => {
    out();
    out(`## ${title} — ${count}`);
  };

  out(`# Paridade Payload × hcms — ${new Date().toISOString()}`);

  header("Diferenças", failing.length);
  for (const difference of failing) {
    out(`✗ ${difference.path}`);
    if (difference.note) out(`    ${difference.note}`);
    else {
      out(`    payload: ${show(difference.payload)}`);
      out(`    hcms:    ${show(difference.hcms)}`);
    }
  }
  if (problems.length) {
    header("Exceções inválidas", problems.length);
    for (const line of problems) out(`✗ ${line}`);
  }
  if (acceptedHits.length) {
    header("Aceites (accepted-differences.json)", acceptedHits.length);
    for (const { difference, reason } of acceptedHits)
      out(`≈ ${difference.path} — ${reason}`);
  }
  if (additions.length) {
    header(
      "O hcms acrescenta o que o Payload não tinha (não conta como falha)",
      additions.length,
    );
    for (const addition of additions)
      out(
        `+ ${addition.path} — ${show(addition.hcms)}${isEmpty(addition.payload) ? "" : ` (Payload: ${show(addition.payload)})`}`,
      );
  }
  if (unused.length) {
    header("Exceções sem diferença correspondente (remover?)", unused.length);
    for (const entry of unused) out(`ℹ ${entry.path}`);
  }

  const failures = failing.length + problems.length;
  out();
  out(
    `${failures === 0 ? "✓" : "✗"} ${failing.length} diferenças · ${acceptedHits.length} aceites · ${additions.length} acrescentadas pelo hcms · ${problems.length} exceções inválidas`,
  );
  console.log(lines.join("\n"));
  process.exit(failures ? 1 : 0);
}

try {
  await main();
} catch (error) {
  console.error("✗ erro numa leitura:", error);
  process.exit(1);
}
