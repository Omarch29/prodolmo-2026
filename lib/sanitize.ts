import sanitizeHtml from "sanitize-html";

// Solo formato básico, sin atributos ni links/imágenes (anti-XSS). El editor
// produce este subconjunto; igual se sanitiza en el server antes de guardar.
const ALLOWED_TAGS = ["b", "strong", "i", "em", "s", "strike", "del", "u", "p", "br", "ul", "ol", "li"];

/** Sanitiza el HTML de un comentario a un subconjunto seguro de formato. */
export function sanitizeComment(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

/** Texto plano de un HTML (para previews y validar longitud real). */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
