import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import 'dotenv/config';

// A new mock database preserves every existing report and database unchanged.
if ((process.env.DB_MODE ?? 'local') !== 'local' || (process.env.NEWS_PROVIDER ?? 'mock') !== 'mock') throw new Error('Demo refresh requires local Mock mode');
mkdirSync('.noah', { recursive: true });
const dbPath = resolve('.noah', `business-demo-${randomUUID()}.db`).replaceAll('\\', '/');
const schemaPath = dbPath + '.prisma';
const url = `file:${dbPath}`;
writeFileSync(dbPath, '', { flag: 'wx' });
writeFileSync(schemaPath, readFileSync('prisma/local.prisma', 'utf8').replace('"file:./noah.db"', JSON.stringify(url)));
const env = { ...process.env, DB_MODE: 'local', LOCAL_DATABASE_URL: url, NEWS_PROVIDER: 'mock', AI_PROVIDER: 'mock' };
for (const args of [
    ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', schemaPath, '--skip-generate'],
    ['node_modules/tsx/dist/cli.mjs', 'scripts/apply-defaults.ts'],
    ['node_modules/tsx/dist/cli.mjs', 'scripts/pipeline.ts'],
]) execFileSync(process.execPath, args, { env, stdio: 'inherit' });
const original = readFileSync('.env', 'utf8');
writeFileSync(dbPath + '.env-backup', original, { flag: 'wx' });
const updated = /^LOCAL_DATABASE_URL=.*$/m.test(original) ? original.replace(/^LOCAL_DATABASE_URL=.*$/m, `LOCAL_DATABASE_URL=${url}`) : original + `\nLOCAL_DATABASE_URL=${url}\n`;
writeFileSync('.env', updated);
console.log('New Mock Ark ready; prior database and environment backup preserved.');
