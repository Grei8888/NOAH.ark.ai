/** Explicit mode boundary. Live failures never enable synthetic providers. */
export function runtimeMode() {
  const provider = process.env.NEWS_PROVIDER ?? (process.env.NODE_ENV === 'production' ? '' : 'mock');
  if (!['mock', 'newsapi', 'rss', 'government'].includes(provider)) throw new Error('Configure NEWS_PROVIDER explicitly');
  const isMock = provider === 'mock';
  const ai = process.env.AI_PROVIDER ?? (isMock ? 'mock' : '');
  if (isMock ? ai !== 'mock' : ai !== 'openai') throw new Error('News and analysis modes must agree');
  return { provider, isMock };
}
