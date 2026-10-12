/** Server-only Google Forms receiver configuration. Never expose the script URL or secret to clients. */
export function googleFeedbackConfigured() {
  return Boolean(feedbackScriptUrl() && process.env.NOAH_FEEDBACK_SCRIPT_SECRET?.trim());
}

export function feedbackScriptUrl(): string | null {
  try {
    const value = process.env.NOAH_FEEDBACK_SCRIPT_URL ?? "";
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "script.google.com" ||
        !/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname) ||
        url.search || url.hash || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}
