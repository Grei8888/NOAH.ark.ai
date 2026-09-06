import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaClient } from '../.generated/local/index.js';
const db=new PrismaClient({datasources:{db:{url:process.env.LOCAL_DATABASE_URL??'file:./noah.db'}}});
const base=process.env.APP_URL??'http://127.0.0.1:3000';
try {
  const ark=await db.dailyArk.findFirstOrThrow({orderBy:{arkDate:'desc'},include:{items:{take:1}}});
  for(const route of ['/',`/ark/${ark.arkDate}`,`/event/${ark.items[0].eventId}`]) {
    const response=await fetch(base+route);assert.equal(response.status,200,route);
    const html=await response.text();assert.ok(!html.includes('grei-profile'));assert.ok(!html.includes('userImplication'));assert.ok(html.includes('NOAH'));
  }
  const unauthorized=await fetch(base+'/api/admin/full',{method:'POST',headers:{Origin:base}});assert.equal(unauthorized.status,401);
  const cron=await fetch(base+'/api/cron/daily');assert.equal(cron.status,401);
  const login=await fetch(base+'/api/admin/session',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({secret:process.env.ADMIN_SECRET??''})});
  assert.equal(login.status,303);const setCookie=login.headers.get('set-cookie');assert.ok(setCookie?.includes('HttpOnly'));
  const cookie=setCookie.split(';')[0];
  const admin=await fetch(base+'/admin',{headers:{Cookie:cookie}});assert.equal(admin.status,200);assert.ok((await admin.text()).includes('운영 현황'));
  const csrf=await fetch(base+'/api/admin/collect',{method:'POST',headers:{Cookie:cookie,Origin:'https://invalid.example.com'}});assert.equal(csrf.status,401);
  const collect=await fetch(base+'/api/admin/collect',{method:'POST',headers:{Cookie:cookie,Origin:base}});assert.equal(collect.status,200);assert.equal((await collect.json()).status,'COMPLETED');
  console.log('HTTP smoke passed: public routes, privacy, admin login, manual collect, CSRF and cron authorization.');
} finally {await db.$disconnect();}
