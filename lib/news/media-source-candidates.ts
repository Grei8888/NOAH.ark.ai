/**
 * Publisher candidate inventory. Intentionally disconnected from production RSS fetching.
 *
 * Presence of a public RSS endpoint does NOT confer public aggregation,
 * republication, storage, or AI-analysis permission. Every candidate is fail-closed.
 * No ideology labels or unreviewed external media imagery.
 */
export type MediaFeedVerification =
  | "publisher-listed"
  | "third-party-reported"
  | "not-confirmed";

export interface MediaSourceCandidate {
  id: string;
  publisher: string;
  family: "broadcast" | "general-newspaper" | "business-newspaper" | "wire";
  sourceClass: "NEWS_MEDIA";
  rssUrl: string | null;
  referenceUrl: string;
  feedVerification: MediaFeedVerification;
  permissionStatus: "not-cleared";
  publicEnabled: false;
}

export const MEDIA_SOURCE_CANDIDATES = [
  {
    id: "ytn", publisher: "YTN", family: "broadcast", sourceClass: "NEWS_MEDIA",
    rssUrl: null, referenceUrl: "https://www.ytn.co.kr/",
    feedVerification: "not-confirmed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "hani", publisher: "한겨레", family: "general-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.hani.co.kr/rss/", referenceUrl: "https://www.hani.co.kr/",
    feedVerification: "third-party-reported", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "khan", publisher: "경향신문", family: "general-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.khan.co.kr/rss/rssdata/total_news.xml", referenceUrl: "https://www.khan.co.kr/help/help_rss.html",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "chosun", publisher: "조선일보", family: "general-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml", referenceUrl: "https://rssplus.chosun.com/",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "donga", publisher: "동아일보", family: "general-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://rss.donga.com/total.xml", referenceUrl: "https://rss.donga.com/",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "mk", publisher: "매일경제", family: "business-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.mk.co.kr/rss/30000001/", referenceUrl: "https://www.mk.co.kr/rss",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "hankyung", publisher: "한국경제", family: "business-newspaper", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.hankyung.com/feed/all-news", referenceUrl: "https://www.hankyung.com/feed",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "sbs", publisher: "SBS", family: "broadcast", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://news.sbs.co.kr/news/newsflashRssFeed.do?plink=RSSREADER", referenceUrl: "https://news.sbs.co.kr/news/rss.do",
    feedVerification: "publisher-listed", permissionStatus: "not-cleared", publicEnabled: false,
  },
  {
    id: "yna", publisher: "연합뉴스", family: "wire", sourceClass: "NEWS_MEDIA",
    rssUrl: "https://www.yna.co.kr/rss/news.xml", referenceUrl: "https://www.yna.co.kr/",
    feedVerification: "third-party-reported", permissionStatus: "not-cleared", publicEnabled: false,
  },
] as const satisfies readonly MediaSourceCandidate[];

/** Fail-closed by design; this inventory is not wired to any live fetcher. */
export function publiclyClearedMediaSources(): readonly MediaSourceCandidate[] {
  return MEDIA_SOURCE_CANDIDATES.filter((source) =>
    source.permissionStatus !== "not-cleared" && source.publicEnabled !== false);
}
