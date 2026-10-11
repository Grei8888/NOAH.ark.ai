import { defineConfig } from '@playwright/test';
const mockURL='http://127.0.0.1:3100';
const liveURL='http://127.0.0.1:3101';
export default defineConfig({
 testDir:'tests/http',use:{baseURL:mockURL},reporter:'list',workers:1,
 // APIRequestContext only; no browser installation or browser control is used.
 webServer:[
  {command:'node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3100',url:mockURL,timeout:30000,reuseExistingServer:false,env:{NEWS_PROVIDER:'mock',AI_PROVIDER:'mock',DB_MODE:'local',APP_URL:mockURL}},
  {command:'node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3101',url:liveURL,timeout:30000,reuseExistingServer:false,env:{NEWS_PROVIDER:'newsapi',AI_PROVIDER:'openai',DB_MODE:'local',APP_URL:liveURL}},
 ],
});
