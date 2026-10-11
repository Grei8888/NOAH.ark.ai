/**
 * CI-only live upstream RSS → disposable PostgreSQL 17 → server-rendered /sources.
 * Never use Neon credentials or a production DB, never print publisher text or tokens.
 */
import assert from 'node:assert/strict';
import { runPipeline } from '../lib/pipeline';
import { prisma } from '../lib/db/prisma';
import { getSourceLinks, sourceDiscoveryEnabled } from '../lib/source-links';

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function verify() {
  assert.equal(process.env.DB_MODE, 'postgres');
  assert.equal(process.env.NEWS_PROVIDER, 'government');
  assert.equal(process.env.AI_PROVIDER, 'off');
  assert.equal(process.env.SOURCE_LINKS_ENABLED, 'true');
  assert.equal(sourceDiscoveryEnabled(), true);
  // Defense in depth: never accidentally run on Neon or a publicly reachable DB.
  const dbURL = new URL(process.env.DATABASE_URL ?? '');
  assert.equal(dbURL.hostname, '127.0.0.1', 'Disposable local Postgres only');
  assert.equal(dbURL.port, '5432');

  let complete = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await runPipeline('collect');
    if (result.status === 'COMPLETED' && result.articlesFetched > 0 && result.articlesInserted > 0) {
      complete = true;
      console.log(JSON.stringify({ stage: 'collect', attempt, status: result.status,
        fetched: result.articlesFetched, inserted: result.articlesInserted, aiRequests: result.aiRequests }));
      assert.equal(result.aiRequests, 0);
      break;
    }
    console.warn(JSON.stringify({ stage: 'collect', attempt, status: result.status, fetched: result.articlesFetched,
      inserted: result.articlesInserted, aiRequests: result.aiRequests }));
    if (attempt < 3) await wait(1500);
  }
  assert(complete, 'No complete live source collection; fail closed without publishing');

  const [articles, events, arks, latest] = await Promise.all([
    prisma.article.findMany({ select: { id: true, provider: true, sourceType: true, sourceDomain: true,
      description: true, contentSnippet: true, imageUrl: true, publishedAt: true }, take: 100 }),
    prisma.event.count(),
    prisma.dailyArk.count(),
    prisma.pipelineLog.findFirst({ orderBy: { startedAt: 'desc' }, select: { status: true, aiRequests: true } }),
  ]);
  assert(articles.length > 0, 'RSS was fetched but no articles persisted');
  assert.equal(latest?.status, 'COMPLETED');
  assert.equal(latest?.aiRequests, 0);
  assert.equal(events, 0, 'No Events may be created in source-only mode');
  assert.equal(arks, 0, 'No published editions may be created in source-only mode');
  for (const article of articles) {
    assert.equal(article.provider, 'government');
    assert.equal(article.sourceType, 'GOVERNMENT');
    assert(['mss.go.kr', 'www.mss.go.kr'].includes(article.sourceDomain));
    assert.equal(article.description, '', 'Do not store descriptions without rights clearance');
    assert.equal(article.contentSnippet, '', 'Do not store body snippets without rights clearance');
    assert.equal(article.imageUrl, null, 'Do not store unlicensed photos');
  }

  const links = await getSourceLinks();
  assert(links.length > 0, 'Source reader returned no attributed original links');
  assert(links.length <= 40);
  for (const link of links) {
    const url = new URL(link.url);
    assert.equal(url.protocol, 'https:');
    assert(['mss.go.kr', 'www.mss.go.kr'].includes(url.hostname));
    assert(link.title.length > 0 && link.sourceName.length > 0);
    assert(Number.isFinite(new Date(link.publishedAt).getTime()));
  }
  // HTTP round trip verifies Next.js server can read the same disposable Postgres.
  let response: Response | undefined;
  for (let i = 0; i < 35; i++) {
    try {
      response = await fetch('http://127.0.0.1:3104/sources', { signal: AbortSignal.timeout(2500) });
      if (response.ok) break;
    } catch { /* allow Next startup time */ }
    await wait(600);
  }
  assert(response?.ok, 'Next.js did not serve /sources');
  const html = await response.text();
  assert(html.includes('원문 기사·공고 열기'), 'Original link UI did not render');
  assert(html.includes('AI 브리핑·Event 분석·추천이 아닙니다'), 'Required source-only disclosure absent');
  assert(/href="https:\/\/(?:www\.)?mss\.go\.kr\//.test(html), 'Actual HTTPS government publisher link missing from HTML');
  assert(!html.includes('가상 Event로 동작을 확인하는 화면'), 'Demo content leaked into live source reader');

  const arkResponse = await fetch('http://127.0.0.1:3104/api/ark');
  assert.equal(arkResponse.status, 200);
  const edition = await arkResponse.json() as { mode: string; items: unknown[] };
  assert.equal(edition.mode, 'live');
  assert.deepEqual(edition.items, [], 'Collected sources must not masquerade as analyzed Events');

  await assert.rejects(() => runPipeline('full'), /Source-only mode permits collect only/);

  console.log(JSON.stringify({ stage: 'render', result: 'PASS', sources: links.length,
    events, editions: arks, liveMode: edition.mode, aiRequests: 0 }));
}

verify().catch(error => {
  console.error(error instanceof Error ? error.message : 'Source-only e2e failed');
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
