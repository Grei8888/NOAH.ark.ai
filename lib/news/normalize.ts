const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid"
];

export function normalizeUrl(input: string): string {
  try {
    const url = new URL(input);
    TRACKING_PARAMS.forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return input.trim();
  }
}

export function normalizeTitle(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .replace(/[｜|]\s*[^｜|]{1,20}$/u, "")
    .trim()
    .toLowerCase();
}
