import type { GameState } from "../app/gameState";
import { DECISION_ORDER } from "../app/gameState";
import type { Line, NadirFace, RivoFace } from "../content/script";
import { INCIDENT, nadirReaction, OPENING } from "../content/script";
import { SCENARIO } from "../content/scenario";
import { enginePowerKw, evaluate, FITTED_ARRAY, propellantLoadKg, simulate, snapshot, valueOf, type ArrayId, type Design, type DestinationId, type EngineId } from "../domain/rules";

export type Shot = "wide" | "table" | "window" | "engine" | "capsule" | "wake" | "review" | "reviewRtl";
export type Sector = "table" | "propulsion" | "spine" | "comms" | "storage" | "docking";

export interface StageState {
  shot: Shot;
  earth: "home" | "far" | "geo";
  mood: "calm" | "alert" | "dim" | "success";
  destination: DestinationId | null;
  engine: EngineId | null;
  array: ArrayId;
  /** Power reaching the engine, from 0 to 1. Drives the conduit, engine glow and table column. */
  powerLevel: number;
  /** Propellant load, from 0 to 1. Drives the size of the tank. */
  tankLevel: number;
  /** The propellant tank reacts when the engine says the load isn't enough. */
  tankAlarm: boolean;
  orbit: boolean;
  /** How far along the transfer the workshop is, from 0 to 1. */
  progress: number;
  burning: boolean;
  capsuleOpen: boolean;
  moduleWarning: boolean;
  /** The window shutters hide the view until the reveal. */
  shutters: boolean;
  /** The Meat-a-roid depot is outside the window. */
  depot: boolean;
  /** The sector the current decision belongs to. Its sign lights up. */
  sector: Sector | null;
  /** Every system is connected, so the integration lights come on in sequence. */
  integrated: boolean;
  /** Sector signs appear once the mission begins. */
  signs: boolean;
  /** The player's own character is in the room. */
  crewVisible: boolean;
  nadir: "table" | "window" | "bay" | "spine" | "capsule" | "hidden";
  nadirFace: NadirFace;
  nadirSpeaking: boolean;
  rivo: "title" | "review" | "table" | "tableRtl" | "window" | "engine" | "capsule";
  rivoFace: RivoFace;
  /** Counts applied choices, so the stage fires each one-off response exactly once. */
  pulse: number;
  shake: number;
  /** Moves the magnetic wrench along its slow escape across the room. */
  act: number;
}

const rivoFaceOf = (line: Line | undefined, fallback: RivoFace): RivoFace =>
  line?.speaker === "rivo" ? line.face : fallback;

/** His last line sets his face, and it stays there while RIVO answers. */
function nadirFromLines(lines: readonly Line[], beat: number): { nadirFace: NadirFace; nadirSpeaking: boolean } {
  for (let index = beat; index >= 0; index -= 1) {
    const line = lines[index];
    if (line?.speaker === "nadir") return { nadirFace: line.face, nadirSpeaking: index === beat };
  }
  return { nadirFace: "confident", nadirSpeaking: false };
}

const maxPower = enginePowerKw(SCENARIO, "large");
const maxLoad = propellantLoadKg(SCENARIO, "chemical");

/** The beat of the reveal when the shutters open and the depot is seen. */
export const REVEAL_BEAT = 4;

