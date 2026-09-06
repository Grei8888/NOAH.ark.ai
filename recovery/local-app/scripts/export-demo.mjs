import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const source=process.env.DEMO_SOURCE_URL??'http://127.0.0.1:3000';
const destination=resolve('demo-site/dist');
const origin='https://noah-intelligence-demo.adept-elk-5094.chatgpt.site';
const queue=['/']; const visited=new Set(); const assets=new Set();
while(queue.length) {
  const route=queue.shift(); if(visited.has(route))continue;visited.add(route);
  const response=await fetch(source+route);if(!response.ok)throw new Error(`Page failed: ${route}`);
  let html=await response.text();
  if(route==='/'&&!html.includes('DEMO EDITION'))throw new Error('Only Mock reports can be exported as this demo');
  html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
    .replace(/<link\b[^>]*(?:as="script"|rel="modulepreload")[^>]*>/gi,'')
    .replace(/<a\b[^>]*href="\/admin"[^>]*>[\s\S]*?<\/a>/gi,'')
    .replaceAll('http://localhost:3000',origin).replaceAll('http://127.0.0.1:3000',origin).replaceAll(source,origin);
  if(/grei-profile|userImplication|ADMIN_SECRET|noah-admin/.test(html))throw new Error('Unexpected private data');
  for(const match of html.matchAll(/href="(\/(?:event|ark)\/[^"?#]+)"/g))queue.push(match[1]);
  for(const match of html.matchAll(/(?:href|src)="(\/_next\/static\/[^"?]+)(?:\?[^\"]*)?"/g))assets.add(match[1]);
  const file=resolve(destination,'.'+route,'index.html');await mkdir(dirname(file),{recursive:true});await writeFile(file,html);
}
for(const asset of assets) {
  if(!asset.endsWith('.css'))throw new Error('Unexpected asset: '+asset);
  const response=await fetch(source+asset);if(!response.ok)throw new Error('Asset failed');
  const file=resolve(destination,'.'+asset);await mkdir(dirname(file),{recursive:true});await writeFile(file,Buffer.from(await response.arrayBuffer()));
}
await writeFile(resolve(destination,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
await writeFile(resolve(destination,'404.html'),'<!doctype html><html lang="ko"><meta charset="utf-8"><title>NOAH Demo</title><p>읽기 전용 데모입니다.</p><a href="/">Today’s Ark로 돌아가기</a></html>');
await writeFile('demo-site/package.json',JSON.stringify({name:'noah-public-demo',version:'0.1.0',private:true,scripts:{build:'node validate.mjs'}},null,2));
await writeFile('demo-site/README.md','# NOAH public demo\n\nRead-only snapshot of synthetic Mock articles. No database, owner profile, admin, API routes, cookies or credentials. Rebuild from the main project with node scripts/export-demo.mjs.\n');
await writeFile('demo-site/validate.mjs',`import {readFileSync,readdirSync} from 'node:fs';\nfor(const f of readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))){const s=readFileSync('dist/'+f,'utf8');if(/<script|userImplication|grei-profile|ADMIN_SECRET|href="\\/admin"/.test(s))throw new Error('Unsafe demo output');}\nconsole.log('Demo static output validated');\n`);
console.log(`Exported ${visited.size} public pages and ${assets.size} stylesheets.`);
