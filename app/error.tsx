"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="failurePage">
      <span className="railEyebrow">NOAH ARK</span>
      <h1>발행본을 불러오지 못했습니다.</h1>
      <p>
        데이터 연결 또는 분석 상태를 확인해야 합니다. 가상 데이터로 대체하지
        않았습니다.
      </p>
      <button className="primaryButton" onClick={reset}>
        다시 시도
      </button>
      <Link href="/">Home으로</Link>
    </main>
  );
}
