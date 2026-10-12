import { describe, expect, it } from "vitest";
import { READER_AUDIENCES, readerAudienceInfo, validReaderAudience } from "@/lib/news/reader-audience";
import { TODAY_TOPICS } from "@/lib/news/daily-interests";

describe("voluntary reader onboarding", () => {
  it("keeps audiences about reading goals, not age or a presumed economic skill level", () => {
    expect(READER_AUDIENCES.map(a => a.id)).toEqual(["startup", "business", "economy"]);
    expect(new Set(READER_AUDIENCES.map(a => a.id)).size).toBe(3);
    for (const audience of READER_AUDIENCES) {
      expect(audience.label).toBeTruthy();
      expect(readerAudienceInfo(audience.id).id).toBe(audience.id);
    }
  });
  it("accepts only declared browser-local goal IDs, without changing news ingestion", () => {
    expect(validReaderAudience("startup")).toBe("startup");
    expect(validReaderAudience("economy")).toBe("economy");
    expect(validReaderAudience("executive")).toBeNull();
    expect(validReaderAudience({ id: "startup" })).toBeNull();
    expect(validReaderAudience(null)).toBeNull();
  });
  it("only suggests currently supported official-RSS title filters", () => {
    const topics = TODAY_TOPICS.map(t => t.id);
    expect(READER_AUDIENCES.every(a => topics.includes(a.topic))).toBe(true);
  });
});
