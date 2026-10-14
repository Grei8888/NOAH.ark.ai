import { test, expect, type Page } from "@playwright/test";
import { READER_TEST_INVITE as token } from "./fixtures";

const lab = "/lab/reader?source=" + encodeURIComponent("https://mss.go.kr/reader-auth-fixture");
const unknown = "unregistered-test-invitation-" + "B".repeat(36);
const key = "noah.beta.reader.invite.v1";
test.beforeEach(async ({ page }) => {
  // Publisher iframes also stay offline; no external browser requests.
  await page.route("https://**", route => route.fulfill({ contentType: "text/html", body: "<p>회귀 테스트 원문 프레임</p>" }));
});
async function verified(page: Page) {
  await expect(page.locator('[data-invitation-status="verified"]')).toBeVisible();
  await expect(page.getByText("초대코드 서버 인증 완료", { exact: true })).toBeVisible();
  await expect(page.getByText("초대 링크 인식 완료", { exact: false })).toHaveCount(0);
}

test("Home fragment survives News and Reader navigation; valid token reaches the server only in a header", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", r => requests.push(r.url()));
  await page.goto("/#join=" + token);
  await expect.poll(() => page.url().includes("#join=")).toBe(false);
  await page.getByRole("link", { name: /뉴스 살펴보기/ }).click();
  await page.getByRole("button", { name: "AI에게 질문 ↗", exact: true }).first().click();
  await verified(page);
  const submitted = page.waitForRequest(r => new URL(r.url()).pathname === "/api/lab/reader");
  await page.getByRole("button", { name: "AI에게 물어보기 ↗", exact: true }).click();
  const request = await submitted;
  expect(request.headers()["x-noah-lab-token"]).toBe(token);
  expect(request.postData()).not.toContain(token);
  await expect(page.locator(".newsAiAnswer")).toContainText("회귀 테스트용 용어 설명");
  await page.getByRole("link", { name: "원문과 AI를 나란히 보는 독해 모드 ↗", exact: true }).click();
  await verified(page);
  // Exercise the reported term bubble, not just the generic question form.
  await page.getByRole("button", { name: "정책자금 뜻 보기", exact: true }).first().click();
  await page.getByRole("button", { name: "AI로 쉽게 설명하기 →", exact: true }).click();
  await expect(page.locator(".readerBubbleText")).toContainText("회귀 테스트용 용어 설명");
  expect(requests.every(url => !url.includes(token))).toBe(true);
});

test("well-shaped invalid link fails server verification, clears storage and recovers with an issued original code", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname === "/api/lab/reader") calls.push(r.url()); });
  await page.goto(lab + "#join=" + unknown);
  await expect(page.locator('[data-invitation-status="rejected"]')).toBeVisible();
  expect(await page.evaluate(k => sessionStorage.getItem(k), key)).toBeNull();
  await expect(page.getByRole("button", { name: "질문 보내기 →", exact: true })).toBeDisabled();
  expect(calls).toHaveLength(0);
  await page.getByLabel("테스터 초대 코드", { exact: false }).fill(" " + token + " ");
  await page.getByRole("button", { name: "초대코드 확인", exact: true }).click();
  await verified(page);
  await page.getByRole("button", { name: "질문 보내기 →", exact: true }).click();
  await expect(page.locator(".readerLabAnswerText")).toContainText("회귀 테스트용 용어 설명");
});

test("disabled sessionStorage still preserves an invitation across in-page Home to News navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get: () => { throw new Error("storage disabled in test"); } });
  });
  await page.goto("/#join=" + token);
  await expect.poll(() => page.url().includes("#join=")).toBe(false);
  await page.getByRole("link", { name: /뉴스 살펴보기/ }).click();
  await page.getByRole("button", { name: "AI에게 질문 ↗", exact: true }).first().click();
  await verified(page);
});

test("malformed new link cannot silently reuse a previous tab's invitation", async ({ page }) => {
  await page.goto(lab + "#join=" + token);
  await verified(page);
  await page.goto("/#join=invalid-new-link");
  await expect.poll(() => page.url().includes("#join=")).toBe(false);
  await page.getByRole("link", { name: /뉴스 살펴보기/ }).click();
  await page.getByRole("button", { name: "AI에게 질문 ↗", exact: true }).first().click();
  await expect(page.getByLabel("테스터 초대 코드", { exact: false })).toHaveValue("");
  await expect(page.getByRole("button", { name: "AI에게 물어보기 ↗", exact: true })).toBeDisabled();
  expect(await page.evaluate(k => sessionStorage.getItem(k), key)).toBeNull();
});

test("an AI request rejected by the server removes the previously verified client state", async ({ page }) => {
  await page.goto(lab + "#join=" + token);
  await verified(page);
  await page.route("**/api/lab/reader", route => route.continue({ headers: { ...route.request().headers(), "x-noah-lab-token": unknown } }));
  await page.getByRole("button", { name: "질문 보내기 →", exact: true }).click();
  await expect(page.locator('[data-invitation-status="rejected"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "질문 보내기 →", exact: true })).toBeDisabled();
  expect(await page.evaluate(k => sessionStorage.getItem(k), key)).toBeNull();
});

test("late verification response cannot authenticate a changed code", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let first = true;
  await page.route("**/api/lab/reader/access", async route => {
    const response = await route.fetch();
    if (first) { first = false; await held; }
    await route.fulfill({ response });
  });
  await page.goto(lab + "#join=" + token);
  await expect(page.locator('[data-invitation-status="checking"]')).toBeVisible();
  await page.getByLabel("테스터 초대 코드", { exact: false }).fill(unknown);
  release();
  await page.getByRole("button", { name: "초대코드 확인", exact: true }).click();
  await expect(page.locator('[data-invitation-status="rejected"]')).toBeVisible();
  await expect(page.locator('[data-invitation-status="verified"]')).toHaveCount(0);
});

test("model outage is shown as an AI error while successful authentication remains distinct", async ({ page }) => {
  await page.goto(lab + "#join=" + token);
  await verified(page);
  await page.getByLabel("궁금한 점", { exact: true }).fill("provider-failure 설명 부탁합니다");
  await page.getByRole("button", { name: "질문 보내기 →", exact: true }).click();
  await expect(page.locator(".readerLabAnswer")).toContainText("AI 연결에 문제가 있습니다");
  await verified(page);
});

test("390px mobile preserves verified access when switching to Reader and asking about a term", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#join=" + token);
  await expect.poll(() => page.url().includes("#join=")).toBe(false);
  await page.getByRole("link", { name: /뉴스 살펴보기/ }).click();
  await page.getByRole("button", { name: "AI에게 질문 ↗", exact: true }).first().click();
  await verified(page);
  await page.getByRole("link", { name: "원문과 AI를 나란히 보는 독해 모드 ↗", exact: true }).click();
  await page.getByRole("button", { name: "AI 이해 도우미", exact: true }).click();
  await verified(page);
  await page.getByRole("button", { name: "원문 읽기", exact: true }).click();
  await page.getByRole("button", { name: "정책자금 뜻 보기", exact: true }).first().click();
  await page.getByRole("button", { name: "AI로 쉽게 설명하기 →", exact: true }).click();
  await expect(page.locator(".readerBubbleText")).toContainText("회귀 테스트용 용어 설명");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
