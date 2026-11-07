import { describe, expect, it } from "vitest";
import { SCENARIO } from "../../src/content/scenario";
import { counterfactuals, review } from "../../src/domain/explain";
import { ALL_DESIGNS, evaluate, simulate, snapshot, transfer, type Design } from "../../src/domain/rules";

/** The approved table in docs/research/rule-table-draft.md. */
const TABLE: [Design["engine"], Design["array"], Design["destination"], number, number, number, string][] = [
  ["chemical", "small", "low", 25619, 381, 4.6, "feasible"],
  ["chemical", "small", "geosynchronous", 14029, 11971, 5.2, "partial"],
  ["chemical", "large", "low", 26411, -411, 4.6, "infeasible"],
  ["chemical", "large", "geosynchronous", 14463, 11537, 5.2, "partial"],
  ["electric", "small", "low", 2037, 963, 924.3, "infeasible"],
  ["electric", "small", "geosynchronous", 796, 2204, 361.1, "infeasible"],
  ["electric", "large", "low", 2255, 745, 146.2, "feasible"],
  ["electric", "large", "geosynchronous", 881, 2119, 57.1, "partial"],
];

describe("evaluate", () => {
  it.each(TABLE)("%s, %s array, to %s orbit matches the rule table", (engine, array, destination, used, left, days, result) => {
    const outcome = evaluate(SCENARIO, { engine, array, destination });
    expect(Math.round(outcome.propellantUsed)).toBe(used);
    expect(Math.round(outcome.propellantLeft)).toBe(left);
    expect(Number(outcome.days.toFixed(1))).toBe(days);
    expect(outcome.result).toBe(result);
  });

  it("covers all eight designs", () => {
    expect(ALL_DESIGNS).toHaveLength(TABLE.length);
  });

  it("gives the same answer every time", () => {
    for (const design of ALL_DESIGNS) {
      expect(evaluate(SCENARIO, design)).toEqual(evaluate(SCENARIO, design));
    }
  });

  it("reports why a design fails", () => {
    expect(evaluate(SCENARIO, { engine: "chemical", array: "large", destination: "low" }).failure).toBe("propellant");
    expect(evaluate(SCENARIO, { engine: "electric", array: "small", destination: "low" }).failure).toBe("supplies");
    expect(evaluate(SCENARIO, { engine: "electric", array: "large", destination: "low" }).failure).toBeNull();
  });

  it("never produces NaN or Infinity", () => {
    for (const design of ALL_DESIGNS) {
      for (const value of Object.values(evaluate(SCENARIO, design))) {
        if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
      }
    }
  });
});

describe("transfer", () => {
  it("matches the speed changes in the rule table", () => {
    expect(transfer(SCENARIO, "low").deltaV).toBeCloseTo(3.62, 2);
    expect(transfer(SCENARIO, "geosynchronous").deltaV).toBeCloseTo(1.31, 2);
  });
});

describe("no best option", () => {
  it.each(["destination", "engine", "array"] as const)("every %s option wins somewhere", (key) => {
    const rank = { infeasible: 0, partial: 1, feasible: 2 };
    const wins = new Set<string>();
    for (const design of ALL_DESIGNS) {
      const mine = rank[evaluate(SCENARIO, design).result];
      const flip = counterfactuals(SCENARIO, design).find((option) => option.key === key)!;
      if (mine > rank[flip.evaluation.result]) wins.add(design[key]);
    }
    expect(wins.size).toBe(2);
  });

  it("leaves two different routes home", () => {
    const home = ALL_DESIGNS.filter((design) => evaluate(SCENARIO, design).result === "feasible");
    expect(home.map((design) => design.engine).sort()).toEqual(["chemical", "electric"]);
  });
});

describe("simulate", () => {
  it.each(ALL_DESIGNS.map((design) => [design] as const))("ends where evaluate ends: %j", (design) => {
    const final = evaluate(SCENARIO, design);
    const points = simulate(SCENARIO, design);
    expect(points).toHaveLength(3);
    expect(points[2]!.propellantLeftKg).toBeCloseTo(final.propellantLeft, 6);
    expect(points[2]!.days).toBeCloseTo(final.days, 6);
  });

  it.each(ALL_DESIGNS.map((design) => [design] as const))("reports a failure at one point at most: %j", (design) => {
    const failures = simulate(SCENARIO, design).filter((point) => point.failure);
    expect(failures.length).toBe(evaluate(SCENARIO, design).failure ? 1 : 0);
  });
});

describe("snapshot", () => {
  it("keeps unknown values empty until their decisions are made", () => {
    expect(snapshot(SCENARIO, {})).toMatchObject({ massKg: null, propellantLeftKg: null, days: null, deltaV: null });
    expect(snapshot(SCENARIO, { destination: "low" }).deltaV).toBeCloseTo(3.62, 2);
  });

  it("uses the fitted small array until the player changes it", () => {
    const fitted = snapshot(SCENARIO, { destination: "low", engine: "electric" });
    expect(fitted.days).toBeCloseTo(evaluate(SCENARIO, { destination: "low", engine: "electric", array: "small" }).days, 6);
  });
});

describe("review", () => {
  it("names the single change that would rescue a failed design", () => {
    const outcome = review(SCENARIO, { destination: "low", engine: "chemical", array: "large" });
    expect(outcome.improvement?.evaluation.result).toBe("feasible");
    expect(outcome.improvement?.key).toBe("array");
  });

  it("names a decision the result depended on", () => {
    const outcome = review(SCENARIO, { destination: "low", engine: "electric", array: "large" });
    expect(outcome.strongest).not.toBeNull();
    expect(outcome.improvement).toBeNull();
    expect(outcome.otherRoutes).toEqual([{ destination: "low", engine: "chemical", array: "small" }]);
  });
});
