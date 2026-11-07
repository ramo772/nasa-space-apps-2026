import type { Design } from "../domain/rules";
import { DECISION_ORDER, initialState, makeMember, type GameAction, type GameState } from "./gameState";

export const CHECKPOINTS = 3;

const complete = (state: GameState): Design | null => {
  const { destination, engine, array } = state.choices;
  return destination && engine && array ? { destination, engine, array } : null;
};

const applyPending = (state: GameState): GameState => {
  const { phase } = state;
  if (phase.name !== "decision" || !state.pending) return state;
  const key = DECISION_ORDER[phase.index];
  if (!key) return state;
  return {
    ...state,
    choices: { ...state.choices, [key]: state.pending },
    pending: null,
    pulse: state.pulse + 1,
    phase: { ...phase, stage: "consequence" },
  };
};

const finish = (state: GameState): GameState => {
  const design = complete(state);
  return design ? { ...state, phase: { name: "review" }, log: [...state.log, design] } : state;
};

/** Every transition is explicit: anything not listed for a phase leaves the state unchanged. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const { phase } = state;

  switch (action.type) {
    case "start":
      return phase.name === "title" ? { ...state, phase: { name: "onboarding" } } : state;

    case "finish-onboarding":
      return phase.name === "onboarding" ? { ...state, phase: { name: "opening", beat: 0 } } : state;

    case "next-beat":
      if (phase.name === "opening") {
        return phase.beat + 1 < action.total
          ? { ...state, phase: { name: "opening", beat: phase.beat + 1 } }
          : { ...state, phase: { name: "incident", beat: 0 } };
      }
      if (phase.name === "incident") {
        return phase.beat + 1 < action.total
          ? { ...state, phase: { name: "incident", beat: phase.beat + 1 } }
          : { ...state, phase: { name: "diagnosis" } };
      }
      return state;

    case "skip-opening":
      if (phase.name === "opening") return { ...state, phase: { name: "incident", beat: 0 } };
      if (phase.name === "incident") return { ...state, phase: { name: "diagnosis" } };
      return state;

    // Language can change at any moment, and never touches the mission.
    case "set-language":
      return { ...state, lang: action.lang };

    case "set-profile":
      return { ...state, profile: action.profile };

    case "set-difficulty":
      return { ...state, difficulty: action.difficulty };

    case "set-mode":
      return {
        ...state,
        mode: action.mode,
        crew: action.mode === "solo" ? state.crew.slice(0, 1) : state.crew.length >= 2 ? state.crew : [state.crew[0] ?? makeMember(0), makeMember(1)],
      };

    case "set-crew-size": {
      const size = Math.min(4, Math.max(2, action.size));
      return { ...state, crew: Array.from({ length: size }, (_, index) => state.crew[index] ?? makeMember(index)) };
    }

    case "update-member":
      return { ...state, crew: state.crew.map((member, index) => (index === action.index ? { ...member, ...action.change } : member)) };

    case "set-rivo-callsign":
      return { ...state, rivoCallsign: action.callsign };

    case "finish-diagnosis":
      return phase.name === "diagnosis"
        ? { ...state, phase: { name: "decision", index: 0, stage: "choosing" }, pending: null }
        : state;

    case "highlight":
      return phase.name === "decision" && phase.stage === "choosing" ? { ...state, pending: action.option } : state;

    // Solo: one person confirms and the choice applies.
    case "confirm":
      return state.mode === "solo" && phase.name === "decision" && phase.stage === "choosing" ? applyPending(state) : state;

    // Crew: nothing is spent until the Mission Director approves the proposal.
    case "propose":
      return state.mode === "crew" && phase.name === "decision" && phase.stage === "choosing" && state.pending
        ? { ...state, phase: { ...phase, stage: "proposed" } }
        : state;

    case "approve":
      return phase.name === "decision" && phase.stage === "proposed" ? applyPending(state) : state;

    case "revise":
      return phase.name === "decision" && phase.stage === "proposed" ? { ...state, phase: { ...phase, stage: "choosing" } } : state;

    case "continue":
      if (phase.name !== "decision" || phase.stage !== "consequence") return state;
      return phase.index + 1 < DECISION_ORDER.length
        ? { ...state, phase: { name: "decision", index: phase.index + 1, stage: "choosing" } }
        : { ...state, phase: { name: "simulation", checkpoint: 0 }, pulse: state.pulse + 1 };

    case "next-checkpoint":
      if (phase.name !== "simulation") return state;
      return phase.checkpoint + 1 < CHECKPOINTS
        ? { ...state, phase: { name: "simulation", checkpoint: phase.checkpoint + 1 }, pulse: state.pulse + 1 }
        : finish(state);

    case "finish-simulation":
      return phase.name === "simulation" ? finish(state) : state;

    case "retry":
      if (phase.name !== "review") return state;
      return {
        ...state,
        previous: complete(state),
        choices: {},
        pending: null,
        phase: { name: "decision", index: 0, stage: "choosing" },
      };

    case "restart":
      return {
        ...initialState,
        lang: state.lang,
        profile: state.profile,
        difficulty: state.difficulty,
        mode: state.mode,
        crew: state.crew,
        rivoCallsign: state.rivoCallsign,
      };
  }
}
