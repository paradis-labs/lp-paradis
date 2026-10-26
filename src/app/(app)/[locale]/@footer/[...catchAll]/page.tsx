// Qualquer rota sem composição própria neste slot, em soft navigation.
//
// A doc de parallel routes é explícita: "client-side navigations to a route
// that no longer match the slot will remain visible" — o slot mantém a folha
// anterior em vez de cair no `default.tsx`. Um catch-all faz o slot casar com
// todas as rotas, e as folhas específicas (`get-quote/`) continuam a ganhar por
// serem segmentos estáticos. Ver `@footer/default.tsx` e #14.
export { default } from "../base-footer";
