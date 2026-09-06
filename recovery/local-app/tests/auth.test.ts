import { describe, it, expect, vi, afterEach } from 'vitest';
import { secretMatches, sessionToken, validSession, validOrigin } from '@/lib/auth';
afterEach(() => vi.unstubAllEnvs());
describe('admin security', () => {
    it('fails closed when secret is absent or short', () => { expect(secretMatches('', undefined)).toBe(false); expect(secretMatches('short', 'short')).toBe(false); expect(validSession(undefined)).toBe(false); });
    it('rejects tampered and expired sessions', () => {
        vi.stubEnv('ADMIN_SECRET', 'test-only-secret-with-at-least-32-characters');
        const now = Date.now();
        const token = sessionToken(now);
        expect(validSession(token, now)).toBe(true);
        expect(validSession(token + 'x', now)).toBe(false);
        expect(validSession(token, now + 9 * 3600000)).toBe(false);
    });
    it('requires configured origin for mutating admin requests', () => { vi.stubEnv('APP_URL', 'https://noah.example.com'); expect(validOrigin(new Request('https://noah.example.com/api/admin/full', { headers: { origin: 'https://attacker.example.com' } }))).toBe(false); });
});
