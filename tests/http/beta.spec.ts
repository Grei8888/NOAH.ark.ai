import { test, expect } from '@playwright/test';

test('beta tester invitation and feedback tools are accessible without account', async ({request}) => {
  const response = await request.get('/beta');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('베타테스트에 초대합니다');
  expect(html).toContain('TEST CHECKLIST');
  expect(html).toContain('실제 원문 확인');
  expect(html).toContain('검색과 분류');
  expect(html).toContain('창업 자료 살펴보기');
  expect(html).toContain('저장 기능 확인');
  expect(html).toContain('모바일 사용성 확인');
  expect(html).toContain('피드백 공유하기');
  expect(html).toContain('내용 복사');
  expect(html).toContain('이 페이지는 의견을 서버에 자동으로 저장·전송하지 않습니다');
  expect(html).toContain('name="robots" content="noindex, nofollow"');
  expect(html).not.toContain('가상 Event로 동작을 확인하는 화면');
});

test('beta tester route does not replace production Home', async ({request}) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).not.toContain('TEST CHECKLIST');
  expect(html).toContain('NOAH');
});


test('feedback landing stays honest before a real Google Form is configured', async ({request}) => {
  const response = await request.get('/feedback');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('의견 남기기');
  expect(html).toContain('의견 수집 양식을 연결하고 있습니다.');
  expect(html).toContain('기존 의견 공유 방식 이용하기');
  expect(html).not.toContain('Google 양식에서 제출 완료하기');
  expect(html).toContain('name="robots" content="noindex, nofollow"');
});
