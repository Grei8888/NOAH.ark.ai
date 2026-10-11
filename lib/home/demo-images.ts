import type { PublicEvent } from "@/types/domain";

// Explicit artwork for two known synthetic scenarios, never provider news imagery.
export interface DemoImage {
  kind: "demo";
  eventTitle: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

export const DEMO_IMAGES: readonly DemoImage[] = [
  {
    kind: "demo",
    eventTitle: "서울 스타트업 정부지원사업 창업기업 모집",
    src: "/demo/coworking-columbus.jpg",
    width: 1000,
    height: 750,
    alt: "데모 예시: 미국 콜럼버스의 공유 업무 공간. 서울 지원사업의 실제 현장이 아닙니다.",
    credit: "Benlande",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Coworking_Space_in_Columbus_Ohio.jpg",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    kind: "demo",
    eventTitle: "서울 Physical AI 실증사업 참여기업 모집",
    src: "/demo/robotic-guitar-polishing.jpg",
    width: 6000,
    height: 4000,
    alt: "데모 예시: Martin Guitar 공장에서 기타를 연마하는 로봇 팔. 서울 실증사업의 실제 현장이 아닙니다.",
    credit: "Henrysz",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Robotic_Arm_Polishing_Guitars_at_Martin_Guitar_Factory.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
];

export function canDisplayDemoImage(event: PublicEvent, image: DemoImage, mode: "mock" | "live") {
  return mode === "mock" && event.isMock && image.kind === "demo" &&
    event.representativeTitle === image.eventTitle &&
    /^\/demo\/[a-z0-9-]+\.(jpg|png|webp)$/.test(image.src) &&
    image.width > 0 && image.height > 0 &&
    safeAttributionUrl(image.sourceUrl) && safeAttributionUrl(image.licenseUrl) &&
    Boolean(image.alt.trim()) && Boolean(image.credit.trim()) && Boolean(image.license.trim());
}

function safeAttributionUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function demoImageForEvent(event: PublicEvent, mode: "mock" | "live") {
  const image = DEMO_IMAGES.find(candidate => candidate.eventTitle === event.representativeTitle);
  return image && canDisplayDemoImage(event, image, mode) ? image : undefined;
}
