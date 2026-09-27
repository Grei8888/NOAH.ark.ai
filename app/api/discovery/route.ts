import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FEEDS = [
  { label: "부동산·주택", url: "https://news.google.com/rss/search?q="+encodeURIComponent("LH 주택 공급 인허가 when:1d")+"&hl=ko&gl=KR&ceid=KR:ko" },
  { label: "정부 정책", url: "https://news.google.com/rss/search?q="+encodeURIComponent("정부 정책 지원사업 when:1d")+"&hl=ko&gl=KR&ceid=KR:ko" },
  { label: "AI 산업", url: "https://news.google.com/rss/search?q="+encodeURIComponent("인공지능 AI 산업 when:1d")+"&hl=ko&gl=KR&ceid=KR:ko" }
] as const;

function unescapeXml(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function field(item: string, tag: string): string {
  const match = item.match(new RegExp("<"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+tag+">", "i"));
  return match ? unescapeXml(match[1]).trim() : "";
}
function validLink(url: string): boolean {
  try { const u = new URL(url); return u.protocol === "https:" && u.hostname === "news.google.com"; }
  catch { return false; }
}
export async function GET() {
  const results = await Promise.all(FEEDS.map(async feed => {
    try {
      const response = await fetch(feed.url, { signal: AbortSignal.timeout(7000), cache: "no-store", headers: { "User-Agent": "NOAH-MVP/0.1" } });
      if (!response.ok) throw new Error("RSS HTTP " + response.status);
      const xml = await response.text();
      if (xml.length > 2_000_000 || !xml.includes("<rss")) throw new Error("Unexpected RSS response");
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 15);
      return { category: feed.label, items: items.map(m => {
        const title = field(m[1], "title");
        const url = field(m[1], "link");
        const publishedAt = field(m[1], "pubDate");
        const source = field(m[1], "source");
        return { title, url, publishedAt, source, category: feed.label };
      }).filter(x => x.title && validLink(x.url) && !Number.isNaN(Date.parse(x.publishedAt))), error: null };
    } catch (error) {
      return { category: feed.label, items: [], error: error instanceof Error ? error.message : "RSS fetch failed" };
    }
  }));
  const seen = new Set<string>();
  const articles = results.flatMap(r => r.items).filter(item => {
    const key = item.url;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a,b) => Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
  return NextResponse.json({
    mode: "live-discovery-unverified",
    warning: "Google News RSS discovery only. Not fact-checked, event-clustered, scored or approved for distribution. Government-policy claims require primary-source verification.",
    fetchedAt: new Date().toISOString(),
    articles,
    errors: results.filter(r=>r.error).map(r=>({category:r.category, error:r.error}))
  }, { headers: { "Cache-Control": "no-store" } });
}
