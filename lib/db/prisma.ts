import 'dotenv/config';
import { resolve } from 'node:path';
import { PrismaClient as PostgresClient } from '../../.generated/postgres';
import { PrismaClient as LocalClient } from '../../.generated/local';
const globalDB = globalThis as unknown as {
    noah?: PostgresClient;
};
export const prisma: PostgresClient = globalDB.noah ?? ((process.env.DB_MODE ?? (process.env.NEWS_PROVIDER === 'mock' || process.env.NODE_ENV !== 'production' ? 'local' : 'postgres')) === 'local'
    ? new LocalClient({ datasources: { db: { url: `file:${resolve(process.env.LOCAL_DATABASE_URL?.slice(5) ?? '.noah/demo.db')}` } } }) as unknown as PostgresClient
    : new PostgresClient());
if (process.env.NODE_ENV !== 'production')
    globalDB.noah = prisma;
export type DB = typeof prisma;
