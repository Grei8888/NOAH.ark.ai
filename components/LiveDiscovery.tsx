"use client";

import { useEffect, useState } from "react";

type Article = { title: string; url: string; publishedAt: string; source: string; category: string };
type Discovery = { mode: string; warning: string; fetchedAt: string; articles: Article[]; errors: { category: string; error: string }[] };

export function LiveDiscovery() {
  const [data, setData] = useState<Discovery | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/discovery", { signal: controller.signal, cache: "no-store" })
      .then(async response => { if (!response.ok) throw new Error("HTTP " + response.status); return response.json() as Promise<Discovery>; })
      .then(setData).catch(e => { if (!controller.signal.aborted) setError(String(e)); });
    return () => controller.abort();
  }, []);
  return <main className="reviewShell">
    <p className="reviewEyebrow">NOAH · LIVE DISCOVERY</p>
    <h1>실시간 기사 탐색</h1>
    <div className="reviewWarning" role="alert">
      검증 전 수집 기사입니다. NOAH 분석 보고서가 아니며, 사실 확인이나 사건 중복 제거가 완료되지 않았습니다. 직원에게 공유하지 마세요.
    </div>
    {!data && !error && <p>RSS에서 기사를 불러오는 중입니다.</p>}
    {error && <p role="alert">수집 오류: {error}</p>}
    {data && <>
      <p className="reviewIntro">수집 시각: {new Date(data.fetchedAt).toLocaleString("ko-KR")} · {data.articles.length}건</p>
      {data.errors.length > 0 && <div className="reviewWarning">일부 수집 실패: {data.errors.map(e=>e.category).join(", ")}</div>}
      {data.articles.length === 0 && <p>현재 표시할 기사가 없습니다. 잠시 후 다시 확인해 주세요.</p>}
      <div className="reviewItems">
        {data.articles.map(article => <article className="reviewItem" key={article.url}>
          <div className="reviewMeta">{article.category} · {article.source || "출처 확인 필요"}</div>
          <h2>{article.title}</h2>
          <p>{new Date(article.publishedAt).toLocaleString("ko-KR")}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">Google News 원문 연결 페이지 열기 ↗</a>
        </article>)}
      </div>
    </>}
  </main>;
}
