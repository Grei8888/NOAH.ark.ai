import type { Metadata } from "next";
import { FeedbackPortal } from "@/components/beta/FeedbackPortal";
import { getConfiguredGoogleFeedback } from "@/lib/beta/google-feedback";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "베타 의견 남기기 | NOAH ARK",
  description: "NOAH ARK 사용 중 느낀 점을 닉네임만으로 간단히 남기고, 원할 때마다 다시 의견을 보낼 수 있습니다.",
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  return <FeedbackPortal config={getConfiguredGoogleFeedback()} />;
}
