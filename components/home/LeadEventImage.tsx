"use client";
import Image from "next/image";
import { useState } from "react";
import type { PublicEvent } from "@/types/domain";
import { canDisplayEditorialImage, type EditorialImage } from "@/lib/home/editorial-image";

export function LeadEventImage({ event, image }: { event: PublicEvent; image: EditorialImage }) {
  const [failed, setFailed] = useState(false);
  if (failed || !canDisplayEditorialImage(event, image)) return null;
  return (
    <figure className="leadEventImage">
      <Image src={image.src} alt={image.alt} width={1200} height={800} unoptimized onError={() => setFailed(true)} />
      <figcaption>
        <span>{image.credit}</span>
        <a href={image.sourceUrl} target="_blank" rel="noreferrer">이미지 출처</a>
        <a href={image.rights.referenceUrl} target="_blank" rel="noreferrer">{image.rights.license}</a>
      </figcaption>
    </figure>
  );
}
