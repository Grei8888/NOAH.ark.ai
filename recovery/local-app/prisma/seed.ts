import { pathToFileURL } from 'node:url';
import { prisma } from '../lib/db/prisma';
import { OWNER_PROFILE } from '../lib/profile';
import { QUERY_REGISTRY } from '../lib/news/queries';
import { hash } from '../lib/news/normalize';
export async function seed() {
    await prisma.user.upsert({ where: { id: 'grei' }, create: { id: 'grei', name: 'Grei', role: 'OWNER' }, update: {} });
    await prisma.userProfile.upsert({ where: { id: OWNER_PROFILE.id }, create: { ...OWNER_PROFILE, userId: 'grei' }, update: {} });
    for (const [group, queries] of Object.entries(QUERY_REGISTRY))
        for (const query of queries)
            await prisma.searchQuery.upsert({ where: { query }, create: { id: hash(query), query, group }, update: {} });
    for (let i = 0; i < 3; i++)
        await prisma.newsSource.upsert({ where: { domain: `source${i}.example.com` }, create: { id: `mock-source-${i}`, name: `가상 출처 ${i}`, domain: `source${i}.example.com`, sourceType: i === 0 ? 'GOVERNMENT' : 'NEWS_MEDIA', reliability: i === 0 ? 10 : 6 }, update: {} });
    await prisma.appConfig.upsert({ where: { key: 'mock' }, create: { key: 'mock', value: { enabled: true, articleCount: 32 } }, update: {} });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
    seed().then(() => console.log('Seed complete')).finally(() => prisma.$disconnect());
