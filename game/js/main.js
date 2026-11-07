import { parseCad, sortByDistance } from "./nasa.js";
import {
  applyChoice,
  choicesFor,
  evaluate,
  formatAu,
  formatDiameter,
  formatLd,
  formatSpeed,
  freshState,
  meterBand,
  pressureFrom,
} from "./rules.js";
import {
  allowedNumbers,
  consequenceLine,
  debriefCopy,
  LEG_CREDITS,
  quipLine,
  usesOnlyAllowed,
  WORKSHOP_COST,
} from "./story.js";
import { SPOTS } from "./sim.js";
import { mountWorld } from "./scene.js";

const objectiveEl = document.querySelector("#objective");
const factEl = document.querySelector("#fact-pill");
const ruleEl = document.querySelector("#story-pill");
const promptEl = document.querySelector("#prompt");
const metersEl = document.querySelector("#meters");
const voiceEl = document.querySelector("#voice");
const debriefEl = document.querySelector("#debrief");

const VOICES = [
  ["kid", "Kid"],
  ["student", "Student"],
  ["crew", "Crew"],
];

const BENCH_COLOR = {
  lab: 0x38bdf8,
  fuel: 0xfbbf24,
  shout: 0xfb7185,
  store: 0xa78bfa,
  commit: 0x34d399,
  abort: 0x94a3b8,
};

const game = {
  voice: "student",
  goal: null,
  beat: 0,
  state: freshState(),
  parts: {},
  credits: 0,
  quip: "",
  buildId: "",
  workshopId: "",
  approaches: [],
  targetIndex: 0,
  sourceLabel: "",
  phase: "walk",
  locked: false,
  aiReady: false,
  loadError: "",
  lastLine: "",
  lastWon: false,
  hints: new Map(),
  shorts: new Map(),
};

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const world = mountWorld(document.querySelector("#space"), {
  onInteract: install,
  onStatus,
  onRetry: () => {
    if (game.phase === "end") restart();
  },
});

boot();

async function boot() {
  setText(ruleEl, "Mass, power, and budget are game rules. The visitor line is NASA.");
  setText(objectiveEl, "Walk to the hangar.");
  setText(factEl, "Asking NASA which rocks pass Earth next…");
  renderVoice();
  renderMeters();
  syncWorld();
  try {
    const health = await fetch("/api/health").then((response) => response.json());
    game.aiReady = Boolean(health.ai);
  } catch {
    game.aiReady = false;
  }
  try {
    const payload = await fetch("/api/approaches").then(readJson);
    const targets = sortByDistance(parseCad(payload.cad));
    if (!targets.length) throw new Error("NASA returned no usable close approaches.");
    game.approaches = targets;
    game.sourceLabel = payload.kind === "live" ? "NASA live" : "NASA saved";
    game.loadError = "";
    game.goal = "survive";
    game.phase = "build";
    game.beat = 0;
    showFact();
  } catch (error) {
    game.loadError = `${error.message} Run python server.py from the game folder.`;
    setText(factEl, game.loadError);
  }
  syncWorld();
  renderVoice();
}

function currentTarget() {
  return game.approaches[game.targetIndex] || null;
}

function currentChoices() {
  const target = currentTarget();
  if (!target || !game.goal) return [];
  return choicesFor(game.beat, pressureFrom(target), game.goal, game.state);
}

const STORY_PADS = [
  { id: "boast", x: -2.4, z: -12.9, color: 0xfbbf24, label: "Call the rattle a feature" },
  { id: "admit", x: 2.4, z: -12.9, color: 0x38bdf8, label: "Admit the tank is heavy" },
];

