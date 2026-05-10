/** Normalize user-typed handle prefix (before `.oishi`). */
export function normalizeHandlePrefix(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @returns error message or null if valid */
export function validateHandlePrefix(prefix: string): string | null {
  if (prefix.length < 3) return "Use at least 3 characters.";
  if (prefix.length > 20) return "Use at most 20 characters.";
  if (!/^[a-z0-9]/.test(prefix)) return "Must start with a letter or number.";
  if (!/[a-z0-9]$/.test(prefix)) return "Can't end with a hyphen.";
  if (/--/.test(prefix)) return "No consecutive hyphens.";
  return null;
}

export function fullOishiHandle(prefix: string): string {
  return `@${prefix}.oishi`;
}
