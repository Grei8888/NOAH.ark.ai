// Private beta invitation convenience. The URL fragment is browser-only.
// Existing server-side per-request authentication remains authoritative.
const KEY = "noah.beta.reader.invite.v1";

export function readBetaInvitation(): string {
  if (typeof window === "undefined") return "";
  const { hash, pathname, search } = window.location;
  if (hash.startsWith("#join=")) {
    const candidate = decodeURIComponent(hash.slice(6));
    window.history.replaceState(window.history.state, "", pathname + search);
    if (!/^[a-zA-Z0-9_-]{32,128}$/.test(candidate)) return "";
    try { window.sessionStorage.setItem(KEY, candidate); } catch { /* storage disabled */ }
    return candidate;
  }
  try {
    const current = window.sessionStorage.getItem(KEY) || "";
    return /^[a-zA-Z0-9_-]{32,128}$/.test(current) ? current : "";
  } catch { return ""; }
}

export function forgetBetaInvitation(): void {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(KEY); } catch { /* storage disabled */ }
}
