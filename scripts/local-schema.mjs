import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
// One absolute default shared by Prisma CLI and runtime; never truncate an existing DB.
const configured = process.env.LOCAL_DATABASE_URL;
if (configured && !configured.startsWith('file:')) throw new Error('LOCAL_DATABASE_URL must be a SQLite file URL');
const file = resolve(configured ? configured.slice(5) : '.noah/demo.db');
mkdirSync(dirname(file), { recursive: true });
closeSync(openSync(file, 'a'));
const schema = readFileSync('prisma/schema.prisma', 'utf8');
writeFileSync('prisma/local.prisma', schema.replace('provider = "postgresql"', 'provider = "sqlite"').replace('env("DATABASE_URL")', JSON.stringify(`file:${file}`)).replace('../.generated/postgres', '../.generated/local'));
