import type { PublicEvent } from "@/types/domain";

// Presentation-only contract. A provider image URL alone is not rights clearance.
// A reviewed source/rights adapter must supply this; the public DTO is unchanged.
export interface EditorialImage {
  eventId: string;
  sourceId: string;
  sourceUrl: string;
  sourceRelevant: boolean;
  src: string;
  alt: string;
  credit: string;
  rights: {
    status: "cleared" | "pending";
    license: string;
    referenceUrl: string;
  };
}

function isHTTPS(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function canDisplayEditorialImage(event: PublicEvent, image: EditorialImage) {
  return (
    !event.isMock &&
    image.eventId === event.id &&
    image.sourceRelevant &&
    image.rights.status === "cleared" &&
    Boolean(image.rights.license.trim()) &&
    Boolean(image.alt.trim()) &&
    Boolean(image.credit.trim()) &&
    isHTTPS(image.src) &&
    isHTTPS(image.sourceUrl) &&
    isHTTPS(image.rights.referenceUrl) &&
    event.sources.some(source => source.id === image.sourceId && source.url === image.sourceUrl)
  );
}
