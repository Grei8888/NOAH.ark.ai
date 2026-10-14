// Explicit local QA preload only. All external I/O is replaced or refused.
if (process.env.NOAH_READER_TEST_FIXTURES !== 'true') throw new Error('Reader test fixture requires explicit opt-in');
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const value = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(value);
  if (url.origin === 'https://mss.go.kr' && url.pathname.startsWith('/rss/')) {
    return new Response(`<rss version="2.0"><channel><item><title>회귀 테스트 · 정책자금 지원</title><link>https://mss.go.kr/reader-auth-fixture</link><pubDate>${new Date(Date.now() - 3600000).toUTCString()}</pubDate></item></channel></rss>`, { status: 200 });
  }
  if (url.origin === 'https://serpapi.com' && url.pathname === '/search.json') {
    return Response.json({ news_results: [{ title: '회귀 테스트 · 경제 정책자금 이해', link: 'https://publisher.example/reader-auth-fixture', source: { name: 'UI 테스트 출처' } }] });
  }
  if (url.href === 'https://api.openai.com/v1/responses') {
    const body = JSON.parse(String(init?.body));
    if (body.store !== false || body.max_output_tokens !== 550) throw new Error('Unexpected model request contract');
    if (body.input.includes('provider-failure')) return new Response('{}', { status: 503 });
    return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: '회귀 테스트용 용어 설명입니다.' }] }] });
  }
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return originalFetch(input, init);
  throw new Error('External access is disabled in the reader authentication test');
};
