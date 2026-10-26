import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { type Locale, locales } from "./routing";

// O segmento `[locale]` também recebe caminhos que não são do site: o proxy de
// idioma não corre em `/api/...` nem em ficheiros (ver `src/proxy.ts`), e um
// `/api/nada` ou um `/nada.png` chegam com `api` ou `nada.png` no lugar do
// locale. Sem isto rebentavam com 500 ao procurar textos de um idioma que não
// existe; com isto são 404.
//
// Cada ponto de entrada que lê o locale chama-o: o layout, as páginas e as
// folhas do slot `@footer` renderizam em paralelo, por isso uma guarda só no
// layout não chega. O `dynamicParams = false`, que resolveria tudo num sítio, é
// incompatível com `cacheComponents`.
export function requireLocale(segment: string): Locale {
  if (!hasLocale(locales, segment)) notFound();
  return segment;
}
