import { expect, test, type Page } from "@playwright/test";

const pick = (page: Page, name: RegExp) => page.getByRole("radio", { name });
const next = (page: Page, name: RegExp) => page.getByRole("button", { name }).click();
const NEXT = /^(Next|اللي بعده)$/;

// Most tests have already seen the reveal, so they may skip it. One test below plays it for the first time.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("odyssey-seen-reveal", "1"));
});

/** Walks the six setup steps. Each option is selected only if the test asks for it. */
async function setup(page: Page, options: { difficulty?: RegExp; crew?: number; callsign?: string; language?: RegExp } = {}) {
  await page.goto("/");
  await next(page, /^Start mission$/);
  if (options.language) await pick(page, options.language).check();
  await next(page, NEXT);
  if (options.crew) {
    await pick(page, /^Crew/).check();
    await pick(page, new RegExp(`^${options.crew} people`)).check();
  }
  await next(page, NEXT);
  await next(page, NEXT);
  if (options.difficulty) await pick(page, options.difficulty).check();
  await next(page, NEXT);
  await next(page, NEXT);
  if (options.callsign) await page.getByLabel(/Your callsign/).fill(options.callsign);
  await next(page, /^(Begin the transfer test|يلا نبدأ اختبار النقل)$/);
}

async function toDecisions(page: Page, options: Parameters<typeof setup>[1] = {}) {
  await setup(page, options);
  await next(page, /^Skip scene$/);
  await next(page, /^Skip scene$/);
  await next(page, /^Start planning$/);
}

async function fly(page: Page, destination: RegExp, engine: RegExp, array: RegExp) {
  await pick(page, destination).check();
  await next(page, /^Confirm:/);
  await next(page, /^Next:/);
  await pick(page, engine).check();
  await next(page, /^Confirm:/);
  await next(page, /^Next:/);
  await pick(page, array).check();
  await next(page, /^Confirm:/);
  await next(page, /^Fly this design$/);
  for (let index = 0; index < 3; index += 1) {
    const review = page.getByTestId("result-title");
    if (await review.isVisible()) break;
    await page.getByRole("button", { name: /^(Continue the flight|See what happened and why)$/ }).click();
  }
  await expect(page.getByTestId("result-title")).toBeVisible();
}

/** The simple view is playable, so a broken 3D scene would otherwise pass every other test. */
async function expectReal3D(page: Page) {
  await expect(page.locator(".stage canvas")).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".stage[data-ready=true]")).toBeVisible();
  await expect(page.getByTestId("flat-stage")).toHaveCount(0);
  await expect(page.getByTestId("stage-notice")).toHaveCount(0);
}

