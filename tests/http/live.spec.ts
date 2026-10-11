import { test,expect } from '@playwright/test';
const baseURL='http://127.0.0.1:3101';
test('live reads cannot expose the demo edition even from the same test database',async({request})=>{
 const response=await request.get(`${baseURL}/api/ark`);expect(response.status()).toBe(200);
 const edition=await response.json();expect(edition.mode).toBe('live');expect(edition.items).toEqual([]);expect(edition.date).toBeNull();
 const home=await(await request.get(baseURL)).text();expect(home).toContain('아직 발행된 주요 변화가 없습니다');expect(home).not.toContain('가상 Event로 동작을 확인하는 화면');
});
test('a known mock Event has no live detail and pipeline remains protected',async({request})=>{
 const mock=await(await request.get('http://127.0.0.1:3100/api/ark')).json();
 const page=await request.get(`${baseURL}/event/${mock.items[0].id}`);
 expect(await page.text()).toContain('발행된 Event를 찾을 수 없습니다');
 const mutation=await request.post(`${baseURL}/api/admin/full`,{headers:{origin:baseURL}});expect(mutation.status()).toBe(401);
});
