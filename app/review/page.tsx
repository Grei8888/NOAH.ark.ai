import { getTodaysArk } from "@/lib/ark/today";
import { MorningReview } from "@/components/MorningReview";

export const metadata = {
  title: "NOAH | Morning Review Demo",
  description: "모의 뉴스 기반 모바일 검토 화면. 실제 발행 기능 없음."
};

export default function ReviewPage() {
  return <MorningReview events={getTodaysArk()} />;
}
