import { formatAu, formatDiameter, formatLd, formatSpeed, sizeSentence } from "./rules.js";

const TITLES = {
  clear: ["What rides in the ship", "During the pass", "At arrival"],
  weird: ["The pantry is one crate short", "The shout across the dark", "The crumb or the kitchen"],
};

export function cardTitle(tone, beat) {
  const bank = tone === "clear" ? TITLES.clear : TITLES.weird;
  return bank[beat] || bank[0];
}

export function allowedNumbers({ target, choices, beat }) {
  const bag = new Set();
  const add = (value) => {
    if (value == null || value === "") return;
    const text = String(value);
    bag.add(text);
    for (const digit of text.match(/-?\d+(?:\.\d+)?/g) || []) bag.add(digit);
  };
  add(beat + 1);
  add(2);
  add(3);
  add(formatAu(target.distAu));
  add(formatLd(target.distAu));
  add(formatSpeed(target.vRelKmS));
  add(formatDiameter(target.diameterKm));
  add(target.when);
  add(target.name);
  for (const option of choices) {
    for (const value of Object.values(option.effects)) add(value);
  }
  return [...bag];
}

export function usesOnlyAllowed(text, allowed) {
  const values = new Set(allowed.map((item) => Number(item)).filter((item) => Number.isFinite(item)));
  const found = String(text).match(/-?\d+(?:\.\d+)?/g) || [];
  return found.every((item) => values.has(Number(item)));
}

export function tellCard({ voice, tone, beat, target, choices, wish }) {
  const name = target.name;
  const when = target.when;
  const where = `${formatAu(target.distAu)}, ${formatLd(target.distAu)}`;
  const speed = formatSpeed(target.vRelKmS);
  const size = sizeSentence(target.diameterKm);
  const wishLine = wish ? ` You asked for this in the story: ${wish}.` : "";
  const title = cardTitle(tone, beat);
  let body;

  if (tone === "clear") {
    body = beat === 0
      ? `${name} is on the way home. It passes Earth on ${when}. The published miss distance is ${where}. The published speed is ${speed}. ${size} Carry a sensor for that pass, or keep the propellant for home. Both cost something. The benches are the game rules.${wishLine}`
      : beat === 1
        ? `${name} is still the rock on the way home, at ${where} and ${speed}. ${size} Calling home now spends link power. Keeping the notes aboard is cheaper, and a fast pass drops notes. The benches are the game rules.${wishLine}`
        : `Home is the heading. ${name} is still the pass in the way. ${size} The pass is ${where} at ${speed}. Fly through it, or leave it and aim home now. The benches are the game rules.${wishLine}`;
  } else {
    body = beat === 0
      ? `The workshop rattles like a drawer of loose bolts. Outside, ${name} swings past Earth on ${when}, ${where} away, at ${speed}. ${size} One bench is left. A sensor can watch the rock on the way home. The return tanks can finish the trip. The ship cannot afford both. The benches are the game rules.${wishLine}`
      : beat === 1
        ? `${name} is alongside on the way home, ${where} out, closing at ${speed}. ${size} You can shout the notes all the way home, or tuck them in the log. A fast rock steals pages from a log that waits. The benches are the game rules.${wishLine}`
        : `Home is the bright idea, and ${name} is still in the lane. ${size} It is ${where} away in the published pass, moving at ${speed}. Thread the pass, or peel off and aim the rattling ship home. The benches are the game rules.${wishLine}`;
  }

  if (voice === "kid") {
    body = body
      .replace("The published miss distance is ", "It passes ")
      .replace("The published speed is ", "It moves at ")
      .replace("The benches are the game rules.", "The benches tell the truth.");
  }

  return { title, body, provider: "basic" };
}

const PLAIN = {
  kid: { mass: "weight", power: "power", budget: "money", science: "notes" },
  student: { mass: "mass", power: "power", budget: "budget", science: "science" },
  crew: { mass: "mass", power: "power", budget: "budget", science: "science" },
};

export function consequenceLine(voice, after, effects, broke) {
  const words = PLAIN[voice] || PLAIN.student;
  const bits = ["mass", "power", "budget", "science"]
    .filter((key) => effects[key])
    .map((key) => {
      const delta = effects[key];
      const sign = delta > 0 ? `+${delta}` : `${delta}`;
      return `${words[key]} ${sign}, now ${after[key]}`;
    });
  const change = bits.join(". ");
  if (broke.length) {
    const emptied = broke.join(" and ");
    return voice === "kid"
      ? `That emptied ${emptied}. ${change}.`
      : `That choice emptied ${emptied}. ${change}.`;
  }
  return voice === "kid" ? `Here is the change. ${change}.` : change + ".";
}

export function debriefCopy(voice, goal, result, target) {
  const who = {
    look: "see the visitor up close",
    survive: "bring the ship home safe",
    sample: "bring a piece home",
  }[goal];
  const lead = result.won
    ? `The voyage did what you asked: ${who}.`
    : `The voyage did not ${who}.`;
  const because = {
    look: "The science notes reached the line the rules ask for, and you did not turn around.",
    survive: "Mass, power, and budget each finished at 20 or more, so the ride home still has margin.",
    sample: "Return propellant was aboard, you did not turn away, and enough notes came back.",
    broke: `The ship ran out of ${result.broke.join(" and ")}.`,
    aborted: "You turned the ship around, so this goal was dropped.",
    "thin-science": "The science notes finished under 40, which is the line for a close look.",
    margins: "One of mass, power, or budget finished under 20. The ship got home thin.",
    "no-fuel": "Return propellant was never loaded, so the sample did not stay with you.",
    "thin-sample": "The grab did not finish with enough notes, or with enough mass left.",
  }[result.reason] || "";
  const closer = voice === "kid"
    ? "The rock facts are from NASA. The jars follow the game rules. The story is only the story."
    : `${target.name} is a real close approach from NASA JPL. The score is the game rules, not a NASA prediction.`;
  return `${lead} ${because} ${closer}`;
}

// Prototype assumptions for the ride-home slice. Not NASA values.
export const LEG_CREDITS = 10;
export const WORKSHOP_COST = 4;

export function quipLine(id) {
  if (id === "admit") {
    return "You admitted the tank was heavier than the sketch. The workshop laughed, and the bolts stayed the same. The score did not move.";
  }
  return "You called the rattle a feature. The workshop painted it on the wall. The bolts stayed the same. The score did not move.";
}
