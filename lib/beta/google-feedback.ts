/**
 * Real Google Forms response links are supplied only after the owner creates
 * and publishes an external form. No dummy form URL may be shown as working.
 */
export type FeedbackFormConfig = {
  formUrl: string;
  nicknameField: string;
  kindField: string;
  messageField: string;
};

export const FEEDBACK_TYPES = [
  "사용 중 불편함",
  "오류 제보",
  "개선 아이디어",
  "좋았던 점",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

function validGoogleFormUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "docs.google.com" ||
        !/^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform\/?$/.test(url.pathname) ||
        url.username || url.password || url.hash) return null;
    // Keep only the canonical Google Forms responder endpoint.
    url.search = "";
    return url.toString();
  } catch { return null; }
}

const validField = (v: string): boolean => /^entry\.[0-9]{5,25}$/.test(v);

export function validateFeedbackFormConfig(env: {
  url?: string; nickname?: string; kind?: string; message?: string;
}): FeedbackFormConfig | null {
  const formUrl = validGoogleFormUrl(env.url ?? "");
  const nicknameField = env.nickname ?? "";
  const kindField = env.kind ?? "";
  const messageField = env.message ?? "";
  if (!formUrl || ![nicknameField, kindField, messageField].every(validField)) return null;
  if (new Set([nicknameField, kindField, messageField]).size !== 3) return null;
  return { formUrl, nicknameField, kindField, messageField };
}

export function getConfiguredGoogleFeedback(): FeedbackFormConfig | null {
  return validateFeedbackFormConfig({
    url: process.env.NOAH_FEEDBACK_FORM_URL,
    nickname: process.env.NOAH_FEEDBACK_NICKNAME_FIELD,
    kind: process.env.NOAH_FEEDBACK_KIND_FIELD,
    message: process.env.NOAH_FEEDBACK_MESSAGE_FIELD,
  });
}

export function buildFeedbackPrefillLink(config: FeedbackFormConfig, data: {
  nickname: string; kind: FeedbackType; message: string;
}): string {
  const url = new URL(config.formUrl);
  url.searchParams.set("usp", "pp_url");
  url.searchParams.set(config.nicknameField, data.nickname.slice(0, 40));
  url.searchParams.set(config.kindField, data.kind);
  url.searchParams.set(config.messageField, data.message.slice(0, 1500));
  return url.toString();
}