function install(id) {
  if (game.locked || game.phase === "end" || game.phase === "busy") return;
  if (!currentTarget() || game.goal !== "survive") return;
  if (game.phase === "story") {
    if (!STORY_PADS.some((pad) => pad.id === id)) return;
    game.quip = id;
    game.beat = 2;
    game.phase = "build";
    game.lastLine = quipLine(id);
    syncWorld();
    renderMeters();
    return;
  }
  const option = currentChoices().find((choice) => choice.id === id);
  if (!option || game.phase !== "build") return;
  game.locked = true;
  game.phase = "busy";
  world.setLocked(true);
  game.parts = { ...game.parts, [option.id]: true };
  game.state = applyChoice(game.state, option);
  const broke = ["mass", "power", "budget"].filter((key) => game.state[key] <= 0);
  const effectLine = consequenceLine(game.voice, game.state, option.effects, broke);
  if (game.beat === 0) {
    game.buildId = option.id;
    game.credits = LEG_CREDITS;
    game.lastLine = `${effectLine} The rock is on the way home. Prototype credits +${LEG_CREDITS}. That purse is a game rule.`;
  } else if (game.beat === 1) {
    game.workshopId = option.id;
    game.credits = Math.max(0, game.credits - WORKSHOP_COST);
    game.lastLine = `${effectLine} The workshop took ${WORKSHOP_COST} prototype credits.`;
  } else {
    game.lastLine = effectLine;
  }
  const finished = broke.length > 0 || game.beat >= 2;
  const nextPhase = game.beat === 1 && !finished ? "story" : "build";
  syncWorld();
  renderMeters();
  window.setTimeout(() => {
    game.locked = false;
    world.setLocked(false);
    if (finished) {
      endVoyage();
      return;
    }
    if (nextPhase === "story") {
      game.phase = "story";
      syncWorld();
      return;
    }
    game.beat += 1;
    game.phase = "build";
    syncWorld();
  }, reduced ? 0 : 700);
}

function endVoyage() {
  const target = currentTarget();
  const result = evaluate(game.state, game.goal);
  game.phase = "end";
  game.locked = true;
  game.lastWon = result.won;
  world.setLocked(true);
  syncWorld();
  const mode = result.won && !game.state.aborted ? "launch" : "hold";
  world.playOut(mode, () => {
    world.setLocked(false);
    showDebrief(result, target);
  });
}

function restart() {
  game.goal = game.approaches.length ? "survive" : null;
  game.beat = 0;
  game.state = freshState();
  game.parts = {};
  game.credits = 0;
  game.quip = "";
  game.buildId = "";
  game.workshopId = "";
  game.phase = game.goal ? "build" : "walk";
  game.locked = false;
  game.lastLine = "";
  game.lastWon = false;
  debriefEl.hidden = true;
  debriefEl.replaceChildren();
  world.setLocked(false);
  world.playOut("reset");
  syncWorld();
  renderMeters();
}

function cycleTarget() {
  if (!game.approaches.length) return;
  game.targetIndex = (game.targetIndex + 1) % game.approaches.length;
  showFact();
  restart();
}

function syncWorld() {
  const stations = [];
  game.hints = new Map();
  game.shorts = new Map();
  if (game.phase === "story") {
    for (const pad of STORY_PADS) {
      stations.push({ ...pad, hot: true });
      game.shorts.set(pad.id, pad.label);
      game.hints.set(pad.id, `${pad.label}. This joke does not change the score. Press E.`);
    }
  } else if (game.phase === "build") {
    for (const option of currentChoices()) {
      const spot = SPOTS[option.id];
      const label = option.labels[game.voice] || option.labels.student;
      stations.push({
        id: option.id,
        x: spot.x,
        z: spot.z,
        color: BENCH_COLOR[option.id],
        label,
        hot: true,
      });
      game.shorts.set(option.id, label);
      const note = option.note ? ` ${option.note}` : "";
      const purse = game.beat === 1 ? ` Prototype credits -${WORKSHOP_COST}.` : "";
      game.hints.set(option.id, `${label}. ${effectText(option.effects)}.${note}${purse} Press E.`);
    }
  }
  world.setStations(stations);
  world.setBuild({
    active: Boolean(game.goal),
    parts: game.parts,
    alarm: game.phase === "end" && !game.lastWon,
  });
  renderVoice();
}

