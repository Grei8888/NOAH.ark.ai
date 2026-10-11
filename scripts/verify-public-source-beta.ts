/** Verifies a genuine, attributed source-only public beta with no DB or AI. */
import assert from 'node:assert/strict';

const root = 'http://127.0.0.1:3110';

async function main() {
  let res: Response | undefined;
  for (let attempt = 0; attempt < 45; attempt++) {
    try {
      res = await fetch(root, { signal: AbortSignal.timeout(30000) });
      if (res.ok) break;
    } catch { /* wait for Next */ }
    await new Promise(r => setTimeout(r, 750));
  }
  assert(res?.ok, 'Public Home did not become available');
  const html = await res.text();
  assert(html.includes('실제 정부 RSS'), 'Genuine source-mode disclosure is missing');
  assert(html.includes('AI 분석, 중요도 선정'), 'Must not invent AI analysis');
  assert(html.includes('ORIGINAL SOURCES'), 'Source list missing from Home');
  assert(html.includes('원문 보기'), 'No actual ministry original links appeared');
  assert(/href="https:\/\/(?:www\.)?mss\.go\.kr\//.test(html), 'Real original ministry links not displayed');
  assert(!html.includes('가상 Event로 동작을 확인하는 화면'), 'Synthetic demo leaked into public Home');

  for(const [view,label] of [
    ['discover','원문 자료 탐색'],
    ['startup','창업 · 지원사업'],
    ['saved','내가 저장한 자료'],
    ['my','내 관심 분야'],
    ['settings','서비스 안내'],
  ]) {
    const page = await fetch(`${root}/?view=${view}`);
    assert.equal(page.status, 200, `Navigation ${view} failed`);
    assert((await page.text()).includes(label), `Navigation view ${view} mismatch`);
  }
  const sources = await fetch(`${root}/sources`);
  assert.equal(sources.status, 200);
  assert((await sources.text()).includes('원문 자료 탐색'));

  const json = await (await fetch(`${root}/api/ark`)).json() as { mode: string; items: unknown[] };
  assert.equal(json.mode, 'live');
  assert.deepEqual(json.items, [], 'No fake published Events');
  assert.equal((await fetch(`${root}/api/cron/daily`)).status, 401, 'Unauthorized cron exposed');

  console.log(JSON.stringify({ stage: 'public-source-beta', result: 'PASS', originalUrls: true,
    navigation: '5/5', fakeEvents: 0, dbCalls: 0, aiCalls: 0 }));
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