test.describe("the mission", () => {
  test("a chemical route home, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await toDecisions(page);
    await expectReal3D(page);
    await fly(page, /^Low orbit/, /^Chemical engine/, /^Keep the small array/);
    await expect(page.getByTestId("result-title")).toHaveText("Feasible: Dr. Nadir gets home");
    await expect(page.getByTestId("causal-list")).toContainText("25,619 kg");
    await expectReal3D(page);
    expect(errors).toEqual([]);
  });

  test("a failed design explains itself, and one change rescues it", async ({ page }) => {
    await toDecisions(page);
    await fly(page, /^Low orbit/, /^Chemical engine/, /^Fit the large array/);
    await expect(page.getByTestId("result-title")).toHaveText("Infeasible: this design doesn't get there");
    await expect(page.getByTestId("improvement")).toContainText("Keep the small array");

    await next(page, /^Try another design$/);
    await expect(page.getByText("Last time").first()).toBeVisible();
    await fly(page, /^Low orbit/, /^Electric engine/, /^Fit the large array/);
    await expect(page.getByTestId("result-title")).toHaveText("Feasible: Dr. Nadir gets home");
    await expect(page.getByRole("heading", { name: /Designs you've flown: 2 of 8/ })).toBeVisible();
  });

  test("the meters show the values the engine calculated", async ({ page }) => {
    await toDecisions(page);
    await pick(page, /^Low orbit/).check();
    await next(page, /^Confirm:/);
    await next(page, /^Next:/);
    await pick(page, /^Electric engine/).check();
    await next(page, /^Confirm:/);
    await expect(page.getByTestId("value-time")).toHaveText("924.3 days");
    await expect(page.getByTestId("meter-time")).toContainText("Supplies last only 180 days");
    await next(page, /^Next:/);
    await pick(page, /^Fit the large array/).check();
    await next(page, /^Confirm:/);
    await expect(page.getByTestId("value-time")).toHaveText("146.2 days");
  });

  test("difficulty changes help, never the science", async ({ page }) => {
    await toDecisions(page, { difficulty: /^Systems/ });
    await expect(page.getByTestId("meter-mass")).toBeVisible();
    await pick(page, /^Low orbit/).check();
    await expect(page.getByTestId("preview")).toHaveCount(0);
    await next(page, /^Confirm:/);
    await expect(page.getByTestId("calculations")).toContainText("3.62 km/s");
    await next(page, /^Next:/);
    await pick(page, /^Chemical engine/).check();
    await expect(page.getByTestId("value-propellant")).toHaveText("Not known yet");
    await next(page, /^Confirm:/);
    await expect(page.getByTestId("value-propellant")).toHaveText("381 kg");
  });
});

test("the whole mission works by keyboard alone", async ({ page }) => {
  await page.goto("/");
  const press = async (key: string) => page.keyboard.press(key);

  await expect(page.getByRole("button", { name: /^Start mission$/ })).toBeFocused();
  await press("Enter");
  for (let step = 0; step < 6; step += 1) {
    await expect(page.getByRole("button", { name: /^(Next|Begin the transfer test)$/ })).toBeFocused();
    await press("Enter");
  }
  for (let beat = 0; beat < 5 + 10; beat += 1) await press("Enter");
  await expect(page.getByRole("button", { name: /^Start planning$/ })).toBeFocused();
  await press("Enter");

  await expect(pick(page, /^Low orbit/)).toBeFocused();
  await press("Space");
  await page.getByRole("button", { name: /^Confirm:/ }).focus();
  await press("Enter");
  await expect(page.getByRole("button", { name: /^Next:/ })).toBeFocused();
  await press("Enter");

  await expect(pick(page, /^Chemical engine/)).toBeFocused();
  await press("Space");
  await page.getByRole("button", { name: /^Confirm:/ }).focus();
  await press("Enter");
  await press("Enter");

  await press("Space");
  await page.getByRole("button", { name: /^Confirm:/ }).focus();
  await press("Enter");
  await press("Enter");
  for (let checkpoint = 0; checkpoint < 3; checkpoint += 1) await press("Enter");
  await expect(page.getByTestId("result-title")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Try another design$/ })).toBeFocused();
});