function onStatus(status) {
  const target = currentTarget();
  let objective;
  if (!target) {
    objective = game.loadError || "Walk to the hangar. The pads light up when NASA answers.";
  } else if (game.phase === "end") {
    objective = game.lastWon ? "The ship can still get home." : "The ride home is short.";
  } else if (game.phase === "busy") {
    objective = "Fitting that part onto the ship.";
  } else if (game.phase === "story") {
    objective = "Tell the workshop one joke. It will show up later, and it will not change the score.";
  } else if (!status.inside && game.beat === 0) {
    objective = `Get the ship home. ${plainName(target.name)} is the rock on the way. Walk into the workshop.`;
  } else if (game.beat === 0) {
    objective = "Fit one build for the ride home: a sensor for the rock, or fuel to finish the trip.";
  } else if (game.beat === 1) {
    objective = `Workshop on the way home. Change one part for ${WORKSHOP_COST} prototype credits.`;
  } else {
    objective = "Point the ship toward home. Fly the pass, or leave it.";
  }
  setText(objectiveEl, objective);

  let prompt = "";
  if (game.phase === "busy" && game.lastLine) prompt = game.lastLine;
  else if (game.phase !== "end" && status.walkingId && game.shorts.has(status.walkingId)) {
    prompt = `Walking to ${game.shorts.get(status.walkingId)}.`;
  } else if (game.phase !== "end" && status.nearId && game.hints.has(status.nearId)) {
    prompt = game.hints.get(status.nearId);
  } else if (game.phase !== "end") {
    prompt = "Click the ground or use WASD. Press E at a pad.";
  }
  setText(promptEl, prompt);
  promptEl.hidden = prompt.length === 0;
}

function showDebrief(result, target) {
  debriefEl.replaceChildren();
  const card = document.createElement("div");
  card.className = "end-card";
  const heading = document.createElement("h2");
  heading.textContent = result.won ? "The ship still has a way home" : "The ship is not home yet";
  const copy = document.createElement("p");
  copy.textContent = debriefCopy(game.voice, game.goal, result, target);
  const trace = document.createElement("p");
  const buildName = game.buildId === "fuel"
    ? "return propellant"
    : game.buildId === "lab"
      ? "a sensor for the rock on the way"
      : "no finished build";
  const shop = game.workshopId === "store"
    ? `The workshop stored the notes and spent ${WORKSHOP_COST} of ${LEG_CREDITS} prototype credits.`
    : game.workshopId === "shout"
      ? `The workshop called home during the pass and spent ${WORKSHOP_COST} of ${LEG_CREDITS} prototype credits.`
      : "The workshop did not get a second part.";
  trace.textContent = `The build carried ${buildName}. ${shop} ${game.quip ? quipLine(game.quip) : ""}`.trim();
  card.append(heading, copy, trace);
  if (game.lastLine) {
    const last = document.createElement("p");
    last.className = "fine";
    last.textContent = game.lastLine;
    card.append(last);
  }
  const link = document.createElement("a");
  link.href = `https://ssd-api.jpl.nasa.gov/cad.api?des=${encodeURIComponent(target.id)}&diameter=1&fullname=true`;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = `Open the NASA record for ${target.name}`;
  const rules = document.createElement("p");
  rules.className = "fine";
  rules.textContent = `The trip is home. ${target.name} is a NASA close approach on the way, not the destination. Distances in au come from NASA. Moon-distances use 149,597,870.7 km per au and 384,400 km. Getting home with margin needs mass, power, and budget each at 20 or more. The leg pays ${LEG_CREDITS} prototype credits and the workshop spends ${WORKSHOP_COST}. Those credits, and the joke, are game rules.`;
  const row = document.createElement("div");
  row.className = "row";
  row.append(
    button("Build again", "primary", restart),
    button("Next visitor", "", cycleTarget),
  );
  card.append(link, rules, row);
  debriefEl.append(card);
  debriefEl.hidden = false;
}

