import type { Choices, Design } from "../domain/rules";
import type { Lang } from "../i18n";

export type Profile = "explorer" | "student" | "specialist";
export type Difficulty = "guided" | "standard" | "systems";
export type PlayMode = "solo" | "crew";
export type Accent = "cyan" | "orange" | "green" | "coral" | "cream";
export type Role = "director" | "propulsion" | "power" | "science";

export const DECISION_ORDER = ["destination", "engine", "array"] as const;
export type DecisionId = (typeof DECISION_ORDER)[number];

export interface CrewMember {
  avatar: number;
  accent: Accent;
  callsign: string;
}

export type DecisionStage = "choosing" | "proposed" | "consequence";

export type Phase =
  | { name: "title" }
  | { name: "onboarding" }
  | { name: "opening"; beat: number }
  | { name: "incident"; beat: number }
  | { name: "diagnosis" }
  | { name: "decision"; index: number; stage: DecisionStage }
  | { name: "simulation"; checkpoint: number }
  | { name: "review" };

export interface GameState {
  phase: Phase;
  lang: Lang;
  profile: Profile;
  difficulty: Difficulty;
  mode: PlayMode;
  /** One member in solo, two to four in crew mode. Stored only on this device. */
  crew: CrewMember[];
  rivoCallsign: string;
  choices: Choices;
  /** The option highlighted or proposed, not yet applied to the mission. */
  pending: string | null;
  /** The design from the previous run, shown during a retry. */
  previous: Design | null;
  /** Every design completed this session. Kept in memory only. */
  log: Design[];
  /** Counts applied choices, so the stage can fire a one-off response. */
  pulse: number;
}

export type GameAction =
  | { type: "start" }
  | { type: "next-beat"; total: number }
  | { type: "skip-opening" }
  | { type: "set-language"; lang: Lang }
  | { type: "set-profile"; profile: Profile }
  | { type: "set-difficulty"; difficulty: Difficulty }
  | { type: "set-mode"; mode: PlayMode }
  | { type: "set-crew-size"; size: number }
  | { type: "update-member"; index: number; change: Partial<CrewMember> }
  | { type: "set-rivo-callsign"; callsign: string }
  | { type: "finish-onboarding" }
  | { type: "finish-diagnosis" }
  | { type: "highlight"; option: string }
  | { type: "confirm" }
  | { type: "propose" }
  | { type: "approve" }
  | { type: "revise" }
  | { type: "continue" }
  | { type: "next-checkpoint" }
  | { type: "finish-simulation" }
  | { type: "retry" }
  | { type: "restart" };

const DEFAULT_ACCENTS: readonly Accent[] = ["cyan", "orange", "green", "coral"];

export const makeMember = (index: number): CrewMember => ({
  avatar: index,
  accent: DEFAULT_ACCENTS[index] ?? "cyan",
  callsign: "",
});

export const initialState: GameState = {
  phase: { name: "title" },
  lang: "en",
  profile: "student",
  difficulty: "guided",
  mode: "solo",
  crew: [makeMember(0)],
  rivoCallsign: "",
  choices: {},
  pending: null,
  previous: null,
  log: [],
  pulse: 0,
};

/** The roles each person holds. With fewer people, one person holds more than one role. */
export function rolesFor(size: number): Role[][] {
  if (size >= 4) return [["director"], ["propulsion"], ["power"], ["science"]];
  if (size === 3) return [["director", "science"], ["propulsion"], ["power"]];
  return [["director", "science"], ["propulsion", "power"]];
}

const LEAD_ROLE: Record<DecisionId, Role> = { destination: "science", engine: "propulsion", array: "power" };

/** Who proposes each decision. The Mission Director always gives the final approval. */
export function leadFor(decision: DecisionId, size: number): { player: number; role: Role } {
  const role = LEAD_ROLE[decision];
  return { player: Math.max(0, rolesFor(size).findIndex((roles) => roles.includes(role))), role };
}