export function stageFor(state: GameState): StageState {
  const { phase, choices } = state;
  const rtl = state.lang === "ar";
  const shown = {
    destination: choices.destination ?? (phase.name === "decision" && phase.index === 0 ? (state.pending as DestinationId | null) : null),
    engine: choices.engine ?? (phase.name === "decision" && phase.index === 1 ? (state.pending as EngineId | null) : null),
    array: choices.array ?? (phase.name === "decision" && phase.index === 2 && state.pending ? (state.pending as ArrayId) : FITTED_ARRAY),
  };
  const preview = shown.destination && shown.engine ? evaluate(SCENARIO, { destination: shown.destination, engine: shown.engine, array: shown.array }) : null;

  const base: StageState = {
    shot: "wide",
    earth: "far",
    mood: "calm",
    destination: shown.destination,
    engine: shown.engine,
    array: shown.array,
    powerLevel: enginePowerKw(SCENARIO, shown.array) / maxPower,
    tankLevel: shown.engine ? propellantLoadKg(SCENARIO, shown.engine) / maxLoad : 0,
    tankAlarm: Boolean(preview && preview.propellantLeft < 0),
    orbit: false,
    progress: 0,
    burning: false,
    capsuleOpen: false,
    moduleWarning: true,
    shutters: false,
    depot: true,
    sector: null,
    integrated: false,
    signs: true,
    crewVisible: true,
    nadir: "table",
    nadirFace: "confident",
    nadirSpeaking: false,
    rivo: "table",
    rivoFace: "neutral",
    pulse: state.pulse,
    shake: 0,
    act: 0,
  };

  switch (phase.name) {
    case "title":
      return { ...base, earth: "home", moduleWarning: false, rivo: "title", depot: false, crewVisible: false, signs: false };

    case "onboarding":
      return { ...base, earth: "home", moduleWarning: false, rivo: "title", rivoFace: "curious", depot: false, crewVisible: false, signs: false };

    case "opening": {
      const line = OPENING[phase.beat];
      return {
        ...base,
        earth: "home",
        depot: false,
        crewVisible: false,
        signs: false,
        moduleWarning: phase.beat >= 2,
        shot: phase.beat === 2 ? "engine" : phase.beat >= 3 ? "capsule" : "wide",
        nadir: phase.beat === 4 ? "hidden" : phase.beat === 3 ? "capsule" : "table",
        rivo: phase.beat >= 3 ? "capsule" : "table",
        capsuleOpen: phase.beat === 3,
        rivoFace: rivoFaceOf(line, "neutral"),
        ...nadirFromLines(OPENING, phase.beat),
      };
    }

    case "incident": {
      const line = INCIDENT[phase.beat];
      const revealed = phase.beat >= REVEAL_BEAT;
      const last = phase.beat === INCIDENT.length - 1;
      return {
        ...base,
        act: phase.beat === 0 ? 0 : 1,
        // The room looks almost normal, until the shutters open and the camera moves to the window.
        shutters: !revealed,
        signs: false,
        shot: last ? "table" : revealed ? "window" : phase.beat === 0 ? "capsule" : "wake",
        orbit: last,
        crewVisible: last,
        capsuleOpen: true,
        nadir: phase.beat === 0 ? "capsule" : revealed && !last ? "window" : "table",
        rivo: last ? "table" : revealed ? "window" : "capsule",
        rivoFace: rivoFaceOf(line, "deadpan"),
        ...nadirFromLines(INCIDENT, phase.beat),
        shake: phase.beat === REVEAL_BEAT ? 0.4 : 0,
      };
    }

    case "diagnosis":
      return { ...base, act: 1, shot: "table", orbit: true, rivoFace: "curious", nadirFace: "disbelief", sector: "table" };

    case "decision": {
      const key = DECISION_ORDER[phase.index];
      const choosing = phase.stage !== "consequence";
      // After each decision, his face and body follow what the engine just calculated.
      const reaction = !choosing && key ? nadirReaction(key, snapshot(SCENARIO, choices), valueOf(SCENARIO, "supplies-limit")) : null;
      return {
        ...base,
        act: 1 + phase.index,
        shot: key === "array" ? "window" : key === "engine" ? "engine" : "table",
        orbit: true,
        sector: key === "array" ? "spine" : key === "engine" ? "propulsion" : "table",
        // Dr. Nadir and RIVO walk to the part of the depot the player is deciding about.
        nadir: key === "engine" ? "bay" : key === "array" ? "spine" : "table",
        rivo: key === "array" ? "window" : key === "engine" ? "engine" : rtl ? "tableRtl" : "table",
        rivoFace: choosing ? "curious" : "pride",
        nadirFace: reaction?.speaker === "nadir" ? reaction.face : "confident",
        nadirSpeaking: Boolean(reaction),
        shake: choosing ? 0 : 0.14,
      };
    }

    case "simulation": {
      const design = choices as Design;
      const points = simulate(SCENARIO, design);
      const failed = points.findIndex((point) => point.failure);
      const reached = failed === -1 ? phase.checkpoint : Math.min(phase.checkpoint, failed);
      const stopped = failed !== -1 && phase.checkpoint >= failed;
      const finished = phase.checkpoint === 2 && !stopped;
      const earth = finished ? (design.destination === "low" ? "home" : "geo") : "far";
      return {
        ...base,
        act: 4,
        shot: "table",
        rivo: rtl ? "tableRtl" : "table",
        orbit: true,
        progress: finished ? 1 : (reached + 0.5) / 3,
        burning: !stopped && phase.checkpoint !== 1,
        rivoFace: stopped ? "warning" : "curious",
        nadirFace: stopped ? "panic" : finished ? "delighted" : "confident",
        earth,
        depot: earth === "far",
        mood: stopped ? "dim" : "calm",
        shake: stopped ? 0.3 : 0.2,
      };
    }

    case "review": {
      const outcome = evaluate(SCENARIO, choices as Design);
      const earth = outcome.result === "feasible" ? "home" : outcome.result === "partial" ? "geo" : "far";
      return {
        ...base,
        act: 5,
        shot: rtl ? "reviewRtl" : "review",
        rivo: "review",
        orbit: false,
        progress: outcome.failure ? 0.5 : 1,
        earth,
        depot: earth === "far",
        integrated: outcome.result === "feasible",
        mood: outcome.result === "feasible" ? "success" : outcome.result === "infeasible" ? "dim" : "calm",
        rivoFace: outcome.result === "infeasible" ? "neutral" : "pride",
        nadirFace: outcome.result === "feasible" ? "delighted" : outcome.result === "partial" ? "confident" : "groan",
      };
    }
  }
}
