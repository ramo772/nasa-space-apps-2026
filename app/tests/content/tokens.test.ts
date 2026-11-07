import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(__dirname, path), "utf8");
const tokens = JSON.parse(read("../../../design/tokens.json")) as Record<string, Record<string, string | number>>;
const css = read("../../src/styles/tokens.css");
const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

describe("design tokens", () => {
  it("publishes every canonical token unchanged", () => {
    for (const group of ["color", "font", "radius", "spacing", "stroke", "motion", "shadow"]) {
      for (const [name, value] of Object.entries(tokens[group]!)) {
        expect(css).toContain(`--${group}-${kebab(name)}: ${value};`);
      }
    }
  });

  it("keeps hard-coded colours out of the stylesheets", () => {
    for (const file of ["global.css", "game.css"]) {
      expect(read(`../../src/styles/${file}`)).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    }
  });
});
