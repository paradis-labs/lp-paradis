import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import {
  type ContentCollection,
  type ContentRead,
  collectionTag,
  readTag,
} from "@/content/cache-tags";

// A invalidação da cache de `@/content` quando um editor grava no `/admin` (#15).
//
// **PROVISÓRIO.** Existe enquanto o Payload é o CMS. Na fase 3 de
// `migrate-cms-to-directus` um Flow do Directus passa a invalidar as mesmas
// tags; na fase 5 este ficheiro sai com `src/collections/`. As tags não são
// daqui: vêm de `@/content/cache-tags`, e é por isso que a troca não toca na
// cache.
//
// `"max"` é stale-while-revalidate: o pedido seguinte ainda pode servir a versão
// antiga enquanto a nova é buscada, e o pedido depois desse já a mostra.
//
// Uma falha aqui não pode impedir a gravação — o editor perderia o trabalho por
// causa de uma cache. Fica registada, e a expiração máxima de
// `CONTENT_MAX_AGE_SECONDS` corrige-a sozinha. Falha de facto fora de um pedido
// (um script com a Local API, como `payload run`), onde `revalidateTag` não tem
// contexto.
function revalidate(tag: string) {
  try {
    revalidateTag(tag, "max");
  } catch (error) {
    console.error("[cache] revalidateTag falhou", { tag, error });
  }
}

// Todos os locales e não só o editado: com o fallback de locale, um campo
// gravado em `en` também muda o que `/pt` mostra onde `pt` está vazio.
export function revalidateGlobal(read: ContentRead): GlobalAfterChangeHook {
  return ({ doc }) => {
    revalidate(readTag(read));
    return doc;
  };
}

// Uma coleção invalida toda leitura que a popula, pela tag da coleção. Apagar
// também conta: um projecto apagado não pode continuar na homepage em cache.
export function revalidateCollection(collection: ContentCollection): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  const tag = collectionTag(collection);
  return {
    afterChange: [
      ({ doc }) => {
        revalidate(tag);
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidate(tag);
        return doc;
      },
    ],
  };
}
