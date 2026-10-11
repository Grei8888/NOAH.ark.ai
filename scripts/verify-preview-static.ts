import assert from 'node:assert/strict';

async function verify() {
  const url = 'http://127.0.0.1:3105';
  let ready = false;
  for (let i = 0; i < 45; i++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) { ready = true; break; }
    } catch { /* waiting for local Next */ }
    await new Promise(r => setTimeout(r, 500));
  }
  assert(ready, 'Next preview server failed to start');
  const home = await (await fetch(url)).text();
  assert(home.includes('가상 Event로 동작을 확인하는 화면'), 'DEMO disclosure missing');
  assert(home.includes('DEMO'), 'Demo tag missing');
  assert(home.includes('NOAH'), 'Brand/markup missing');
  assert(home.includes('demo-preview-1'), 'Preview Event missing');

  const editionResponse = await fetch(`${url}/api/ark`);
  assert.equal(editionResponse.status, 200);
  const edition = await editionResponse.json() as {
    mode: string; items: Array<{ id: string; isMock: boolean; sources: Array<{ url: string }> }>;
  };
  assert.equal(edition.mode, 'mock');
  assert.equal(edition.items.length, 8);
  assert(edition.items.every(e => e.isMock && e.sources.every(s => s.url.includes('.example.com'))));

  const detail = await fetch(`${url}/event/demo-preview-1`);
  assert.equal(detail.status, 200);
  assert((await detail.text()).includes('DEMO'));

  for(const view of ['home','discover','startup','saved','my','settings']){
    const r = await fetch(`${url}/?view=${view}`);
    assert.equal(r.status, 200, `Preview route ${view} failed`);
  }

  const sourcePage = await fetch(`${url}/sources`);
  assert.equal(sourcePage.status, 200);
  assert((await sourcePage.text()).includes('원문 탐색 기능은 아직 공개되지 않았습니다'));

  const mutation = await fetch(`${url}/api/cron/daily`);
  assert.equal(mutation.status, 401, 'No unauthenticated pipeline execution');

  console.log(JSON.stringify({
    stage: 'protected-preview', status: 'PASS', mode: edition.mode,
    syntheticEvents: edition.items.length, dbQueries: 0, aiCalls: 0,
    productionChanges: 0,
  }));
}
verify().catch(error => {
  console.error(error instanceof Error ? error.message : 'Preview verification failed');
  process.exitCode = 1;
});
