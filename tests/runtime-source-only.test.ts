import { describe, it, expect, afterEach, vi } from 'vitest';
import { runtimeMode } from '@/lib/runtime-mode';
import { runPipeline } from '@/lib/pipeline';

afterEach(() => vi.unstubAllEnvs());

describe('source-only live beta mode', () => {
  it('permits explicit live provider with AI off', () => {
    vi.stubEnv('NEWS_PROVIDER', 'government');
    vi.stubEnv('AI_PROVIDER', 'off');
    expect(runtimeMode()).toEqual({ provider: 'government', isMock: false });
  });
  it('does not permit mock articles mixed with disabled AI', () => {
    vi.stubEnv('NEWS_PROVIDER', 'mock');
    vi.stubEnv('AI_PROVIDER', 'off');
    expect(() => runtimeMode()).toThrow('News and analysis modes must agree');
  });
  it('rejects all Event analysis/publishing operations before touching DB', async () => {
    vi.stubEnv('NEWS_PROVIDER', 'government');
    vi.stubEnv('AI_PROVIDER', 'off');
    for (const type of ['full', 'process', 'generate-ark', 'breaking'] as const) {
      await expect(runPipeline(type)).rejects.toThrow('Source-only mode permits collect only');
    }
  });
});
