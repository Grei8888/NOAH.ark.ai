import { prisma } from '../lib/db/prisma';
import { seed } from '../prisma/seed';
import { applyDefaultSettings } from '../lib/default-settings';
seed().then(() => applyDefaultSettings(prisma)).then(result => console.log(result))
    .catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
