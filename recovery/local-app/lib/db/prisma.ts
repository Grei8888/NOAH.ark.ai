import 'dotenv/config';
import { PrismaClient as PostgresClient } from '../../.generated/postgres';
import { PrismaClient as LocalClient } from '../../.generated/local';
const globalDB = globalThis as unknown as {
    noah?: PostgresClient;
};
export const prisma: PostgresClient = globalDB.noah ?? ((process.env.DB_MODE ?? 'local') === 'local'
    ? new LocalClient({ datasources: { db: { url: process.env.LOCAL_DATABASE_URL ?? 'file:./noah.db' } } }) as unknown as PostgresClient
    : new PostgresClient());
if (process.env.NODE_ENV !== 'production')
    globalDB.noah = prisma;
export type DB = typeof prisma;
