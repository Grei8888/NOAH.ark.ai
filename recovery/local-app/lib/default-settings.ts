import type { DB } from './db/prisma';
import { OWNER_PROFILE } from './profile';
import { QUERY_REGISTRY } from './news/queries';
import { hash } from './news/normalize';

// Explicit operation: ordinary seeding continues to preserve user-edited profiles.
export async function applyDefaultSettings(db: DB) {
    const queries = Object.entries(QUERY_REGISTRY).flatMap(([group, terms]) => terms.map(query => ({ group, query, id: hash(query) })));
    return db.$transaction(async tx => {
        const previous = await tx.userProfile.findUnique({ where: { id: OWNER_PROFILE.id } });
        const oldQueries = await tx.searchQuery.findMany({ where: { enabled: true } });
        // Keep the initial settings as a rollback reference across repeated application.
        await tx.appConfig.upsert({ where: { key: 'before-business-defaults-v2' }, create: { key: 'before-business-defaults-v2', value: JSON.parse(JSON.stringify({ profile: previous, queries: oldQueries })) }, update: {} });
        await tx.userProfile.upsert({ where: { id: OWNER_PROFILE.id }, create: { ...OWNER_PROFILE, userId: 'grei' }, update: OWNER_PROFILE });
        await tx.searchQuery.updateMany({ data: { enabled: false } });
        for (const query of queries) await tx.searchQuery.upsert({ where: { query: query.query }, create: { ...query, enabled: true }, update: { group: query.group, enabled: true } });
        await tx.appConfig.upsert({ where: { key: 'default-focus-version' }, create: { key: 'default-focus-version', value: 'business-v2' }, update: { value: 'business-v2' } });
        return { version: 'business-v2', enabledQueries: queries.length };
    });
}
