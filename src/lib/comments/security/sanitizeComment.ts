/**
 * Sanitizes plain-text comments.
 *
 * Removes HTML tags and normalizes whitespace.
 */
export function sanitizeComment(input: string): string {
  if (!input) {
    return "";
  }

  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}