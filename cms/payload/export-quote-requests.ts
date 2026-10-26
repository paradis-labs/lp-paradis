// Exporta as submissões antigas (`quote-requests` no Payload) para CSV, para a
// equipa comercial. Não são importadas para o hcms (modelo diferente).
//
//   npm run cms:export-leads -- ~/leads-AAAA-MM-DD.csv
//
// **Dados pessoais** (nome, e-mail, descrição de projeto): o CSV vai para o
// ficheiro indicado, que tem de ficar fora do repo. Não se versiona nem se
// partilha fora da equipa comercial. Um ficheiro e não o stdout: o logger do
// Payload escreve no stdout e sujaria o CSV.
//
// Só leitura (`find`). Corre com `payload run`, com o `push` de schema do
// adaptador desligado, como os outros scripts de `cms/`.

process.env.PAYLOAD_MIGRATING = "true";

import { writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import config from "@payload-config";
import { getPayload } from "payload";

const target = process.argv[2];
if (!target) {
  console.error("uso: npm run cms:export-leads -- <ficheiro.csv fora do repo>");
  process.exit(1);
}
const inRepo = !relative(process.cwd(), resolve(target)).startsWith("..");
if (inRepo) {
  console.error("✗ o CSV tem dados pessoais: escreva-o fora do repositório");
  process.exit(1);
}

const COLUMNS = [
  "id",
  "createdAt",
  "name",
  "email",
  "message",
  "serviceSlugs",
  "submittedLocale",
] as const;

// Aspas sempre, e um apóstrofo antes do que uma folha de cálculo leria como
// fórmula (`=`, `+`, `-`, `@`): o campo `message` vem de um formulário
// público.
function cell(value: unknown): string {
  let text = Array.isArray(value)
    ? value.join("; ")
    : value == null
      ? ""
      : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "quote-requests",
  depth: 0,
  limit: 0,
  pagination: false,
  sort: "createdAt",
});

const lines = [
  COLUMNS.join(","),
  ...docs.map((doc) => COLUMNS.map((column) => cell(doc[column])).join(",")),
];
writeFileSync(target, `${lines.join("\n")}\n`, { mode: 0o600 });
console.error(`✓ ${docs.length} submissões exportadas para ${target}`);
process.exit(0);
