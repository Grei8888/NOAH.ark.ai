import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (!existsSync('.env')) {
  writeFileSync('.env', readFileSync('.env.example','utf8')
    .replace('ADMIN_SECRET=',`ADMIN_SECRET=${randomBytes(32).toString('hex')}`)
    .replace('CRON_SECRET=',`CRON_SECRET=${randomBytes(32).toString('hex')}`), {flag:'wx'});
  console.log('Created local .env with random admin and cron secrets. Existing files are never overwritten.');
}
