import "server-only";
import sanitize from "sanitize-html";

export function sanitizeEditorialHtml(html: string | null | undefined): string {
  return sanitize(html || "", {
    allowedTags: [
      "a",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "span",
      "div",
      "img",
      "figure",
      "figcaption",
      "code",
      "pre",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitize.simpleTransform("a", {
        rel: "noopener noreferrer nofollow ugc",
      }),
    },
  });
}
