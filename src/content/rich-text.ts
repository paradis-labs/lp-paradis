import sanitizeHtml from "sanitize-html";
import type { RichText } from "./types";

// A única porta por onde HTML de rich text entra no domínio.
//
// Os dois CMS da migração produzem HTML — o Payload por conversão de Lexical no
// provider, o Directus nativamente no WYSIWYG — e é por isso que o domínio é
// HTML e não uma árvore. Mas HTML authorado não é HTML confiável: passa por uma
// allowlist antes de ganhar o tipo `RichText`, e é esse tipo que o componente
// exige para o pôr no DOM.
//
// A allowlist é o que as respostas das FAQ usam hoje, mais o mínimo para não
// partir conteúdo razoável: parágrafos, ênfase, listas, links, quebras. Um
// `<script>`, um `onclick` ou um `style` não sobrevivem.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "code",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Links para fora do site não podem alcançar o nosso `window`.
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return {
        tagName,
        attribs: external
          ? { ...attribs, rel: "noopener noreferrer" }
          : attribs,
      };
    },
  },
};

export function toRichText(html: string): RichText {
  return sanitizeHtml(html, OPTIONS) as RichText;
}
