// Repõe no Payload as submissões recebidas no hcms durante o cutover (rollback
// da fase 4, ver `cms/CUTOVER.md`).
//
//   npm run cms:import-submissions -- ~/form-submissions.json            # importa
//   npm run cms:import-submissions -- ~/form-submissions.json verificar  # só reporta
//
// **Entrada:** a exportação JSON de `form_submissions` do formulário
// `quote_request`, feita no app do hcms por quem o administra. O site não tem
// nem deve ter um token que leia submissões.
//
// **Forma:** a de `form_submissions` no template do hcms
// (`Template-multisite-tenant/docs/api/forms.md`), confirmada com um envio de
// teste: `{ id, form, site, languages_code, date_created, data: { name, email,
// message, interests } }`, solta ou dentro de `{ data: [...] }`. A exportação
// real ainda não foi vista, por isso a validação é estrita e corre sobre o
// ficheiro inteiro **antes** de qualquer escrita: um ficheiro com outra forma é
// recusado sem tocar no Payload.
//
// **Idempotente sem mudar o schema:** a submissão é criada com o `createdAt`
// do hcms, e uma `quote-request` com o mesmo e-mail, mensagem e `createdAt` já
// conta como importada. Correr duas vezes o mesmo ficheiro não duplica. (Um
// campo de origem exigiria uma coluna nova, e este repo não tem migrações do
// Payload: o deploy partiria o formulário antes de a coluna existir.)
//
// Corre com `payload run`, com o `push` de schema do adaptador desligado. Só
// escreve em `quote-requests`. Dados pessoais: apagar o ficheiro depois.

process.env.PAYLOAD_MIGRATING = "true";

import { readFileSync } from "node:fs";
import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";

const LOCALES: Record<string, "en" | "pt"> = { "en-US": "en", "pt-AO": "pt" };

const submission = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  form: z.union([
    z.string(),
    z.number(),
    z.object({ id: z.union([z.string(), z.number()]) }),
  ]),
  languages_code: z.string().nullish(),
  date_created: z.iso.datetime({ offset: true }),
  data: z.object({
    name: z.string().trim().min(1),
    email: z.email(),
    message: z.string().trim().min(1),
    interests: z.array(z.string()).nullish(),
  }),
});

const exportFile = z.union([
  z.array(z.unknown()),
  z.object({ data: z.array(z.unknown()) }).transform((file) => file.data),
]);

const [file, mode] = process.argv.slice(2);
if (!file || (mode && mode !== "verificar")) {
  console.error(
    "uso: npm run cms:import-submissions -- <exportação.json> [verificar]",
  );
  process.exit(1);
}
const dryRun = mode === "verificar";

// 1. Validar tudo antes de escrever.
let raw: unknown;
try {
  raw = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  console.error(`✗ não consegui ler ${file} como JSON: ${error}`);
  process.exit(1);
}
const rows = exportFile.safeParse(raw);
if (!rows.success) {
  console.error(
    "✗ o ficheiro não é uma lista de submissões (nem `{ data: [...] }`)",
  );
  process.exit(1);
}
const problems: string[] = [];
const submissions = rows.data.flatMap((row, index) => {
  const parsed = submission.safeParse(row);
  if (parsed.success) return [parsed.data];
  problems.push(
    `#${index}: ${parsed.error.issues.map((issue) => issue.path.join(".") || "(raiz)").join(", ")}`,
  );
  return [];
});
if (problems.length) {
  console.error(
    `✗ ${problems.length} submissões com forma inesperada; nada foi importado:\n  ${problems.slice(0, 10).join("\n  ")}`,
  );
  console.error(
    "  Se a exportação tiver outra forma, ajuste o schema `submission` deste script.",
  );
  process.exit(1);
}
const forms = new Set(
  submissions.map((entry) =>
    String(typeof entry.form === "object" ? entry.form.id : entry.form),
  ),
);
if (forms.size > 1) {
  console.error(
    `✗ a exportação mistura ${forms.size} formulários; exporte só o \`quote_request\``,
  );
  process.exit(1);
}

// 2. Importar, saltando as que já existem.
const payload = await getPayload({ config });

// Os interesses chegam como slugs (os de `en-US`, iguais aos do Payload). A
// relação serve a navegação no admin; o slug copiado sobrevive a um serviço que
// não exista no Payload.
const slugs = [
  ...new Set(submissions.flatMap((entry) => entry.data.interests ?? [])),
];
const services = slugs.length
  ? (
      await payload.find({
        collection: "services",
        where: { slug: { in: slugs } },
        depth: 0,
        limit: slugs.length,
        pagination: false,
      })
    ).docs
  : [];
const serviceId = new Map(services.map((entry) => [entry.slug, entry.id]));

let created = 0;
let skipped = 0;
for (const entry of submissions) {
  const createdAt = new Date(entry.date_created).toISOString();
  const { totalDocs } = await payload.count({
    collection: "quote-requests",
    where: {
      and: [
        { email: { equals: entry.data.email } },
        { message: { equals: entry.data.message } },
        { createdAt: { equals: createdAt } },
      ],
    },
  });
  if (totalDocs > 0) {
    skipped++;
    continue;
  }
  created++;
  if (dryRun) continue;
  const interests = entry.data.interests ?? [];
  await payload.create({
    collection: "quote-requests",
    // A coleção exige utilizador para `create`; este script é a reposição
    // operada à mão, como a Server Action.
    overrideAccess: true,
    data: {
      name: entry.data.name,
      email: entry.data.email,
      message: entry.data.message,
      services: interests.flatMap((slug) => {
        const id = serviceId.get(slug);
        return id === undefined ? [] : [id];
      }),
      serviceSlugs: interests,
      submittedLocale: LOCALES[entry.languages_code ?? ""] ?? "en",
      createdAt,
    },
  });
}

console.log(
  `${dryRun ? "verificação: " : ""}✓ ${submissions.length} submissões no ficheiro · ${created} ${dryRun ? "a importar" : "importadas"} · ${skipped} já existiam`,
);
process.exit(0);
