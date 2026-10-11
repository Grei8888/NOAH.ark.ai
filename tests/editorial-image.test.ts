import { describe, expect, it } from "vitest";
import { canDisplayEditorialImage, type EditorialImage } from "@/lib/home/editorial-image";
import type { PublicEvent } from "@/types/domain";

// Only the public identity/source fields participate in the display gate.
const event = {
  id: "event-1",
  isMock: false,
  sources: [{ id: "source-1", url: "https://publisher.example/story" }],
} as PublicEvent;
const image: EditorialImage = {
  eventId: event.id,
  sourceId: "source-1",
  sourceUrl: "https://publisher.example/story",
  sourceRelevant: true,
  src: "https://publisher.example/photo.jpg",
  alt: "기사에 등장하는 실증 현장",
  credit: "사진: 원문 발행사",
  rights: { status: "cleared", license: "CC BY 4.0", referenceUrl: "https://publisher.example/rights" },
};

describe("editorial image display gate", () => {
  it("allows a cleared image tied to an actual live Event source", () => {
    expect(canDisplayEditorialImage(event, image)).toBe(true);
  });
  it("rejects mock Events, unrelated imagery and mismatched Event/source identities", () => {
    expect(canDisplayEditorialImage({ ...event, isMock: true }, image)).toBe(false);
    for (const patch of [
      { sourceRelevant: false }, { eventId: "other" }, { sourceId: "other" },
      { sourceUrl: "https://publisher.example/other" },
    ]) expect(canDisplayEditorialImage(event, { ...image, ...patch })).toBe(false);
  });
  it("rejects pending or undocumented rights and absent attribution/alt text", () => {
    for (const rights of [
      { ...image.rights, status: "pending" as const },
      { ...image.rights, license: " " },
      { ...image.rights, referenceUrl: "" },
    ]) expect(canDisplayEditorialImage(event, { ...image, rights })).toBe(false);
    expect(canDisplayEditorialImage(event, { ...image, credit: " " })).toBe(false);
    expect(canDisplayEditorialImage(event, { ...image, alt: " " })).toBe(false);
  });
  it("rejects unsafe, malformed or credential-bearing image and attribution URLs", () => {
    for (const src of ["http://publisher.example/photo.jpg", "javascript:alert(1)", "data:image/png;base64,test", "broken", "https://user:password@publisher.example/photo.jpg"])
      expect(canDisplayEditorialImage(event, { ...image, src })).toBe(false);
    expect(canDisplayEditorialImage(event, { ...image, rights: { ...image.rights, referenceUrl: "javascript:alert(1)" } })).toBe(false);
  });
});