test("the source drawer opens from a decision and returns focus", async ({ page }) => {
  await toDecisions(page);
  const open = page.getByRole("button", { name: /^See sources$/ });
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("NASA source");
  await expect(dialog).toContainText("Simplified game rule");
  await expect(dialog).toContainText("JPL Horizons");
  await expect(dialog.getByRole("link").first()).toHaveAttribute("href", /nasa\.gov/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test.describe("your profile", () => {
  test("the callsign reaches the story and the rail, and stays on this device", async ({ page }) => {
    const sent: string[] = [];
    page.on("request", (request) => sent.push(request.url() + (request.postData() ?? "")));
    await setup(page, { callsign: "Nova" });
    await next(page, /^Skip scene$/);
    for (let beat = 0; beat < 9; beat += 1) await next(page, /^Next$/);
    await expect(page.getByTestId("dialogue")).toContainText("Nova");
    await next(page, /^Look at the problem$/);
    await expect(page.getByTestId("crew-rail")).toContainText("Nova");
    await next(page, /^Start planning$/);
    await expect(page.getByTestId("dialogue")).toContainText("Nova");
    expect(sent.filter((entry) => entry.includes("Nova"))).toEqual([]);

    await page.reload();
    await next(page, /^Start mission$/);
    for (let step = 0; step < 5; step += 1) await next(page, /^Next$/);
    await expect(page.getByLabel(/Your callsign/)).toHaveValue("Nova");
  });

  test("your avatar and suit color follow you into the mission", async ({ page }) => {
    await page.goto("/");
    await next(page, /^Start mission$/);
    for (let step = 0; step < 4; step += 1) await next(page, /^Next$/);
    await page.locator(".avatar-pick").nth(3).click();
    await page.locator(".accent-coral").click();
    await expect(page.getByRole("radio", { name: "Crew avatar 4" })).toBeChecked();
    await next(page, /^Next$/);
    await next(page, /^Begin the transfer test$/);
    await next(page, /^Skip scene$/);
    await next(page, /^Skip scene$/);
    await next(page, /^Start planning$/);
    const saved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("odyssey-profile-v1") ?? "{}"));
    expect(saved.crew[0]).toMatchObject({ avatar: 3, accent: "coral" });
    await expect(page.getByTestId("crew-rail").locator(".avatar")).toBeVisible();
  });

  test("setup offers at least four avatars, and never asks for an age or a birth date", async ({ page }) => {
    await page.goto("/");
    await next(page, /^Start mission$/);
    for (let step = 0; step < 4; step += 1) {
      await expect(page.locator(".onboarding")).not.toContainText(/birth|\bage\b/i);
      await next(page, /^Next$/);
    }
    expect(await page.getByRole("radio", { name: /^Crew avatar/ }).count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator(".onboarding")).not.toContainText(/birth|\bage\b/i);
  });
});

test.describe("the Meat-a-roid reveal", () => {
  test("plays in full the first time, ends on the title and objective, then can be skipped", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.removeItem("odyssey-seen-reveal"));
    await page.goto("/");
    await next(page, /^Start mission$/);
    for (let step = 0; step < 5; step += 1) await next(page, /^Next$/);
    await next(page, /^Begin the transfer test$/);
    await next(page, /^Skip scene$/);

    await expect(page.getByRole("button", { name: /^Skip scene$/ })).toHaveCount(0);
    await expect(page.getByTestId("dialogue")).toContainText("Did the test work?");
    for (let beat = 0; beat < 4; beat += 1) await next(page, /^Next$/);
    await expect(page.getByTestId("dialogue")).toContainText("This is not home.");
    await next(page, /^Next$/);
    await expect(page.getByTestId("dialogue")).toContainText("You did not specify familiar.");
    await next(page, /^Next$/);
    await next(page, /^Next$/);
    await expect(page.getByTestId("dialogue")).toContainText("Modular Experimental Assembly Testbed");
    await next(page, /^Next$/);
    await next(page, /^Next$/);
    await expect(page.getByTestId("title-card")).toContainText("THE ODYSSEY OF A MEAT-A-ROID");
    await expect(page.getByTestId("title-card")).toContainText("Find a way home");
    await next(page, /^Look at the problem$/);
    expect(await page.evaluate(() => window.localStorage.getItem("odyssey-seen-reveal"))).toBe("1");
  });

  test("names the depot as fiction in the source drawer", async ({ page }) => {
    await toDecisions(page);
    await next(page, /^See sources$/);
    await expect(page.getByRole("dialog")).toContainText("NASA does not operate or endorse this fictional depot.");
  });

  test("each decision shows its sector", async ({ page }) => {
    await toDecisions(page);
    await expect(page.getByTestId("sector")).toHaveText("Mission Table");
    await pick(page, /^Low orbit/).check();
    await next(page, /^Confirm:/);
    await next(page, /^Next:/);
    await expect(page.getByTestId("sector")).toHaveText("Propulsion Bay");
  });
});

test.describe("Arabic", () => {
  test("switches the whole game to right-to-left, with the same results", async ({ page }) => {
    await setup(page, { language: /مصري/ });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar-EG");
    await next(page, /^فوّت المشهد$/);
    await next(page, /^فوّت المشهد$/);
    await next(page, /^يلا نخطط$/);
    await pick(page, /^مدار واطي/).check();
    await next(page, /^أكّد:/);
    await next(page, /^اللي بعده:/);
    await pick(page, /^موتور كيميائي/).check();
    await next(page, /^أكّد:/);
    await expect(page.getByTestId("value-propellant")).toContainText("381 kg");
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(fits).toBe(true);
    await expect(page.locator(".meters").getByText("Propellant")).toHaveCount(0);
  });

  test("changing language mid-mission keeps the mission", async ({ page }) => {
    await toDecisions(page);
    await pick(page, /^Low orbit/).check();
    await next(page, /^Confirm:/);
    await next(page, /^Sound and motion$/);
    await page.getByRole("radio", { name: /مصري/ }).check();
    await next(page, /^اقفل$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("button", { name: /^اللي بعده:/ })).toBeVisible();
    await expect(page.getByText("3.62 km/s").first()).toBeVisible();
  });
});

