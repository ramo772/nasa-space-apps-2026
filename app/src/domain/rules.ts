import type { Effect, ScenarioPack } from "../content/scenario.schema";

/**
 * The deterministic mission rules. Pure functions only: no UI, network, clock or randomness.
 * Rule IDs refer to docs/research/rule-table-draft.md.
 */

export type DestinationId = "low" | "geosynchronous";
export type EngineId = "chemical" | "electric";
export type ArrayId = "small" | "large";
export interface Design {
  destination: DestinationId;
  engine: EngineId;
  array: ArrayId;
}
export type Classification = "feasible" | "partial" | "infeasible";
export type Failure = "propellant" | "supplies" | null;

const SECONDS_PER_DAY = 86400;

type EffectOf<T extends Effect["type"]> = Extract<Effect, { type: T }>;

function effectOf<T extends Effect["type"]>(pack: ScenarioPack, type: T, optionId: string): EffectOf<T> {
  for (const decision of pack.decisions) {
    for (const option of decision.options) {
      if (option.id === optionId && option.effect.type === type) return option.effect as EffectOf<T>;
    }
  }
  throw new Error(`Unknown ${type} option: ${optionId}`);
}

export function valueOf(pack: ScenarioPack, id: string): number {
  const value = pack.values.find((item) => item.id === id);
  if (!value) throw new Error(`Unknown value: ${id}`);
  return value.amount;
}

/** R1: orbit speed in km/s. */
const speed = (mu: number, radius: number, semiMajor: number) => Math.sqrt(mu * (2 / radius - 1 / semiMajor));

export interface Transfer {
  burn1: number;
  burn2: number;
  deltaV: number;
  coastDays: number;
  targetRadius: number;
}

/** R2 and R3: a burn at apogee lowers perigee, then a burn at the new perigee circularizes. */
export function transfer(pack: ScenarioPack, destination: DestinationId): Transfer {
  const mu = valueOf(pack, "earth-gm");
  const perigee = valueOf(pack, "start-perigee");
  const apogee = valueOf(pack, "start-apogee");
  const effect = effectOf(pack, "destination", destination);
  const targetRadius = valueOf(pack, "earth-radius") + valueOf(pack, effect.altitude);
  const startA = (perigee + apogee) / 2;
  const transferA = (apogee + targetRadius) / 2;
  const burn1 = speed(mu, apogee, startA) - speed(mu, apogee, transferA);
  const burn2 = speed(mu, targetRadius, transferA) - speed(mu, targetRadius, targetRadius);
  return {
    burn1,
    burn2,
    deltaV: burn1 + burn2,
    coastDays: (Math.PI * Math.sqrt(transferA ** 3 / mu)) / SECONDS_PER_DAY,
    targetRadius,
  };
}

export const arrayKw = (pack: ScenarioPack, array: ArrayId) => valueOf(pack, effectOf(pack, "array", array).power);

/** R5: the array adds its own mass. */
export const arrayMassKg = (pack: ScenarioPack, array: ArrayId) =>
  (arrayKw(pack, array) * 1000) / valueOf(pack, "array-specific-power");

export const dryMassKg = (pack: ScenarioPack, array: ArrayId) => valueOf(pack, "dry-mass") + arrayMassKg(pack, array);

export const propellantLoadKg = (pack: ScenarioPack, engine: EngineId) =>
  valueOf(pack, effectOf(pack, "engine", engine).load);

export const enginePowerKw = (pack: ScenarioPack, array: ArrayId) => arrayKw(pack, array) - valueOf(pack, "life-support");

const exhaustSpeed = (pack: ScenarioPack, engine: EngineId) =>
  valueOf(pack, effectOf(pack, "engine", engine).isp) * valueOf(pack, "standard-gravity");

export interface Evaluation {
  design: Design;
  deltaV: number;
  dryMass: number;
  startMass: number;
  load: number;
  burn1Propellant: number;
  burn2Propellant: number;
  propellantUsed: number;
  propellantLeft: number;
  enginePowerKw: number;
  thrustN: number;
  days: number;
  suppliesDays: number;
  failure: Failure;
  result: Classification;
}

