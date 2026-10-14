// Private beta invitation convenience. The URL fragment is browser-only.
// Existing server-side per-request authentication remains authoritative.
const KEY = "noah.beta.reader.invite.v1";
let inMemoryCode = "";
const validShape = (value: string) => /^[a-zA-Z0-9_-]{32,128}$/.test(value);

// This stores a candidate, never proof of server authentication.
export function rememberBetaInvitation(code: string): void {
  if (typeof window === "undefined" || !validShape(code)) return;
  inMemoryCode = code;
  try { window.sessionStorage.setItem(KEY, code); } catch { /* tab-memory fallback */ }
}

export function readBetaInvitation(): string {
  if (typeof window === "undefined") return "";
  const { hash, pathname, search } = window.location;
  if (hash.startsWith("#join=")) {
    const candidate = hash.slice(6);
    window.history.replaceState(window.history.state, "", pathname + search);
    // A new link must not silently fall back to an older user's invitation.
    forgetBetaInvitation();
    if (!validShape(candidate)) return "";
    rememberBetaInvitation(candidate);
    return candidate;
  }
  try {
    const current = window.sessionStorage.getItem(KEY) || "";
    return validShape(current) ? current : inMemoryCode;
  } catch { return inMemoryCode; }
}

export function forgetBetaInvitation(): void {
  inMemoryCode = "";
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(KEY); } catch { /* storage disabled */ }
}
