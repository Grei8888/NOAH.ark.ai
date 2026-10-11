"use client";
import Image from "next/image";
import { useState } from "react";
import type { PublicEvent } from "@/types/domain";
import { canDisplayDemoImage, type DemoImage } from "@/lib/home/demo-images";

export function DemoEventImage({ event, image, mode, thumbnail = false }: {
  event: PublicEvent;
  image: DemoImage;
  mode: "mock" | "live";
  thumbnail?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !canDisplayDemoImage(event, image, mode)) return null;
  return (
    <figure className={thumbnail ? "demoEventImage demoEventImage--thumbnail" : "demoEventImage"} data-image-kind="demo">
      <Image
        src={image.src} alt={image.alt} width={image.width} height={image.height}
        sizes={thumbnail ? "(max-width: 767px) 96px, 136px" : "(max-width: 767px) calc(100vw - 78px), (max-width: 1279px) 50vw, 752px"}
        loading={thumbnail ? "lazy" : "eager"}
        onError={() => setFailed(true)}
      />
      <figcaption>
        <span>{thumbnail ? "DEMO 예시" : "DEMO 예시 · 실제 사건 현장 아님"}</span>
        <span className="demoImageCredit">
          <a href={image.sourceUrl} target="_blank" rel="noreferrer" aria-label={`예시 사진 출처: ${image.credit}`}>{image.credit}</a>
          <a href={image.licenseUrl} target="_blank" rel="noreferrer" aria-label={`예시 사진 라이선스: ${image.license}`}>{image.license}</a>
        </span>
      </figcaption>
    </figure>
  );
}
