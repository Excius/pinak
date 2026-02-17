/**
 * Normalizes an email for storage and comparison.
 * - trims whitespace
 * - lowercases the whole address
 * - removes any "+tag" from the local part (everything after '+')
 *
 * Note: this intentionally does NOT remove dots from local-part (only + tags)
 * because dot-handling varies by provider. The goal is consistent, predictable
 * normalization that matches the project's requirements.
 */
export function normalizeEmail(email: string): string {
  if (!email) return email;
  const cleaned = email.trim().toLowerCase();
  const parts = cleaned.split("@");
  if (parts.length !== 2) return cleaned;
  const [rawLocal, domain] = parts as [string, string];
  let local = rawLocal;

  const plusIndex = local.indexOf("+");
  if (plusIndex >= 0) {
    local = local.substring(0, plusIndex);
  }

  return `${local}@${domain}`;
}
