import { pathToFileURL } from 'node:url';
import { prisma } from '../lib/db/prisma';
import { QUERY_REGISTRY } from '../lib/news/queries';
import { hash } from '../lib/news/normalize';
export async function seed() {
  for (const [group, queries] of Object.entries(QUERY_REGISTRY)) {
    for (const query of queries) await prisma.searchQuery.upsert({
      where: { query }, create: { id: hash(query), query, group }, update: {},
    });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  seed().then(() => console.log('Discovery queries seeded')).finally(() => prisma.$disconnect());
