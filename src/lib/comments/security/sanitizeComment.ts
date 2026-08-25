import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes user-generated comment content.
 *
 * Comments are plain text only.
 * HTML, scripts, attributes, and unsafe content are removed.
 */
export function sanitizeComment(input: string): string {
  if (!input) {
    return "";
  }

  const sanitized = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},

    disallowedTagsMode: "discard",
  });

  return sanitized.replace(/\s+/g, " ").trim();
}
