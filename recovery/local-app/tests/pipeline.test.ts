import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
// Every suite gets a fresh database. Never reset the application's database.
const testDB = resolve('.noah', `test-${randomUUID()}.db`).replaceAll('\\', '/');
vi.stubEnv('DB_MODE', 'local');
vi.stubEnv('LOCAL_DATABASE_URL', `file:${testDB}`);
vi.stubEnv('NEWS_PROVIDER', 'mock');
vi.stubEnv('AI_PROVIDER', 'mock');
const { prisma } = await import('@/lib/db/prisma');
const { runPipeline, PipelineBusyError } = await import('@/lib/pipeline');
const { seed } = await import('../prisma/seed');
const { applyDefaultSettings } = await import('@/lib/default-settings');
const { OWNER_PROFILE } = await import('@/lib/profile');
const now = new Date('2026-09-05T12:00:00Z');
beforeAll(async () => {
    mkdirSync('.noah', { recursive: true });
    const schemaPath = testDB + '.prisma';
    writeFileSync(testDB, '', { flag: 'wx' });
    writeFileSync(schemaPath, readFileSync('prisma/local.prisma', 'utf8').replace('"file:./noah.db"', JSON.stringify(`file:${testDB}`)));
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', schemaPath, '--skip-generate'], { stdio: 'pipe' });
    await seed();
}, 30000);
afterAll(async () => { await prisma.$disconnect(); vi.unstubAllEnvs(); });
describe('database vertical slice', () => {
    it('explicitly applies business defaults to existing profiles and queries, with a backup', async () => {
        await prisma.userProfile.update({ where: { id: OWNER_PROFILE.id }, data: { interests: ['기존 관심'] } });
        await prisma.searchQuery.create({ data: { id: 'old-query', query: '경계선지능', group: 'NEURO_EDU' } });
        await seed();
        expect((await prisma.userProfile.findUniqueOrThrow({ where: { id: OWNER_PROFILE.id } })).interests).toEqual(['기존 관심']);
        await applyDefaultSettings(prisma);
        expect((await prisma.userProfile.findUniqueOrThrow({ where: { id: OWNER_PROFILE.id } })).interests).toEqual(OWNER_PROFILE.interests);
        expect((await prisma.searchQuery.findUniqueOrThrow({ where: { id: 'old-query' } })).enabled).toBe(false);
        const backup = await prisma.appConfig.findUniqueOrThrow({ where: { key: 'before-business-defaults-v2' } });
        await applyDefaultSettings(prisma);
        expect((await prisma.appConfig.findUniqueOrThrow({ where: { key: backup.key } })).value).toEqual(backup.value);
        expect(await prisma.searchQuery.count({ where: { enabled: true, query: '외국인 의료관광' } })).toBe(1);
    });
    it('persists 32 raw documents, 10 events and 8 selected events; retries are idempotent', async () => {
        const first = await runPipeline('full', '2026-09-04', now);
        expect(first.articlesInserted).toBe(32);
        expect(first.duplicatesRemoved).toBe(2);
        expect(first.eventsCreated).toBe(10);
        expect(first.arkGenerated).toBe(true);
        const ark = await prisma.dailyArk.findUniqueOrThrow({ where: { arkDate: '2026-09-04' }, include: { items: true } });
        expect(ark.items).toHaveLength(8);
        const second = await runPipeline('full', '2026-09-04', now);
        expect(second.articlesInserted).toBe(0);
        expect(second.eventsCreated).toBe(0);
        expect(second.aiRequests).toBe(0);
        expect(second.arkGenerated).toBe(false);
        expect(await prisma.article.count()).toBe(32);
        expect(await prisma.event.count()).toBe(10);
        expect(await prisma.dailyArk.count()).toBe(1);
        const after = await prisma.dailyArk.findUniqueOrThrow({ where: { arkDate: '2026-09-04' }, include: { items: true } });
        expect(after.items).toEqual(ark.items);
    }, 30000);
    it('rejects a concurrent worker while a DB lease is held', async () => {
        await prisma.pipelineLock.create({ data: { id: 'pipeline', owner: 'test-lock', expiresAt: new Date(Date.now() + 60000) } });
        await expect(runPipeline('full', '2026-09-04', now)).rejects.toBeInstanceOf(PipelineBusyError);
        await prisma.pipelineLock.delete({ where: { id: 'pipeline' } });
    });
    it('retries failed analysis without duplicating the report', async () => {
        const event = await prisma.event.findFirstOrThrow();
        await prisma.event.update({ where: { id: event.id }, data: { analysisStatus: 'FAILED' } });
        const retry = await runPipeline('process', '2026-09-04', now);
        expect(retry.aiRequests).toBe(1);
        expect(retry.aiSuccess).toBe(1);
        expect(await prisma.dailyArk.count()).toBe(1);
    });
    it('preserves published data on provider failure and records a failed run', async () => {
        vi.stubEnv('NEWS_PROVIDER', 'newsapi');
        vi.stubEnv('NEWS_API_KEY', '');
        await expect(runPipeline('full', '2026-09-04', now)).rejects.toThrow();
        expect(await prisma.dailyArk.count()).toBe(1);
        expect(await prisma.pipelineLog.count({ where: { status: 'FAILED' } })).toBe(1);
        expect(await prisma.pipelineLock.count()).toBe(0);
        vi.stubEnv('NEWS_PROVIDER', 'mock');
    });
});
