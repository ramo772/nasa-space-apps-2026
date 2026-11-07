// Generates src/styles/tokens.css from the canonical design/tokens.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../design/tokens.json");
const target = resolve(here, "../src/styles/tokens.css");
const groups = ["color", "font", "radius", "spacing", "stroke", "motion", "shadow"];
const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const tokens = JSON.parse(readFileSync(source, "utf8"));
const lines = groups.flatMap((group) =>
  Object.entries(tokens[group]).map(([name, value]) => `  --${group}-${kebab(name)}: ${value};`),
);

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `/* Generated from design/tokens.json by scripts/build-tokens.mjs. Do not edit. */\n:root {\n${lines.join("\n")}\n}\n`);
