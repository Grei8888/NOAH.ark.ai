import {readFileSync,readdirSync} from 'node:fs';
for(const f of readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))){const s=readFileSync('dist/'+f,'utf8');if(/<script|userImplication|grei-profile|ADMIN_SECRET|href="\/admin"/.test(s))throw new Error('Unsafe demo output');}
console.log('Demo static output validated');
