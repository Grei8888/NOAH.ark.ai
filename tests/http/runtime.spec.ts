import { test,expect } from '@playwright/test';
// APIRequestContext only: these checks need no browser or screenshot infrastructure.
const baseURL=process.env.NOAH_TEST_URL??'http://127.0.0.1:3100';
test('public edition is sourced, explicitly mock and excludes private analysis',async({request})=>{
 const response=await request.get(`${baseURL}/api/ark`);expect(response.status()).toBe(200);
 const body=await response.json();expect(body.mode).toBe('mock');expect(body.items).toHaveLength(8);
 for(const event of body.items){expect(event.isMock).toBe(true);expect(event.analysis).not.toHaveProperty('userImplication');expect(event.analysis).not.toHaveProperty('userRelevance');expect(event.sources.length).toBe(3);}
});
test('Home and published detail render real snapshot IDs and clearly label demo coverage',async({request})=>{
 const edition=await(await request.get(`${baseURL}/api/ark`)).json();
 const home=await request.get(baseURL);expect(home.status()).toBe(200);const html=await home.text();
 expect(html).toContain('MUST KNOW');expect(html).toContain('실제 뉴스가 아닙니다');expect(html).toContain(edition.items[0].id);
 const detail=await request.get(`${baseURL}/event/${edition.items[0].id}`);expect(detail.status()).toBe(200);const text=await detail.text();
 expect(text).toContain('출처 수는 관점 수를 의미하지 않습니다');expect(text).not.toMatch(/href="https:\/\/source\d\.example\.com/);
});
test('all five destinations and settings return a usable screen',async({request})=>{
 for(const view of ['home','discover','startup','saved','my','settings']){
  const response=await request.get(`${baseURL}/?view=${view}`);expect(response.status()).toBe(200);expect(await response.text()).toContain('NOAH');
 }
});
test('anonymous pipeline changes and cron calls are denied',async({request})=>{
 const admin=await request.post(`${baseURL}/api/admin/full`,{headers:{origin:baseURL}});expect(admin.status()).toBe(401);
 const cron=await request.get(`${baseURL}/api/cron/daily`);expect(cron.status()).toBe(401);
 const session=await request.post(`${baseURL}/api/admin/session`,{form:{secret:'invalid'},headers:{origin:baseURL}});expect(session.status()).toBe(401);
});
test('cross-origin admin requests and unpublished IDs are rejected',async({request})=>{
 const session=await request.post(`${baseURL}/api/admin/session`,{form:{secret:'invalid'},headers:{origin:'https://attacker.example.com'}});expect(session.status()).toBe(403);
 const missing=await request.get(`${baseURL}/event/unpublished`);
 // Next returns 200 for streamed not-found responses, with noindex metadata.
 expect([200,404]).toContain(missing.status());
 expect(await missing.text()).toContain('발행된 Event를 찾을 수 없습니다');
});
