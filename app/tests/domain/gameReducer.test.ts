import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/app/gameReducer";
import { initialState, leadFor, rolesFor, type GameAction, type GameState } from "../../src/app/gameState";

const run = (actions: GameAction[], from: GameState = initialState) => actions.reduce(gameReducer, from);

const toDecisions: GameAction[] = [
  { type: "start" },
  { type: "finish-onboarding" },
  { type: "skip-opening" },
  { type: "skip-opening" },
  { type: "finish-diagnosis" },
];
const chooseAll: GameAction[] = ["low", "electric", "large"].flatMap((option) => [
  { type: "highlight", option } as GameAction,
  { type: "confirm" } as GameAction,
  { type: "continue" } as GameAction,
]);
const proposeAll: GameAction[] = ["low", "electric", "large"].flatMap((option) => [
  { type: "highlight", option } as GameAction,
  { type: "propose" } as GameAction,
  { type: "approve" } as GameAction,
  { type: "continue" } as GameAction,
]);
const simulateAll: GameAction[] = [{ type: "next-checkpoint" }, { type: "next-checkpoint" }, { type: "next-checkpoint" }];
const crewOf = (size: number): GameState => run([{ type: "set-mode", mode: "crew" }, { type: "set-crew-size", size }]);

describe("the solo mission", () => {
  it("runs the whole loop in order", () => {
    const state = run([...toDecisions, ...chooseAll, ...simulateAll]);
    expect(state.phase.name).toBe("review");
    expect(state.choices).toEqual({ destination: "low", engine: "electric", array: "large" });
    expect(state.log).toHaveLength(1);
  });

  it("asks for setup before the story", () => {
    expect(run([{ type: "start" }]).phase.name).toBe("onboarding");
    expect(run([{ type: "start" }, { type: "finish-onboarding" }]).phase).toEqual({ name: "opening", beat: 0 });
  });

  it("ignores confirm when nothing is highlighted", () => {
    const state = run([...toDecisions, { type: "confirm" }]);
    expect(state.phase).toEqual({ name: "decision", index: 0, stage: "choosing" });
    expect(state.choices).toEqual({});
  });

  it("ignores actions that do not belong to the phase", () => {
    expect(run([{ type: "confirm" }, { type: "retry" }, { type: "next-checkpoint" }, { type: "approve" }])).toEqual(initialState);
  });

  it("finishes early when a flight fails, and logs the design", () => {
    const state = run([...toDecisions, ...chooseAll, { type: "finish-simulation" }]);
    expect(state.phase.name).toBe("review");
    expect(state.log).toHaveLength(1);
  });

  it("retries from the first decision, without the opening, and remembers the last design", () => {
    const state = run([...toDecisions, ...chooseAll, ...simulateAll, { type: "retry" }]);
    expect(state.phase).toEqual({ name: "decision", index: 0, stage: "choosing" });
    expect(state.choices).toEqual({});
    expect(state.previous).toEqual({ destination: "low", engine: "electric", array: "large" });
    expect(state.log).toHaveLength(1);
  });

  it("restart clears the mission but keeps the player's profile", () => {
    const state = run([
      { type: "set-language", lang: "ar" },
      { type: "set-profile", profile: "explorer" },
      { type: "set-difficulty", difficulty: "systems" },
      { type: "update-member", index: 0, change: { callsign: "Nova" } },
      ...toDecisions,
      ...chooseAll,
      ...simulateAll,
      { type: "restart" },
    ]);
    expect(state.phase).toEqual({ name: "title" });
    expect(state.choices).toEqual({});
    expect(state.log).toEqual([]);
    expect(state).toMatchObject({ lang: "ar", profile: "explorer", difficulty: "systems" });
    expect(state.crew[0]?.callsign).toBe("Nova");
  });

  it("difficulty and profile do not change the design a player ends with", () => {
    const easy = run([{ type: "set-difficulty", difficulty: "guided" }, { type: "set-profile", profile: "explorer" }, ...toDecisions, ...chooseAll]);
    const hard = run([{ type: "set-difficulty", difficulty: "systems" }, { type: "set-profile", profile: "specialist" }, ...toDecisions, ...chooseAll]);
    expect(easy.choices).toEqual(hard.choices);
  });

  it("switching language mid-mission keeps the mission", () => {
    const before = run([...toDecisions, ...chooseAll.slice(0, 3)]);
    const after = gameReducer(before, { type: "set-language", lang: "ar" });
    expect(after).toEqual({ ...before, lang: "ar" });
  });
});

describe("crew mode", () => {
  it("does not apply a proposal until it is approved", () => {
    const start = run(toDecisions, crewOf(2));
    const proposed = run([{ type: "highlight", option: "low" }, { type: "propose" }], start);
    expect(proposed.phase).toEqual({ name: "decision", index: 0, stage: "proposed" });
    expect(proposed.choices).toEqual({});
    const approved = gameReducer(proposed, { type: "approve" });
    expect(approved.choices).toEqual({ destination: "low" });
    expect(approved.phase).toEqual({ name: "decision", index: 0, stage: "consequence" });
  });

  it("lets the crew change a proposal without spending anything", () => {
    const start = run([...toDecisions, { type: "highlight", option: "low" }, { type: "propose" }, { type: "revise" }], crewOf(3));
    expect(start.phase).toEqual({ name: "decision", index: 0, stage: "choosing" });
    expect(start.choices).toEqual({});
    expect(start.pulse).toBe(0);
  });

  it("cannot skip the proposal with solo confirm", () => {
    const state = run([...toDecisions, { type: "highlight", option: "low" }, { type: "confirm" }], crewOf(2));
    expect(state.choices).toEqual({});
  });

  it.each([2, 3, 4])("completes the whole mission with %i people", (size) => {
    const state = run([...toDecisions, ...proposeAll, ...simulateAll], crewOf(size));
    expect(state.phase.name).toBe("review");
    expect(state.crew).toHaveLength(size);
    expect(state.choices).toEqual({ destination: "low", engine: "electric", array: "large" });
  });

  it.each([2, 3, 4])("gives every role to someone with %i people", (size) => {
    expect(rolesFor(size).flat().sort()).toEqual(["director", "power", "propulsion", "science"]);
    expect(rolesFor(size)).toHaveLength(size);
  });

  it("gives each decision to the person holding its role", () => {
    expect(leadFor("engine", 4)).toEqual({ player: 1, role: "propulsion" });
    expect(leadFor("array", 4)).toEqual({ player: 2, role: "power" });
    expect(leadFor("destination", 4)).toEqual({ player: 3, role: "science" });
    expect(leadFor("array", 2)).toEqual({ player: 1, role: "power" });
  });

  it("keeps crew size between two and four", () => {
    expect(run([{ type: "set-crew-size", size: 9 }], crewOf(2)).crew).toHaveLength(4);
    expect(run([{ type: "set-crew-size", size: 1 }], crewOf(4)).crew).toHaveLength(2);
  });

  it("returning to solo keeps one player", () => {
    expect(run([{ type: "set-mode", mode: "solo" }], crewOf(4)).crew).toHaveLength(1);
  });
});