export function evaluate(pack: ScenarioPack, design: Design): Evaluation {
  const path = transfer(pack, design.destination);
  const dryMass = dryMassKg(pack, design.array);
  const load = propellantLoadKg(pack, design.engine);
  const exhaust = exhaustSpeed(pack, design.engine);
  const startMass = dryMass + load;

  // R4 and R6: the whole load is carried from the start, so unused propellant counts as final mass.
  const used = (mass: number, deltaV: number) => mass * (1 - Math.exp((-deltaV * 1000) / exhaust));
  const burn1Propellant = used(startMass, path.burn1);
  const burn2Propellant = used(startMass - burn1Propellant, path.burn2);
  const propellantUsed = burn1Propellant + burn2Propellant;

  // R7: thrust comes from the power left after life support.
  const power = enginePowerKw(pack, design.array);
  const thrustN = (power * valueOf(pack, "thrust-per-kw")) / 1000;

  // R8 and R9: electric time comes from the burn, chemical time from the coast.
  const days =
    design.engine === "chemical" ? path.coastDays : (propellantUsed * exhaust) / thrustN / SECONDS_PER_DAY;

  const suppliesDays = valueOf(pack, "supplies-limit");
  const propellantLeft = load - propellantUsed;
  const failure: Failure = propellantLeft < 0 ? "propellant" : days > suppliesDays ? "supplies" : null;
  const onArrival = effectOf(pack, "destination", design.destination).onArrival;

  return {
    design,
    deltaV: path.deltaV,
    dryMass,
    startMass,
    load,
    burn1Propellant,
    burn2Propellant,
    propellantUsed,
    propellantLeft,
    enginePowerKw: power,
    thrustN,
    days,
    suppliesDays,
    failure,
    result: failure ? "infeasible" : onArrival,
  };
}

export const ALL_DESIGNS: readonly Design[] = (["low", "geosynchronous"] as const).flatMap((destination) =>
  (["chemical", "electric"] as const).flatMap((engine) =>
    (["small", "large"] as const).map((array) => ({ destination, engine, array })),
  ),
);

export type Choices = Partial<Design>;

/** The array already on the workshop until the player decides otherwise. */
export const FITTED_ARRAY: ArrayId = "small";

export interface Snapshot {
  massKg: number | null;
  powerKw: number;
  propellantLeftKg: number | null;
  days: number | null;
  deltaV: number | null;
}

/** What is known so far. Values stay null until the decisions they depend on have been made. */
export function snapshot(pack: ScenarioPack, choices: Choices): Snapshot {
  const array = choices.array ?? FITTED_ARRAY;
  const known = choices.destination && choices.engine ? evaluate(pack, { destination: choices.destination, engine: choices.engine, array }) : null;
  return {
    massKg: choices.engine ? dryMassKg(pack, array) + propellantLoadKg(pack, choices.engine) : null,
    powerKw: enginePowerKw(pack, array),
    propellantLeftKg: known ? known.propellantLeft : null,
    days: known ? known.days : null,
    deltaV: choices.destination ? transfer(pack, choices.destination).deltaV : null,
  };
}

export interface Checkpoint {
  id: "departure" | "crossing" | "arrival";
  propellantLeftKg: number;
  days: number;
  /** The failure first reached at this checkpoint, if any. */
  failure: Failure;
}

/** The three checkpoints of the simulation. The final checkpoint always matches evaluate(). */
export function simulate(pack: ScenarioPack, design: Design): Checkpoint[] {
  const final = evaluate(pack, design);
  const exhaust = exhaustSpeed(pack, design.engine);
  const burnDays = (propellant: number) =>
    design.engine === "chemical" ? 0 : (propellant * exhaust) / final.thrustN / SECONDS_PER_DAY;

  const afterBurn1 = final.load - final.burn1Propellant;
  const days1 = burnDays(final.burn1Propellant);
  const daysAtCrossing = design.engine === "chemical" ? final.days : days1;

  const failureAt = (left: number, days: number): Failure =>
    left < 0 ? "propellant" : days > final.suppliesDays ? "supplies" : null;

  const first = failureAt(afterBurn1, days1);
  const second = first ?? failureAt(afterBurn1, daysAtCrossing);
  return [
    { id: "departure", propellantLeftKg: afterBurn1, days: days1, failure: first },
    { id: "crossing", propellantLeftKg: afterBurn1, days: daysAtCrossing, failure: first ? null : second },
    { id: "arrival", propellantLeftKg: final.propellantLeft, days: final.days, failure: first || second ? null : final.failure },
  ];
}
