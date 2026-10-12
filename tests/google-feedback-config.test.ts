import { describe, expect, it } from "vitest";
import {
  buildFeedbackPrefillLink, FEEDBACK_TYPES, validateFeedbackFormConfig,
} from "@/lib/beta/google-feedback";

const settings = {
  url: "https://docs.google.com/forms/d/e/1FAIpQLSeSample2026/viewform",
  nickname: "entry.123450001",
  kind: "entry.123450002",
  message: "entry.123450003",
};

describe("Google Forms connected tester feedback", () => {
  it("rejects unverified, unsafe, incomplete and duplicate external form configuration", () => {
    expect(validateFeedbackFormConfig(settings)).toBeTruthy();
    expect(validateFeedbackFormConfig({ ...settings, url: "https://forms.google.com.evil.site/forms/d/e/a/viewform" })).toBeNull();
    expect(validateFeedbackFormConfig({ ...settings, url: "http://docs.google.com/forms/d/e/a/viewform" })).toBeNull();
    expect(validateFeedbackFormConfig({ ...settings, url: "https://docs.google.com/other/path" })).toBeNull();
    expect(validateFeedbackFormConfig({ ...settings, message: "entry.__INVALID__" })).toBeNull();
    expect(validateFeedbackFormConfig({ ...settings, kind: settings.nickname })).toBeNull();
    expect(validateFeedbackFormConfig({ ...settings, nickname: "" })).toBeNull();
    expect(validateFeedbackFormConfig({ url: "" })).toBeNull();
  });

  it("pre-fills optional nickname and short text but never submits to Google automatically", () => {
    const config = validateFeedbackFormConfig(settings);
    expect(config).not.toBeNull();
    const url = new URL(buildFeedbackPrefillLink(config!, {
      nickname: "테스터 2 & friends",
      kind: FEEDBACK_TYPES[1],
      message: "모바일에서 돌아가기 버튼이 보이지 않아요.",
    }));
    expect(url.hostname).toBe("docs.google.com");
    expect(url.pathname).toMatch(/\/viewform$/);
    expect(url.searchParams.get("entry.123450001")).toBe("테스터 2 & friends");
    expect(url.searchParams.get("entry.123450002")).toBe("오류 제보");
    expect(url.searchParams.get("entry.123450003")).toBe("모바일에서 돌아가기 버튼이 보이지 않아요.");
    expect(url.searchParams.get("usp")).toBe("pp_url");
    expect(url.pathname).not.toContain("formResponse");
  });
});