function renderMeters() {
  metersEl.replaceChildren();
  const words = game.voice === "kid"
    ? { mass: "Weight", power: "Power", budget: "Money", science: "Notes" }
    : { mass: "Mass", power: "Power", budget: "Budget", science: "Science" };
  for (const key of ["mass", "power", "budget"]) {
    const value = game.state[key];
    const row = document.createElement("div");
    const band = meterBand(value);
    row.className = `meter ${band}`;
    const name = document.createElement("span");
    name.textContent = `${words[key]} ${value}`;
    row.setAttribute("aria-label", `${words[key]} ${value}, ${band}`);
    const bar = document.createElement("i");
    bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    row.append(name, bar);
    metersEl.append(row);
  }
  const science = document.createElement("p");
  science.className = "science";
  science.textContent = `${words.science} ${game.state.science}`;
  const purse = document.createElement("p");
  purse.className = "science";
  purse.textContent = `Prototype credits ${game.credits}`;
  metersEl.append(science, purse);
}

function renderVoice() {
  voiceEl.replaceChildren();
  for (const [value, label] of VOICES) {
    const node = button(label, game.voice === value ? "primary" : "", () => {
      game.voice = value;
      syncWorld();
      renderMeters();
    });
    node.setAttribute("aria-pressed", game.voice === value ? "true" : "false");
    voiceEl.append(node);
  }
  const next = button("Next visitor", "", cycleTarget);
  next.disabled = game.approaches.length < 2 || game.phase === "busy";
  voiceEl.append(next);
  const retell = button("Retell", "", () => { retellBeat(); });
  retell.disabled = !game.aiReady || game.phase !== "build";
  voiceEl.append(retell);
}

function showFact() {
  const target = currentTarget();
  if (!target) return;
  const size = formatDiameter(target.diameterKm) || "size not published";
  setText(
    factEl,
    `${game.sourceLabel}: ${target.name} · ${target.when} · ${formatAu(target.distAu)} · ${formatLd(target.distAu)} · ${formatSpeed(target.vRelKmS)} · ${size}`,
  );
}

async function retellBeat() {
  if (!game.aiReady || game.phase !== "build" || !game.goal) return;
  const target = currentTarget();
  const choices = currentChoices();
  const allowed = allowedNumbers({ target, choices, beat: game.beat });
  setText(promptEl, "Grok is retelling this bench…");
  promptEl.hidden = false;
  try {
    const reply = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voice: game.voice,
        tone: "weird",
        wish: "",
        beat: game.beat,
        target,
        choices: choices.map((option) => ({
          id: option.id,
          label: option.labels[game.voice],
          effects: option.effects,
        })),
        allowedNumbers: allowed,
      }),
    }).then(readJson);
    const title = String(reply.title || "").slice(0, 80);
    const body = String(reply.body || "").slice(0, 320);
    if (!reply.ok || !title || !body || !usesOnlyAllowed(`${title} ${body}`, allowed)) return;
    if (game.phase !== "build") return;
    setText(promptEl, `${title}. ${body}`);
  } catch {
    setText(promptEl, "The retelling did not arrive. The benches are unchanged.");
  }
}

function effectText(effects) {
  const words = game.voice === "kid"
    ? { mass: "weight", power: "power", budget: "money", science: "notes" }
    : { mass: "mass", power: "power", budget: "budget", science: "science" };
  return ["mass", "power", "budget", "science"]
    .filter((key) => effects[key])
    .map((key) => `${words[key]} ${effects[key] > 0 ? "+" : ""}${effects[key]}`)
    .join(" · ");
}

function plainName(name) {
  return String(name || "").replace(/[()]/g, "").trim();
}

function button(label, kind, onClick) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = kind;
  node.textContent = label;
  node.addEventListener("click", onClick);
  return node;
}

function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok && !payload.error) throw new Error(`The server answered ${response.status}.`);
  if (payload.error && response.status >= 400) throw new Error(payload.error);
  return payload;
}