test.describe("Crew mode", () => {
  for (const size of [2, 3, 4]) {
    test(`${size} people complete a mission together`, async ({ page }) => {
      await toDecisions(page, { crew: size });
      await expect(page.locator(".crew-member")).toHaveCount(size);

      for (const [option, role] of [[/^Low orbit/, /Science\/Communications Officer/], [/^Chemical engine/, /Propulsion Engineer/], [/^Keep the small array/, /Power\/Systems Engineer/]] as const) {
        await expect(page.getByTestId("turn-banner")).toContainText(role);
        await pick(page, option).check();
        await next(page, /^Propose:/);
        await expect(page.getByTestId("proposal")).toContainText("Crew, talk it over");
        await next(page, /approve as Mission Director$/);
        await next(page, /^(Next:|Fly this design)/);
      }
      for (let checkpoint = 0; checkpoint < 3; checkpoint += 1) {
        await next(page, /^(Continue the flight|See what happened and why)$/);
      }
      await expect(page.getByTestId("result-title")).toHaveText("Feasible: Dr. Nadir gets home");
    });
  }

  test("a proposal can be changed before anyone approves it", async ({ page }) => {
    await toDecisions(page, { crew: 2 });
    await pick(page, /^Low orbit/).check();
    await next(page, /^Propose:/);
    await next(page, /^Change the proposal$/);
    await pick(page, /^Geosynchronous orbit/).check();
    await next(page, /^Propose:/);
    await expect(page.getByTestId("proposal")).toContainText("Geosynchronous orbit");
  });
});

test("reduced motion completes the mission with the same results", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toDecisions(page);
  await fly(page, /^Low orbit/, /^Electric engine/, /^Fit the large array/);
  await expect(page.getByTestId("causal-list")).toContainText("146.2 days");
});

test("no WebGL falls back to a playable flat workshop", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await toDecisions(page);
  await expect(page.getByTestId("flat-stage")).toBeVisible();
  await expect(page.getByTestId("stage-notice")).toBeVisible();
  await expect(page.getByTestId("flat-rivo")).toBeVisible();
  await expect(page.getByTestId("flat-orbit")).toBeVisible();
  await fly(page, /^Low orbit/, /^Chemical engine/, /^Keep the small array/);
  await expect(page.getByTestId("result-title")).toHaveText("Feasible: Dr. Nadir gets home");
});

test("a failed 3D download falls back to a playable flat workshop", async ({ page }) => {
  await page.route("**/src/visual/Stage3D.tsx*", (route) => route.abort());
  await toDecisions(page);
  await expect(page.getByTestId("flat-stage")).toBeVisible();
  await expect(page.getByTestId("stage-notice")).toBeVisible();
  await fly(page, /^Low orbit/, /^Chemical engine/, /^Keep the small array/);
});

test("the mission keeps working with the network off", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator(".stage[data-ready=true]")).toBeVisible({ timeout: 30000 });
  await context.setOffline(true);
  await next(page, /^Start mission$/);
  for (let step = 0; step < 5; step += 1) await next(page, /^Next$/);
  await next(page, /^Begin the transfer test$/);
  await next(page, /^Skip scene$/);
  await next(page, /^Skip scene$/);
  await next(page, /^Start planning$/);
  await fly(page, /^Low orbit/, /^Chemical engine/, /^Keep the small array/);
  await expect(page.getByTestId("result-title")).toHaveText("Feasible: Dr. Nadir gets home");
});

for (const [width, height] of [[1366, 768], [1920, 1080], [820, 1180], [390, 844]] as const) {
  test(`the mission fits at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await toDecisions(page);
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(await fits()).toBe(true);
    await pick(page, /^Low orbit/).check();
    const confirm = page.getByRole("button", { name: /^Confirm:/ });
    await confirm.scrollIntoViewIfNeeded();
    await expect(confirm).toBeInViewport();
    const box = await confirm.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await fly(page, /^Low orbit/, /^Chemical engine/, /^Keep the small array/);
    expect(await fits()).toBe(true);
  });
}
