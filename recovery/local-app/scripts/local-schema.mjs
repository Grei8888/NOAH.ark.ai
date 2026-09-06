import { readFileSync, writeFileSync } from 'node:fs';
const schema = readFileSync('prisma/schema.prisma', 'utf8');
writeFileSync('prisma/local.prisma', schema.replace('provider = "postgresql"', 'provider = "sqlite"').replace('env("DATABASE_URL")', '"file:./noah.db"').replace('../.generated/postgres', '../.generated/local'));
