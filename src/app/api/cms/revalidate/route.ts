import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { hcmsCollectionTags } from "@/content/cache-tags";

// A invalidação da cache de `@/content` vinda do hcms. Quem chama é o flow
// "Revalidate site" do template do hcms (`Template-multisite-tenant`,
// `tooling/flows.mjs`): depois de cada alteração de conteúdo, faz um POST ao
// `revalidate_url` de cada site que o tenha, com o `revalidate_secret` desse
// site. A configuração está em `cms/hcms/FLOW.md`.
//
//   POST /api/cms/revalidate
//   x-revalidate-secret: <CMS_REVALIDATE_SECRET>
//   { "site": "paradis", "event": "items.update", "collection": "projects", "keys": ["…"] }
//
// 401 sem o segredo certo (ou sem segredo configurado); 400 com corpo inválido
// ou de outro site; 200 com as tags invalidadas.
//
// **Cada desfecho deixa uma linha `[cache]` no log**, os 401 com o motivo
// (segredo em falta no site ou errado). Sem isto a revalidação falhava em
// silêncio: só o registo do flow no hcms mostrava o 401. O que cada linha quer
// dizer está em `cms/hcms/FLOW.md`.
//
// **Uma coleção que o site não usa dá 200 sem invalidar nada**, e não um erro:
// o flow notifica todos os sites de todas as alterações de conteúdo do hcms
// (outras coleções, outros sites), e um 400 apareceria como falha no registo do
// flow a cada edição de outro site.
//
// As tags são as de `@/content/cache-tags`: quem invalida não inventa as suas.

const SITE_SLUG = "paradis";

const body = z.object({
  collection: z.string().min(1),
  // O site a quem o flow está a enviar (o do `revalidate_url`), não o dono do
  // item alterado.
  site: z.string().optional(),
  event: z.string().optional(),
  // Informativo (o registo): a invalidação é por coleção, não por item.
  keys: z.array(z.union([z.string(), z.number()])).optional(),
});

// Tempo constante, também com comprimentos diferentes: compara os digests.
function sameSecret(received: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

export async function POST(request: Request) {
  const expected = process.env.CMS_REVALIDATE_SECRET?.trim();
  const received = request.headers.get("x-revalidate-secret") ?? "";
  // Os dois motivos dão a mesma resposta, mas não o mesmo log: dizer ao
  // cliente que o site não tem segredo anunciaria o erro de configuração a
  // quem quer que chame o endpoint. Nenhum valor de segredo entra no log.
  if (!expected) {
    console.warn(
      "[cache] revalidação recusada: o site não tem CMS_REVALIDATE_SECRET",
    );
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!sameSecret(received, expected)) {
    console.warn("[cache] revalidação recusada: segredo recebido errado");
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    console.warn("[cache] revalidação recusada: corpo inválido");
    return Response.json({ error: "invalid body" }, { status: 400 });
  }
  // O `revalidate_url` de outro site a apontar para aqui é um erro de
  // configuração, não uma alteração a ignorar.
  if (parsed.data.site && parsed.data.site !== SITE_SLUG) {
    console.warn("[cache] revalidação recusada: outro site", {
      site: parsed.data.site,
      collection: parsed.data.collection,
    });
    return Response.json(
      { error: `wrong site: ${parsed.data.site}` },
      { status: 400 },
    );
  }

  const tags = hcmsCollectionTags(parsed.data.collection) ?? [];

  // `{ expire: 0 }` e não `"max"`: quem chama é um sistema externo, e o
  // pedido seguinte de um visitante tem de já mostrar o conteúdo novo (é o
  // que a documentação do Next pede para webhooks).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  if (tags.length > 0) {
    console.info("[cache] revalidado pelo hcms", {
      event: parsed.data.event,
      collection: parsed.data.collection,
      keys: parsed.data.keys,
      tags,
    });
  } else {
    // Normal para coleções de outros sites; uma coleção que este site lê e
    // aparece aqui está em falta no mapa de `cache-tags.ts`.
    console.info("[cache] nada a revalidar: coleção que o site não conhece", {
      event: parsed.data.event,
      collection: parsed.data.collection,
    });
  }
  return Response.json({ revalidated: tags });
}
