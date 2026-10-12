/** Explicit mode boundary. Live failures never enable synthetic providers. */
export function runtimeMode() {
  const provider = process.env.NEWS_PROVIDER ?? (process.env.NODE_ENV === 'production' ? '' : 'mock');
  if (!['mock', 'newsapi', 'rss', 'government'].includes(provider)) throw new Error('Configure NEWS_PROVIDER explicitly');
  const isMock = provider === 'mock';
  const ai = process.env.AI_PROVIDER ?? (isMock ? 'mock' : '');
  // 'off' permits attributed live RSS collection without pretending analysis exists.
  // The pipeline explicitly disallows processing and publishing in this mode.
  if (isMock ? ai !== 'mock' : !['openai', 'off'].includes(ai)) throw new Error('News and analysis modes must agree');
  return { provider, isMock };
}
