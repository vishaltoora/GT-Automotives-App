/**
 * Comparing email addresses.
 *
 * Shared by the browser and the server so "is this address already on file?"
 * has one answer. It had three, all case-sensitive, and the result was customer
 * profiles carrying `jason@example.ca` and `Jason@example.ca` as separate
 * addresses — the same inbox listed twice on every email dialog, and a list
 * that grows by one every time somebody capitalises differently.
 *
 * RFC 5321 does allow the local part to be case-sensitive, so these functions
 * compare case-insensitively without ever rewriting what the user typed:
 * `dedupeEmails` keeps the first spelling it saw. Not duplicating an address is
 * a much smaller claim than deciding its canonical form.
 */

/** The form used for comparison only — never for storage or display. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Whether two addresses reach the same inbox, for practical purposes. */
export function isSameEmail(a: string, b: string): boolean {
  return normalizeEmail(a) === normalizeEmail(b);
}

/** Whether a list already holds this address, ignoring case and surrounding space. */
export function containsEmail(
  list: readonly (string | null | undefined)[],
  email: string
): boolean {
  return list.some((candidate) => !!candidate && isSameEmail(candidate, email));
}

/**
 * Remove blanks and repeats, keeping the first spelling of each address and the
 * order they arrived in — the primary address stays first where callers pass it
 * first.
 */
export function dedupeEmails(
  emails: readonly (string | null | undefined)[]
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const email of emails) {
    if (!email) continue;
    const trimmed = email.trim();
    if (trimmed === '') continue;

    const key = normalizeEmail(trimmed);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}
