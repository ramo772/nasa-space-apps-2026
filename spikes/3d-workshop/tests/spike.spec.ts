import { expect, test, type Page } from "@playwright/test";

const settled = (page: Page) => expect(page.locator(".stage")).toHaveAttribute("data-settled", "true", { timeout: 30000 });

test("keyboard choice changes the values and the 3D scene", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(page.locator(".stage canvas")).toBeVisible({ timeout: 30000 });
  await settled(page);
  await expect(page.getByTestId("engine-power")).toHaveText("5 kW");
  const before = await page.locator(".stage").screenshot();

  await page.getByRole("radio", { name: /Small solar array/ }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /Large solar array/ })).toBeChecked();
  await expect(page.getByTestId("engine-power")).toHaveText("35 kW");
  await expect(page.getByTestId("array-mass")).toHaveText("1,333 kg");
  await settled(page);

  const after = await page.locator(".stage").screenshot();
  expect(after.equals(before)).toBe(false);
  expect(errors).toEqual([]);
});

test("reduced motion reaches the same final values", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".stage canvas")).toBeVisible({ timeout: 30000 });
  await settled(page);
  await page.getByRole("radio", { name: /Large solar array/ }).check();
  await settled(page);
  await expect(page.getByTestId("engine-power")).toHaveText("35 kW");
});

test("no WebGL falls back to a working flat view", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByTestId("flat-fallback")).toBeVisible();
  await page.getByRole("radio", { name: /Large solar array/ }).check();
  await expect(page.getByTestId("engine-power")).toHaveText("35 kW");
  await expect(page.locator(".flat-array .panel.open")).toHaveCount(4);
});

test("a failed scene download falls back to a working flat view", async ({ page }) => {
  await page.route("**/src/Scene.tsx*", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByTestId("flat-fallback")).toBeVisible({ timeout: 30000 });
  await page.getByRole("radio", { name: /Large solar array/ }).check();
  await expect(page.getByTestId("engine-power")).toHaveText("35 kW");
});

for (const [width, height] of [[1366, 768], [390, 844]] as const) {
  test(`layout fits at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".stage canvas")).toBeVisible({ timeout: 30000 });
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(fits).toBe(true);
    const box = await page.getByRole("radio", { name: /Small solar array/ }).locator("xpath=ancestor::label").boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
}
