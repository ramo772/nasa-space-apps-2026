import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { playPath, pressureFrom, sizeSentence } from "../js/rules.js";
import { parseCad, sortByDistance } from "../js/nasa.js";
import { tellCard, usesOnlyAllowed, allowedNumbers } from "../js/story.js";
import { shipZ, voyageX } from "../js/motion.js";
import { choicesFor } from "../js/rules.js";

const farFast = {
  name: "(2026 VP1)",
  when: "2026-Nov-05 14:06",
  distAu: 0.05,
  vRelKmS: 12.6,
  diameterKm: null,
};

const closeSlow = {
  name: "99942 Apophis (2004 MN4)",
  when: "2029-Apr-13",
  distAu: 0.002,
  vRelKmS: 5.2,
  diameterKm: 0.34,
};

test("NASA distance changes the link cost", () => {
  const far = pressureFrom(farFast);
  const close = pressureFrom(closeSlow);
  assert.equal(far.commsPower, 30);
  assert.equal(close.commsPower, 13);
  assert.equal(far.fast, true);
  assert.equal(close.fast, false);
  assert.equal(far.known, false);
  assert.equal(close.instrumentMass, 15);
});

test("a far fast look is won by traveling light and lost by a heavy lab plus a shout", () => {
  const won = playPath(farFast, "look", ["fuel", "shout", "commit"]);
  const died = playPath(farFast, "look", ["lab", "shout", "commit"]);
  const stored = playPath(farFast, "look", ["lab", "store", "commit"]);
  assert.equal(won.result.won, true);
  assert.equal(won.state.power, 12);
  assert.equal(won.state.science, 40);
  assert.equal(died.result.reason, "broke");
  assert.equal(died.state.power, -2);
  assert.equal(stored.result.reason, "thin-science");
  assert.equal(stored.state.science, 36);
});

test("a close slow look can keep the lab and store the notes", () => {
  const stored = playPath(closeSlow, "look", ["lab", "store", "commit"]);
  const lightStored = playPath(closeSlow, "look", ["fuel", "store", "commit"]);
  assert.equal(stored.result.won, true);
  assert.equal(stored.state.science, 58);
  assert.equal(lightStored.result.reason, "thin-science");
});

test("a sample needs the ride-home jars", () => {
  const missed = playPath(farFast, "sample", ["lab", "shout", "commit"]);
  const grabbed = playPath(farFast, "sample", ["fuel", "shout", "commit"]);
  assert.equal(missed.result.reason, "no-fuel");
  assert.equal(grabbed.result.won, true);
  assert.equal(grabbed.result.reason, "sample");
});

test("survival can be saved by turning around", () => {
  const thin = playPath(farFast, "survive", ["lab", "shout", "commit"]);
  const saved = playPath(farFast, "survive", ["lab", "shout", "abort"]);
  assert.equal(thin.result.won, false);
  assert.equal(saved.result.won, true);
});

test("an unpublished size is not filled in", () => {
  assert.match(sizeSentence(null), /not published/i);
  assert.equal(sizeSentence(0.34), "NASA lists the size as 340 m, under one kilometer.");
  assert.equal(sizeSentence(0.05), "NASA lists the size as 50 m, between 30 and 100 meters.");
});

test("the saved NASA file parses into visitors", () => {
  const saved = JSON.parse(readFileSync(new URL("../data/fallback-approaches.json", import.meta.url)));
  const targets = sortByDistance(parseCad(saved.cad));
  assert.equal(targets.length, 5);
  assert.equal(targets[0].id, "2026 VP1");
  assert.equal(targets[0].diameterKm, null);
  assert.ok(targets[0].distAu < targets[1].distAu);
});

test("the basic story uses the visitor and no invented diameter", () => {
  const choices = choicesFor(0, pressureFrom(farFast), "look", { returnFuel: false });
  const card = tellCard({
    voice: "student",
    tone: "clear",
    beat: 0,
    target: farFast,
    choices,
    wish: "",
  });
  assert.match(card.body, /\(2026 VP1\)/);
  assert.match(card.body, /not published/i);
  assert.equal(usesOnlyAllowed(card.body, allowedNumbers({ target: farFast, choices, beat: 0 })), true);
  assert.equal(usesOnlyAllowed("The rock is 500 km wide.", allowedNumbers({ target: farFast, choices, beat: 0 })), false);
});

test("the pictured ship moves toward the visitor as the voyage advances", () => {
  assert.ok(voyageX(1, 1000) > voyageX(0, 1000));
  assert.equal(voyageX(-1, 1000), voyageX(0, 1000));
  assert.equal(voyageX(2, 1000), voyageX(1, 1000));
  assert.ok(shipZ(1) < shipZ(0));
  assert.equal(shipZ(0), 4);
  assert.equal(shipZ(1), -8);
});
