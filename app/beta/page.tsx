import type { Metadata } from "next";
import { BetaTesterKit } from "@/components/beta/BetaTesterKit";
import { getConfiguredGoogleFeedback } from "@/lib/beta/google-feedback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "베타테스터 초대 | NOAH ARK",
  description: "NOAH ARK 무료 베타를 직접 사용하고 점검표와 의견을 공유하세요. 회원가입 없이 약 5분.",
  robots: { index: false, follow: false },
};

export default function BetaPage() {
  return <BetaTesterKit feedbackReady={Boolean(getConfiguredGoogleFeedback())} />;
}
