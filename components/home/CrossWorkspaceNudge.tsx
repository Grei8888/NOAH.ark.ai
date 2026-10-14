import Link from "next/link";
import { Icon } from "@/components/home/Icon";

/** A secondary route invitation, placed between relevant sections rather
 * than at the bottom of an unrelated feed. */
export function CrossWorkspaceNudge({ from }: { from: "news" | "business" }) {
  const news = from === "news";
  return (
    <aside className="crossWorkspaceNudge" aria-label="다른 정보 영역 살펴보기">
      <div className="crossWorkspaceCopy">
        <span>{news ? "FROM NEWS TO OPPORTUNITY" : "FROM POLICY TO CONTEXT"}</span>
        <strong>{news ? "이 뉴스와 연결되는 사업기회도 찾아보세요." : "정책의 배경과 시장 반응이 궁금하신가요?"}</strong>
        <p>{news ? "지원사업·R&D·공공입찰을 별도 화면에서 확인할 수 있습니다." : "언론사 뉴스와 AI 독해는 뉴스 메뉴에서 이용할 수 있습니다."}</p>
      </div>
      <Link href={news ? "/?view=startup" : "/?view=discover"} className="crossWorkspaceAction">
        {news ? "사업기회 보기" : "뉴스 살펴보기"} <Icon name="arrow" />
      </Link>
    </aside>
  );
}
