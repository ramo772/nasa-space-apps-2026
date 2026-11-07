import { expect, test } from "@playwright/test";

const shots = process.env.SHOT_DIR;
test.skip(!shots, "Set SHOT_DIR to capture screenshots and frame rates");

test("capture stills and measure frame rate", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(page.locator(".stage canvas")).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".stage")).toHaveAttribute("data-settled", "true", { timeout: 30000 });
  await page.screenshot({ path: `${shots}/spike-10kw.png` });

  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    return info ? gl?.getParameter(info.UNMASKED_RENDERER_WEBGL) : "unknown";
  });

  const frameTimes = page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const times: number[] = [];
        let last = performance.now();
        const start = last;
        const tick = (now: number) => {
          times.push(now - last);
          last = now;
          if (now - start < 1200) requestAnimationFrame(tick);
          else resolve(times);
        };
        requestAnimationFrame(tick);
      }),
  );
  await page.getByRole("radio", { name: /Large solar array/ }).check();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${shots}/spike-mid.png` });
  const times = (await frameTimes).slice(2).sort((a, b) => a - b);
  await expect(page.locator(".stage")).toHaveAttribute("data-settled", "true", { timeout: 30000 });
  await page.screenshot({ path: `${shots}/spike-40kw.png` });

  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  console.log(`renderer: ${renderer}`);
  console.log(`frames: ${times.length}, average ${average.toFixed(1)} ms (${(1000 / average).toFixed(0)} fps), slowest ${times.at(-1)?.toFixed(1)} ms`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/spike-phone.png`, fullPage: true });
});
