import type { ScenarioPack } from "../content/scenario.schema";
import { ALL_DESIGNS, arrayKw, arrayMassKg, evaluate, FITTED_ARRAY, transfer, valueOf, type Classification, type Design, type Evaluation } from "./rules";

const RANK: Record<Classification, number> = { infeasible: 0, partial: 1, feasible: 2 };
const KEYS = ["destination", "engine", "array"] as const;
export type DecisionKey = (typeof KEYS)[number];

const OPTIONS: Record<DecisionKey, readonly string[]> = {
  destination: ["low", "geosynchronous"],
  engine: ["chemical", "electric"],
  array: ["small", "large"],
};

const flipped = (design: Design, key: DecisionKey): Design => {
  const other = OPTIONS[key].find((option) => option !== design[key]);
  return { ...design, [key]: other } as Design;
};

export interface Counterfactual {
  key: DecisionKey;
  design: Design;
  evaluation: Evaluation;
}

/** What each single change would have done. These come from the engine, not hand-written claims. */
export function counterfactuals(pack: ScenarioPack, design: Design): Counterfactual[] {
  return KEYS.map((key) => {
    const changed = flipped(design, key);
    return { key, design: changed, evaluation: evaluate(pack, changed) };
  });
}

/** The worked numbers for Systems mode. Always computed by the engine, never typed by hand. */
export function calculationLines(pack: ScenarioPack, decision: DecisionKey, design: Partial<Design>): string[] {
  const array = design.array ?? FITTED_ARRAY;
  if (decision === "destination" && design.destination) {
    const path = transfer(pack, design.destination);
    return [`Δv = burn 1 + burn 2 = ${path.burn1.toFixed(2)} + ${path.burn2.toFixed(2)} = ${path.deltaV.toFixed(2)} km/s`];
  }
  if (!design.destination || !design.engine) return [];
  const outcome = evaluate(pack, { destination: design.destination, engine: design.engine, array });
  const isp = valueOf(pack, design.engine === "chemical" ? "chemical-isp" : "electric-isp");
  const g0 = valueOf(pack, "standard-gravity");
  const ratio = Math.exp((outcome.deltaV * 1000) / (isp * g0));
  const lines = [
    `Mass ratio = e^(${Math.round(outcome.deltaV * 1000).toLocaleString("en-US")} m/s ÷ (${isp.toLocaleString("en-US")} s × ${g0} m/s²)) = ${ratio.toFixed(3)}`,
    `Propellant used = ${Math.round(outcome.startMass).toLocaleString("en-US")} kg × (1 − 1 ÷ ${ratio.toFixed(3)}) = ${Math.round(outcome.propellantUsed).toLocaleString("en-US")} kg`,
  ];
  if (design.engine === "electric") {
    lines.push(`Thrust = ${outcome.enginePowerKw} kW × ${valueOf(pack, "thrust-per-kw")} mN/kW = ${outcome.thrustN.toFixed(3)} N`);
    lines.push(`Time = propellant × Isp × g₀ ÷ thrust = ${outcome.days.toFixed(1)} days`);
  }
  if (decision === "array") {
    lines.unshift(`Array mass = ${arrayKw(pack, array)} kW ÷ ${valueOf(pack, "array-specific-power")} W/kg = ${Math.round(arrayMassKg(pack, array)).toLocaleString("en-US")} kg`);
  }
  return lines;
}

export interface Review {
  evaluation: Evaluation;
  /** A decision that, if changed alone, would make the result worse. */
  strongest: Counterfactual | null;
  /** A single change that would make the result better. */
  improvement: Counterfactual | null;
  /** The other designs that reach the same result. */
  otherRoutes: Design[];
}

export function review(pack: ScenarioPack, design: Design): Review {
  const evaluation = evaluate(pack, design);
  const options = counterfactuals(pack, design);
  const rank = RANK[evaluation.result];
  const same = (a: Design, b: Design) => KEYS.every((key) => a[key] === b[key]);
  return {
    evaluation,
    strongest: options.find((option) => RANK[option.evaluation.result] < rank) ?? null,
    improvement:
      // On a tie, suggest the latest decision: it changes the least of the player's design.
      [...options]
        .reverse()
        .filter((option) => RANK[option.evaluation.result] > rank)
        .sort((a, b) => RANK[b.evaluation.result] - RANK[a.evaluation.result])[0] ?? null,
    otherRoutes: ALL_DESIGNS.filter(
      (other) => !same(other, design) && evaluate(pack, other).result === evaluation.result,
    ),
  };
}
