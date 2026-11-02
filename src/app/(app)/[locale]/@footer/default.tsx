// **Este ficheiro é a rede de 404 do slot.** Um slot de rota paralela sem
// `default.tsx` faz o Next devolver 404 na *página inteira*, não só no slot,
// quando uma navegação dura atinge uma rota que o slot não cobre. É por isso
// que ele existe antes de qualquer variante, e por isso que remover uma
// composição especializada é seguro mas remover este ficheiro não é.
//
// Só vale em hard navigation. Numa navegação soft o Next nunca usa
// `default.tsx`: mantém a última folha activa do slot, mesmo que ela não case
// com a URL nova. É isso que `page.tsx` e `[...catchAll]/page.tsx` cobrem (#14).
export { default } from "./base-footer";
