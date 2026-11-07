// Game rules for one three-stop voyage.
// NASA facts never enter these numbers except through pressureFrom().
// Every button effect is the object these functions return. The story cannot change it.

export const AU_KM = 149597870.7;
export const LD_KM = 384400;

export const START = Object.freeze({
  mass: 64,
  power: 64,
  budget: 72,
  science: 0,
  returnFuel: false,
  aborted: false,
});

export function freshState() {
  return { ...START };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function pressureFrom(target) {
  const distAu = Number(target.distAu);
  const speed = Number(target.vRelKmS);
  const diameter = target.diameterKm == null || target.diameterKm === ""
    ? null
    : Number(target.diameterKm);
  const known = Number.isFinite(diameter);
  const ld = (distAu * AU_KM) / LD_KM;
  return {
    ld,
    speed,
    known,
    diameterKm: known ? diameter : null,
    instrumentMass: known ? clamp(Math.round(12 + diameter * 10), 14, 30) : 24,
    instrumentPower: known ? 14 : 20,
    propellantBudget: clamp(Math.round(10 + speed), 14, 32),
    commsPower: clamp(Math.round(10 + ld * 4), 12, 30),
    fast: speed >= 10,
  };
}

function choice(id, labels, effects, flags = {}, note = "") {
  return { id, labels, effects, flags, note };
}

function abortChoice() {
  return choice(
    "abort",
    {
      kid: "Skip the pass and aim home",
      student: "Leave the pass and point the ship home",
      crew: "Abort the pass and protect the ride home",
    },
    { mass: 6, power: 10, science: -14 },
    { aborted: true },
    "You leave this pass and aim the ship home. Mass and power come back. The notes drop.",
  );
}

export function choicesFor(beat, pressure, goal, state) {
  if (beat === 0) {
    return [
      choice(
        "lab",
        {
          kid: "Watch the rock on the way home",
          student: "Carry a sensor past the rock",
          crew: "Manifest a sensor for the pass home",
        },
        {
          mass: -pressure.instrumentMass,
          power: -pressure.instrumentPower,
          budget: -14,
          science: 32,
        },
        {},
        pressure.known
          ? "The lab is sized from the published diameter."
          : "NASA has no published size, so the lab includes a survey camera.",
      ),
      choice(
        "fuel",
        {
          kid: "Save fuel for home",
          student: "Keep propellant for the ride home",
          crew: "Protect the burn that finishes the trip",
        },
        {
          mass: 6,
          power: -6,
          budget: -pressure.propellantBudget,
          science: 8,
        },
        { returnFuel: true },
        "The propellant cost follows the published approach speed.",
      ),
    ];
  }

  if (beat === 1) {
    return [
      choice(
        "shout",
        {
          kid: "Call home during the pass",
          student: "Send the notes home during the pass",
          crew: "Spend power on the link home",
        },
        { power: -pressure.commsPower, budget: -10, science: 18 },
        {},
        "Link power follows the published miss distance.",
      ),
      choice(
        "store",
        {
          kid: "Keep the notes and save power",
          student: "Store the notes for later in the trip",
          crew: "Hold the data and save link power",
        },
        { power: -6, budget: -4, science: pressure.fast ? -10 : 12 },
        {},
        pressure.fast
          ? "The published speed is at least 10 km/s, so a stored dump loses notes."
          : "The published speed is under 10 km/s, so a stored dump keeps most notes.",
      ),
    ];
  }

  if (goal === "look") {
    return [
      choice(
        "commit",
        {
          kid: "Stay for the look",
          student: "Commit the remaining power to the look",
          crew: "Commit the observation",
        },
        { mass: -8, power: -16, science: 14 },
      ),
      abortChoice(),
    ];
  }

  if (goal === "survive") {
    return [
      choice(
        "commit",
        {
          kid: "Fly past it and keep going home",
          student: "Finish the pass, then continue home",
          crew: "Hold the pass and protect the ride home",
        },
        { mass: -4, power: -6, budget: -8, science: 4 },
      ),
      abortChoice(),
    ];
  }

  const packed = Boolean(state.returnFuel);
  return [
    choice(
      "commit",
      {
        kid: "Take a piece home",
        student: "Attempt the sample grab",
        crew: "Execute the sample sequence",
      },
      { mass: -14, power: -12, budget: -10, science: packed ? 18 : 4 },
      {},
      packed
        ? "Return propellant is aboard."
        : "Return propellant was never loaded, so most of the sample is lost.",
    ),
    abortChoice(),
  ];
}

export function applyChoice(state, choice) {
  const next = { ...state };
  for (const key of ["mass", "power", "budget", "science"]) {
    next[key] = state[key] + (choice.effects[key] || 0);
  }
  if (choice.flags.returnFuel) next.returnFuel = true;
  if (choice.flags.aborted) next.aborted = true;
  return next;
}

export function meterBand(value) {
  if (value <= 0) return "empty";
  if (value < 20) return "critical";
  if (value < 40) return "tight";
  return "safe";
}

export function evaluate(state, goal) {
  const broke = ["mass", "power", "budget"].filter((key) => state[key] <= 0);
  if (broke.length) return { won: false, reason: "broke", broke };

  if (goal === "look") {
    if (state.aborted) return { won: false, reason: "aborted", broke: [] };
    if (state.science < 40) return { won: false, reason: "thin-science", broke: [] };
    return { won: true, reason: "look", broke: [] };
  }

  if (goal === "survive") {
    const margins = state.mass >= 20 && state.power >= 20 && state.budget >= 20;
    return { won: margins, reason: margins ? "survive" : "margins", broke: [] };
  }

  if (!state.returnFuel) return { won: false, reason: "no-fuel", broke: [] };
  if (state.aborted) return { won: false, reason: "aborted", broke: [] };
  if (state.science < 24 || state.mass < 12) return { won: false, reason: "thin-sample", broke: [] };
  return { won: true, reason: "sample", broke: [] };
}

export function playPath(target, goal, ids) {
  let state = freshState();
  const pressure = pressureFrom(target);
  const log = [];
  ids.forEach((id, beat) => {
    const options = choicesFor(beat, pressure, goal, state);
    const picked = options.find((option) => option.id === id);
    if (!picked) throw new Error(`No choice ${id} on beat ${beat}`);
    const before = { ...state };
    state = applyChoice(state, picked);
    log.push({ beat, id, before, after: { ...state }, effects: { ...picked.effects } });
  });
  return { state, pressure, result: evaluate(state, goal), log };
}

export function formatAu(distAu) {
  return `${Number(distAu).toFixed(4)} au`;
}

export function formatLd(distAu) {
  return `${((Number(distAu) * AU_KM) / LD_KM).toFixed(1)} Moon-distances`;
}

export function formatSpeed(speed) {
  return `${Number(speed).toFixed(2)} km/s`;
}

export function formatDiameter(km) {
  if (km == null || !Number.isFinite(Number(km))) return null;
  const value = Number(km);
  if (value >= 1) return `${value.toFixed(2)} km`;
  return `${Math.round(value * 1000)} m`;
}

export function sizeSentence(km) {
  const label = formatDiameter(km);
  if (!label) return "NASA has not published a size for this visitor.";
  const meters = Number(km) * 1000;
  if (meters < 30) return `NASA lists the size as ${label}, shorter than 30 meters.`;
  if (meters < 100) return `NASA lists the size as ${label}, between 30 and 100 meters.`;
  if (meters < 1000) return `NASA lists the size as ${label}, under one kilometer.`;
  return `NASA lists the size as ${label}, at least one kilometer across.`;
}
