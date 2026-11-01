// Corre uma vez por instância do servidor, antes do primeiro pedido.
//
// Sem `CMS_REVALIDATE_SECRET`, o endpoint de revalidação recusa todos os
// avisos do hcms e o conteúdo só se atualiza quando a cache expira (1 h). Isto
// avisa ao arrancar, em vez de deixar a descoberta para o primeiro 401.
//
// **Aviso e não erro**, ao contrário de `assertHcmsEnv()`: o build do Docker e
// o `next dev` local correm sem o segredo, e o site funciona sem ele, só com
// conteúdo até uma hora atrasado. O build fica de fora, porque lá a falta é
// esperada.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.CMS_REVALIDATE_SECRET?.trim()) return;
  console.warn(
    "[cache] CMS_REVALIDATE_SECRET em falta: a revalidação pelo hcms está desligada, o conteúdo só se atualiza quando a cache expira (1 h)",
  );
}
