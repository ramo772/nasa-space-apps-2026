import { describe, expect, it } from "vitest";
import { initialState, type GameState } from "../../src/app/gameState";
import { evaluate } from "../../src/domain/rules";
import { SCENARIO } from "../../src/content/scenario";
import { stageFor } from "../../src/visual/stageState";

const during = (change: Partial<GameState>): GameState => ({ ...initialState, ...change });

describe("Nadir's emotion", () => {
  const home = { destination: "low", engine: "chemical", array: "small" } as const;

  it("follows his lines in the story, and stays while RIVO answers", () => {
    const panicked = stageFor(during({ phase: { name: "incident", beat: 6 } }));
    const answered = stageFor(during({ phase: { name: "incident", beat: 7 } }));
    expect(panicked.nadirFace).toBe("panic");
    expect(panicked.nadirSpeaking).toBe(true);
    expect(answered.nadirFace).toBe("panic");
    expect(answered.nadirSpeaking).toBe(false);
  });

  it("panics when the engine says the design runs out of propellant", () => {
    const stage = stageFor(during({ phase: { name: "decision", index: 2, stage: "consequence" }, choices: { ...home, array: "large" } }));
    expect(stage.nadirFace).toBe("panic");
  });

  it("groans when the supplies won't last", () => {
    const stage = stageFor(during({ phase: { name: "decision", index: 1, stage: "consequence" }, choices: { destination: "low", engine: "electric" } }));
    expect(stage.nadirFace).toBe("groan");
  });

  it("matches the mission result at the review", () => {
    expect(stageFor(during({ phase: { name: "review" }, choices: home })).nadirFace).toBe("delighted");
    expect(stageFor(during({ phase: { name: "review" }, choices: { ...home, array: "large" } })).nadirFace).toBe("groan");
  });
});

describe("the Meat-a-roid", () => {
  it("is hidden behind shutters until the reveal", () => {
    expect(stageFor(during({ phase: { name: "incident", beat: 3 } })).shutters).toBe(true);
    const revealed = stageFor(during({ phase: { name: "incident", beat: 4 } }));
    expect(revealed.shutters).toBe(false);
    expect(revealed.shot).toBe("window");
    expect(revealed.depot).toBe(true);
  });

  it("isn't there before the accident, or after getting home", () => {
    expect(stageFor(during({ phase: { name: "opening", beat: 0 } })).depot).toBe(false);
    const home = { destination: "low", engine: "chemical", array: "small" } as const;
    expect(stageFor(during({ phase: { name: "review" }, choices: home })).depot).toBe(false);
  });

  it("lights the sector each decision belongs to, and walks Dr. Nadir there", () => {
    const engine = stageFor(during({ phase: { name: "decision", index: 1, stage: "choosing" } }));
    expect(engine.sector).toBe("propulsion");
    expect(engine.nadir).toBe("bay");
    const array = stageFor(during({ phase: { name: "decision", index: 2, stage: "choosing" } }));
    expect(array.sector).toBe("spine");
    expect(array.nadir).toBe("spine");
  });

  it("alarms the tank when the load isn't enough", () => {
    const stage = stageFor(during({ phase: { name: "decision", index: 2, stage: "consequence" }, choices: { destination: "low", engine: "chemical", array: "large" } }));
    expect(stage.tankAlarm).toBe(true);
  });

  it("lights every system in sequence on a feasible result only", () => {
    const home = { destination: "low", engine: "chemical", array: "small" } as const;
    expect(stageFor(during({ phase: { name: "review" }, choices: home })).integrated).toBe(true);
    expect(stageFor(during({ phase: { name: "review" }, choices: { ...home, array: "large" } })).integrated).toBe(false);
  });

  it("puts the player's character in the room once the mission begins", () => {
    expect(stageFor(during({ phase: { name: "title" } })).crewVisible).toBe(false);
    expect(stageFor(during({ phase: { name: "diagnosis" } })).crewVisible).toBe(true);
  });
});

describe("stageFor", () => {
  it("shows Earth at the wrong scale after the incident", () => {
    expect(stageFor(during({ phase: { name: "title" } })).earth).toBe("home");
    expect(stageFor(during({ phase: { name: "incident", beat: 1 } })).earth).toBe("far");
  });

  it("previews a highlighted option in the workshop", () => {
    const stage = stageFor(during({ phase: { name: "decision", index: 2, stage: "choosing" }, pending: "large", choices: { destination: "low", engine: "electric" } }));
    expect(stage.array).toBe("large");
  });

  it("gives the large array a much stronger power signal", () => {
    const small = stageFor(during({ phase: { name: "decision", index: 2, stage: "consequence" }, choices: { array: "small" } }));
    const large = stageFor(during({ phase: { name: "decision", index: 2, stage: "consequence" }, choices: { array: "large" } }));
    expect(large.powerLevel).toBe(1);
    expect(large.powerLevel / small.powerLevel).toBeCloseTo(7, 5);
  });

  it("makes the tank visibly match the propellant load", () => {
    const chemical = stageFor(during({ phase: { name: "decision", index: 1, stage: "consequence" }, choices: { engine: "chemical" } }));
    const electric = stageFor(during({ phase: { name: "decision", index: 1, stage: "consequence" }, choices: { engine: "electric" } }));
    expect(chemical.tankLevel).toBeGreaterThan(electric.tankLevel * 8);
  });

  it("returns Earth to the size the engine's result earned", () => {
    const home = { destination: "low", engine: "chemical", array: "small" } as const;
    const stuck = { destination: "low", engine: "chemical", array: "large" } as const;
    expect(evaluate(SCENARIO, home).result).toBe("feasible");
    expect(stageFor(during({ phase: { name: "review" }, choices: home })).earth).toBe("home");
    expect(stageFor(during({ phase: { name: "review" }, choices: stuck })).earth).toBe("far");
    expect(stageFor(during({ phase: { name: "review" }, choices: { ...home, destination: "geosynchronous" } })).earth).toBe("geo");
  });

  it("moves through the flight and stops where a design fails", () => {
    const stuck = { destination: "low", engine: "chemical", array: "large" } as const;
    const first = stageFor(during({ phase: { name: "simulation", checkpoint: 0 }, choices: stuck }));
    const last = stageFor(during({ phase: { name: "simulation", checkpoint: 2 }, choices: stuck }));
    expect(last.progress).toBeGreaterThan(first.progress);
    expect(last.progress).toBeLessThan(1);
    expect(last.mood).toBe("dim");
  });
});
