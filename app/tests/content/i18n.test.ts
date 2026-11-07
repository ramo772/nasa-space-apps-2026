import { describe, expect, it } from "vitest";
import { SCENARIO } from "../../src/content/scenario";
import { makeI18n, missingKeys, numbers, translate } from "../../src/i18n";
import { ar, arScience } from "../../src/i18n/ar";
import { en, type TranslationKey } from "../../src/i18n/en";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("translations", () => {
  it("has an Arabic entry for every English key", () => {
    const missing = (Object.keys(en) as TranslationKey[]).filter((key) => ar[key] === undefined);
    expect(missing).toEqual([]);
  });

  it("has no Arabic keys that English lacks", () => {
    expect(Object.keys(ar).filter((key) => !(key in en))).toEqual([]);
  });

  it("keeps the same placeholders in both languages", () => {
    for (const key of Object.keys(en) as TranslationKey[]) {
      expect([key, placeholders(ar[key] ?? "")]).toEqual([key, placeholders(en[key])]);
    }
  });

  it("translates all the science wording shown in the source drawer", () => {
    const texts = [...SCENARIO.values.flatMap((value) => [value.label, value.transformation, value.limitation]), ...SCENARIO.limitations, SCENARIO.fictionalFraming];
    expect([...new Set(texts)].filter((text) => arScience[text] === undefined)).toEqual([]);
  });

  it("falls back to English and reports a missing key", () => {
    missingKeys.clear();
    delete (ar as Record<string, string>)["ui.close"];
    expect(translate("ar", "ui.close")).toBe("Close");
    expect(missingKeys.has("ui.close")).toBe(true);
    (ar as Record<string, string>)["ui.close"] = "إغلاق";
  });

  it("fills in values", () => {
    expect(translate("en", "meters.short", { amount: "411 kg" })).toBe("Short by 411 kg");
  });
});

describe("numbers", () => {
  it("keeps the same digits and precision in both languages", () => {
    for (const lang of ["en", "ar"] as const) {
      const n = numbers(lang);
      const plain = (text: string) => text.replace(/[\u2066\u2069]/g, "");
      expect(plain(n.kg(25619))).toBe("25,619 kg");
      expect(plain(n.kms(3.62))).toBe("3.62 km/s");
    }
    expect(numbers("en").days(146.2)).toBe("146.2 days");
    expect(numbers("ar").days(146.2)).toContain("146.2");
  });
});

describe("Arabic number order", () => {
  it("keeps a number and its unit together inside an Arabic sentence", () => {
    expect(numbers("ar").kms(3.62)).toBe("\u20663.62 km/s\u2069");
    expect(numbers("en").kms(3.62)).toBe("3.62 km/s");
  });
});

describe("learning profiles", () => {
  it("changes the wording", () => {
    const words = (["explorer", "student", "specialist"] as const).map((profile) => makeI18n("en", profile).tp("diagnosis.line"));
    expect(new Set(words).size).toBe(3);
  });
});
