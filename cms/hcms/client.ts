// O cliente do hcms partilhado pelos scripts desta pasta (`check-contract.ts`,
// `verify-content.ts`). **Só leitura**: usa `TOKEN_SECRET_READ` e só expõe
// `readItems`.

import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";

export const SITE_SLUG = "paradis";

export function env(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`✗ falta a variável de ambiente ${name}`);
    process.exit(1);
  }
  return value;
}

// O schema do hcms não é tipado aqui (o token não lê `directus_fields`): as
// leituras devolvem registos soltos e cada script confirma o que precisa.
export type Row = Record<string, unknown>;

// O Cloudflare à frente do hcms recusa clientes sem `User-Agent` reconhecível
// (erro 1010). O token nunca é impresso.
export function createReader(userAgent: string) {
  const client = createDirectus(env("CMS_URL"))
    .with(staticToken(env("TOKEN_SECRET_READ")))
    .with(
      rest({
        onRequest: (options) => ({
          ...options,
          headers: {
            ...(options.headers as Record<string, string>),
            "User-Agent": userAgent,
          },
        }),
      }),
    );

  return (collection: string, query: Record<string, unknown>) =>
    client.request(readItems(collection as never, query as never)) as Promise<
      Row[]
    >;
}

// Os erros do SDK trazem a resposta do hcms; nada do pedido (nem o token).
export function errorMessage(error: unknown): string {
  return (
    (error as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
    (error instanceof Error ? error.message : String(error))
  );
}
