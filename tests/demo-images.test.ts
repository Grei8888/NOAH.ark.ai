import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { canDisplayDemoImage, demoImageForEvent, DEMO_IMAGES } from "@/lib/home/demo-images";
import type { PublicEvent } from "@/types/domain";

const image = DEMO_IMAGES[0];
const event = { isMock: true, representativeTitle: image.eventTitle } as PublicEvent;

describe("curated demo image isolation", () => {
  it("requires both the Mock edition and a synthetic Event, even when a title matches", () => {
    expect(demoImageForEvent(event, "mock")).toEqual(image);
    expect(demoImageForEvent(event, "live")).toBeUndefined();
    expect(demoImageForEvent({ ...event, isMock: false }, "mock")).toBeUndefined();
  });
  it("leaves unfamiliar or unrelated synthetic scenarios text-only", () => {
    expect(demoImageForEvent({ ...event, representativeTitle: "다른 사건" }, "mock")).toBeUndefined();
    expect(canDisplayDemoImage(event, DEMO_IMAGES[1], "mock")).toBe(false);
  });
  it("rejects non-local images, incomplete credits and unsafe attribution links", () => {
    for (const patch of [
      { src: "https://example.org/photo.jpg" }, { src: "/demo/../photo.jpg" },
      { alt: " " }, { credit: "" }, { license: "" }, { width: 0 },
      { sourceUrl: "javascript:alert(1)" }, { licenseUrl: "http://example.org/license" },
      { sourceUrl: "https://user:password@example.org/photo" },
    ]) expect(canDisplayDemoImage(event, { ...image, ...patch }, "mock")).toBe(false);
  });
  it("ships the curated assets locally with usable metadata and explicit demo alt text", () => {
    for (const candidate of DEMO_IMAGES) {
      expect(existsSync(resolve("public", candidate.src.slice(1)))).toBe(true);
      expect(candidate.alt).toContain("데모 예시");
      expect(canDisplayDemoImage({ ...event, representativeTitle: candidate.eventTitle }, candidate, "mock")).toBe(true);
    }
  });
});
