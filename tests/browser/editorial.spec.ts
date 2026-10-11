import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const topics = ["AI · 기술", "창업 · 사업", "정책 · 제도", "금융 · 경제", "주거 · 부동산"];
async function personalize(page: Page) {
  await page.goto("/?view=my");
  for (const topic of topics) await page.getByRole("button", { name: topic, exact: false }).click();
  await page.getByRole("link", { name: "내 피드 읽기" }).click();
  await expect(page.locator(".eventFeedItem--lead")).toBeVisible();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test("cold start and opt-out keep public coverage honest", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "MUST KNOW", exact: true })).toBeVisible();
  await expect(page.locator(".eventFeedItem--lead")).toHaveCount(0);
  await expect(page.getByText("실제 뉴스가 아닙니다.", { exact: false })).toBeVisible();
  await personalize(page);
  await page.goto("/?view=settings");
  await page.getByRole("checkbox", { name: "관심사 개인화" }).uncheck();
  await page.goto("/");
  await expect(page.locator(".eventFeedItem--lead")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "MUST KNOW", exact: true })).toBeVisible();
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`editorial hierarchy and interactions at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await personalize(page);
    const header = page.locator(viewport.width === 390 ? ".mobileHeader" : ".desktopNav");
    const brand = header.getByRole("link", { name: "NOAH ARK 홈", exact: true });
    const mark = brand.locator(".brandSymbol");
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("src", "/brand/noah-event-capsule-mark.png");
    await expect.poll(() => mark.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth === 384 && (el as HTMLImageElement).naturalHeight === 155)).toBe(true);
    const markBox = (await mark.boundingBox())!;
    expect(markBox.width / markBox.height).toBeCloseTo(384 / 155, 2);
    const brandBox = (await brand.boundingBox())!;
    const headerBox = (await header.boundingBox())!;
    expect(brandBox.x).toBeGreaterThanOrEqual(headerBox.x);
    expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(headerBox.x + headerBox.width);
    expect(brandBox.y + brandBox.height).toBeLessThanOrEqual(headerBox.y + headerBox.height);
    expect(brandBox.height).toBeGreaterThanOrEqual(44);
    await expect(brand.locator(".brandMotto"))[viewport.width === 390 ? "toBeHidden" : "toBeVisible"]();
    const forYou = page.locator(".feedSection").filter({ has: page.getByRole("heading", { name: "FOR YOU", exact: true }) });
    await expect(forYou.locator(".eventFeedItem--lead")).toHaveCount(1);
    await expect(forYou.locator(".eventFeedItem--medium")).toHaveCount(2);
    await expect(forYou.locator(".eventFeedItem--compact")).toHaveCount(2);
    const lead = forYou.locator(".eventFeedItem--lead");
    await expect(lead.locator(".leadRecommendation")).toBeVisible();
    await expect(lead.locator('[data-image-kind="demo"] img')).toHaveCount(1);
    await expect(lead.locator("figcaption")).toContainText("DEMO 예시 · 실제 사건 현장 아님");
    await expect(forYou.locator(".demoEventImage--thumbnail")).toHaveCount(1);
    for (const img of await forYou.locator("img").all()) {
      await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    const intro = page.locator(".homeIntro h1");
    expect(await intro.evaluate(el => getComputedStyle(el).fontSize)).toBe(viewport.width === 390 ? "26px" : "32px");
    expect(await intro.evaluate(el => getComputedStyle(el).color)).toBe("rgb(23, 63, 115)");
    await expect(lead.locator(".perspectiveLink")).toHaveText(/출처 3개 · 다른 시선/);
    const headline = lead.locator("h3");
    const box = await headline.boundingBox();
    expect(box!.y + box!.height).toBeLessThan(viewport.height - (viewport.width === 390 ? 65 : 0));
    expect(await headline.evaluate(el => getComputedStyle(el).fontSize)).toBe(viewport.width === 390 ? "26px" : "38px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    if (viewport.width === 390) {
      await expect(page.getByRole("navigation", { name: "모바일 주 메뉴" }).getByRole("link")).toHaveCount(5);
      await expect(page.locator(".intelligenceRail")).toBeHidden();
    } else {
      await expect(page.locator(".intelligenceRail")).toBeVisible();
      expect(await page.locator(".railPanel").first().evaluate(el => getComputedStyle(el).borderRadius)).toBe("0px");
    }
    await mkdir(".noah/branded-screenshots", { recursive: true });
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `.noah/branded-screenshots/home-${viewport.width}.png` });
    await page.screenshot({ path: `.noah/branded-screenshots/home-${viewport.width}-full.png`, fullPage: true });

    await brand.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(brand).toBeFocused();
    expect(await brand.evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");

    // Keep editorial presentation coupled to the original preference controls.
    const id = await lead.getAttribute("data-event-id");
    await lead.locator(".saveButton").click();
    await expect(lead.locator(".saveButton")).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(lead.locator(".saveButton")).toHaveAttribute("aria-pressed", "true");
    await lead.locator(".overflowMenu > summary").click();
    await lead.getByRole("button", { name: "관심 없음" }).click();
    await expect(page.locator(`[data-event-id="${id}"]`)).toHaveCount(0);
    await page.getByRole("button", { name: "되돌리기", exact: true }).click();
    await expect(lead).toHaveAttribute("data-event-id", id!);
    await lead.locator(".overflowMenu > summary").click();
    await lead.getByRole("button", { name: "이 주제 덜 보기" }).click();
    await expect(page.getByRole("status")).toContainText("관심사에서 제외");
    await page.getByRole("button", { name: "되돌리기", exact: true }).click();
    await lead.locator(".overflowMenu > summary").click();
    await lead.getByRole("button", { name: "이 주제 더 보기" }).click();
    await expect(page.getByRole("status")).toContainText("관심사에 반영");
    await page.getByRole("button", { name: "되돌리기", exact: true }).click();
    await lead.locator(".recommendationReason > summary").focus();
    await page.keyboard.press("Enter");
    await expect(lead.locator(".recommendationReason")).toHaveAttribute("open", "");
    await expect(lead.locator(".recommendationReason p")).toContainText("의미 기반 AI 개인화는 아직 연결되지 않았습니다");
    await lead.locator(".perspectiveLink").click();
    await expect(page.getByText("출처 수는 관점 수를 의미하지 않습니다", { exact: false })).toBeVisible();
    if (viewport.width === 390) {
      await page.goto("/");
      const mobileNav = page.getByRole("navigation", { name: "모바일 주 메뉴" });
      for (const [label, destination] of [["Discover", "/?view=discover"], ["Startup", "/?view=startup"], ["Saved", "/?view=saved"], ["My", "/?view=my"], ["Home", "/"]]) {
        const link = mobileNav.getByRole("link", { name: label, exact: true });
        await link.click();
        await expect(page).toHaveURL(destination);
        await expect(link).toHaveAttribute("aria-current", "page");
        await expect(page.locator("#main-content")).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });
}

test("unavailable demo images leave readable headlines and controls", async ({ page }) => {
  await page.route("**/_next/image?**", route => route.abort());
  await personalize(page);
  const lead = page.locator(".eventFeedItem--lead");
  await expect(lead.locator(".demoEventImage")).toHaveCount(0);
  await expect(lead.locator("h3")).toBeVisible();
  await lead.locator(".saveButton").click();
  await expect(lead.locator(".saveButton")).toHaveAttribute("aria-pressed", "true");
});

test("brand fits smaller mobile and narrower desktop headers", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    const header = page.locator(width < 768 ? ".mobileHeader" : ".desktopNav");
    await expect(header).toBeVisible();
    const brand = header.locator(".brandLockup");
    const brandBox = (await brand.boundingBox())!;
    const headerBox = (await header.boundingBox())!;
    expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(headerBox.x + headerBox.width);
    const mark = (await brand.locator(".brandSymbol").boundingBox())!;
    expect(mark.width / mark.height).toBeCloseTo(384 / 155, 2);
    if (width < 768) {
      const search = (await header.getByRole("link", { name: "Event 검색" }).boundingBox())!;
      expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(search.x);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
