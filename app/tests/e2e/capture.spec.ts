import { expect, test, type Page } from "@playwright/test";

const shots = process.env.SHOT_DIR;
test.skip(!shots, "Set SHOT_DIR to capture screenshots of the whole game");

const shot = async (page: Page, name: string) => {
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${shots}/game-${name}.png` });
};
const click = (page: Page, name: RegExp) => page.getByRole("button", { name }).click();
const pick = (page: Page, name: RegExp) => page.getByRole("radio", { name }).check();
const NEXT = /^(Next|اللي بعده)$/;

test("the reveal, with walking", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(page.locator(".stage[data-ready=true]")).toBeVisible({ timeout: 30000 });
  await click(page, /^Start mission$/);
  for (let step = 0; step < 4; step += 1) await click(page, NEXT);
  await page.locator(".avatar-pick").nth(3).click();
  await page.locator(".accent-coral").click();
  await shot(page, "r0-avatar-preview");
  await click(page, NEXT);
  await page.getByLabel(/Your callsign/).fill("Nova");
  await page.getByLabel(/RIVO unit callsign/).fill("Echo");
  await click(page, /^Begin the transfer test$/);
  await click(page, /^Skip scene$/);
  await shot(page, "r1-wake");
  await click(page, NEXT);
  const frames: string[] = [];
  for (let frame = 0; frame < 9; frame += 1) {
    frames.push((await page.screenshot({ type: "jpeg", quality: 70 })).toString("base64"));
    await page.waitForTimeout(120);
  }
  const sheet = await page.context().newPage();
  await sheet.setViewportSize({ width: 1500, height: 850 });
  await sheet.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:#000">${frames.map((data) => `<img src="data:image/jpeg;base64,${data}" style="width:100%">`).join("")}</body>`);
  await sheet.waitForTimeout(300);
  await sheet.screenshot({ path: `${shots}/game-r2-walk-strip.png` });
  await sheet.close();
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await shot(page, "r3-not-home");
  const times = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const seen: number[] = [];
        let last = performance.now();
        const start = last;
        const tick = (now: number) => {
          seen.push(now - last);
          last = now;
          if (now - start < 2000) requestAnimationFrame(tick);
          else resolve(seen);
        };
        requestAnimationFrame(tick);
      }),
  );
  const sorted = times.slice(2).sort((a, b) => a - b);
  const average = sorted.reduce((sum, time) => sum + time, 0) / sorted.length;
  console.log(`frames: ${sorted.length}, average ${average.toFixed(1)} ms (${(1000 / average).toFixed(0)} fps), slowest ${sorted.at(-1)?.toFixed(1)} ms`);
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await shot(page, "r4-title-card");
  await click(page, /^Look at the problem$/);
  await click(page, /^Start planning$/);
  await pick(page, /^Low orbit/);
  await shot(page, "r5-player-in-world");
  await click(page, /^Confirm:/);
  await click(page, /^Next:/);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${shots}/game-r6-walk-to-bay.png` });
  await pick(page, /^Chemical engine/);
  await shot(page, "r7-bay");
  await click(page, /^Confirm:/);
  await click(page, /^Next:/);
  await pick(page, /^Fit the large array/);
  await click(page, /^Confirm:/);
  await shot(page, "r8-tank-alarm");
});

test("solo, in English", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(page.locator(".stage[data-ready=true]")).toBeVisible({ timeout: 30000 });
  await click(page, /^Start mission$/);
  await shot(page, "a02-language");
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await shot(page, "a03-avatar");
  await click(page, NEXT);
  await page.getByLabel(/Your callsign/).fill("Nova");
  await page.getByLabel(/RIVO unit callsign/).fill("Echo");
  await shot(page, "a04-callsign");
  await click(page, /^Begin the transfer test$/);
  await click(page, /^Skip scene$/);
  for (let beat = 0; beat < 9; beat += 1) await click(page, NEXT);
  await click(page, /^Look at the problem$/);
  await click(page, /^Start planning$/);
  await pick(page, /^Low orbit/);
  await shot(page, "a05-solo-decision");
});

test("Crew mode", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await click(page, /^Start mission$/);
  await click(page, NEXT);
  await pick(page, /^Crew/);
  await pick(page, /^4 people/);
  await shot(page, "b01-crew-size");
  await click(page, NEXT);
  await click(page, NEXT);
  await click(page, NEXT);
  await shot(page, "b02-crew-avatars");
  await click(page, NEXT);
  await click(page, /^Begin the transfer test$/);
  await click(page, /^Skip scene$/);
  for (let beat = 0; beat < 9; beat += 1) await click(page, NEXT);
  await click(page, /^Look at the problem$/);
  await click(page, /^Start planning$/);
  await pick(page, /^Low orbit/);
  await shot(page, "b03-crew-turn");
  await click(page, /^Propose:/);
  await shot(page, "b04-crew-proposal");
});

test("Arabic", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await click(page, /^Start mission$/);
  await pick(page, /مصري/);
  await shot(page, "c01-ar-setup");
  for (let step = 0; step < 5; step += 1) await click(page, NEXT);
  await click(page, /^يلا نبدأ اختبار النقل$/);
  await shot(page, "c02-ar-story");
  await click(page, /^فوّت المشهد$/);
  await page.evaluate(() => window.localStorage.setItem("odyssey-seen-reveal", "1"));
  for (let beat = 0; beat < 9; beat += 1) await click(page, NEXT);
  await click(page, /^نشوف المشكلة$/);
  await click(page, /^يلا نخطط$/);
  await pick(page, /^مدار واطي/);
  await shot(page, "c03-ar-decision");
  await click(page, /^أكّد:/);
  await click(page, /^اللي بعده:/);
  await pick(page, /^موتور كيميائي/);
  await click(page, /^أكّد:/);
  await click(page, /^اللي بعده:/);
  await pick(page, /^ركّب الألواح/);
  await click(page, /^أكّد:/);
  await shot(page, "c04-ar-consequence");
  await click(page, /^طيّر التصميم ده$/);
  await click(page, /^كمّل الرحلة$/);
  await click(page, /^كمّل الرحلة$/);
  await click(page, /^شوف اللي حصل وليه$/);
  await shot(page, "c05-ar-review");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, "c06-ar-phone");
});
