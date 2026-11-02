// O fallback de rota do grupo `(pages)` (#17).
//
// Sem ele, uma navegação para uma rota dinâmica — hoje todas — deixa a página
// anterior inerte até o servidor responder por inteiro. Com ele, o Next tem um
// boundary de Suspense a nível de rota e troca de imediato para isto, enquanto
// o header e o footer, que vêm do layout, continuam no ecrã.
//
// Sem texto de propósito: tudo o que aparece no site é localizado, e um
// "A carregar…" escrito aqui seria a única cópia fora do CMS. O sinal visível
// de progresso é a barra no topo (`NavigationProgress`); isto só reserva o
// espaço da página para o footer não subir até ao header durante a espera.
export default function Loading() {
  return <div aria-busy="true" className="min-h-svh" />;
}
