import type { Design, Snapshot } from "../domain/rules";
import type { TranslationKey } from "../i18n/en";
import type { I18n, Params } from "../i18n";

/**
 * The story's structure: who speaks, with which face, and which translation key they say.
 * All words live in src/i18n. Numbers are always passed in from the engine, so words and simulation agree.
 */

export type NadirFace = "confident" | "panic" | "disbelief" | "delighted" | "groan";
export type RivoFace = "neutral" | "curious" | "deadpan" | "warning" | "pride";

interface LineText {
  /** A translation key, or finished text that was already built for the player. */
  key?: TranslationKey;
  /** A key with one version for each learning profile. */
  profileKey?: string;
  text?: string;
  params?: Params;
  sound?: TranslationKey;
}

export type Line = LineText & ({ speaker: "nadir"; face: NadirFace } | { speaker: "rivo"; face: RivoFace });

export const OPENING: readonly Line[] = [
  { speaker: "rivo", face: "neutral", key: "story.opening1", sound: "story.opening1.sound" },
  { speaker: "nadir", face: "confident", key: "story.opening2" },
  { speaker: "rivo", face: "deadpan", key: "story.opening3", sound: "story.opening3.sound" },
  { speaker: "nadir", face: "delighted", key: "story.opening4" },
  { speaker: "rivo", face: "curious", key: "story.opening5", sound: "story.opening5.sound" },
];

/** The reveal: the room seems normal, until the shutters open on the Meat-a-roid. */
export const INCIDENT: readonly Line[] = [
  { speaker: "nadir", face: "groan", key: "story.incident1", sound: "story.incident1.sound" },
  { speaker: "nadir", face: "confident", key: "story.incident2", sound: "story.incident2.sound" },
  { speaker: "rivo", face: "neutral", key: "story.incident3" },
  { speaker: "rivo", face: "neutral", key: "story.incident4" },
  { speaker: "nadir", face: "disbelief", key: "story.incident5", sound: "story.incident5.sound" },
  { speaker: "rivo", face: "deadpan", key: "story.incident6" },
  { speaker: "nadir", face: "panic", key: "story.incident7" },
  { speaker: "rivo", face: "neutral", key: "story.incident8" },
  { speaker: "nadir", face: "delighted", key: "story.incident9" },
  { speaker: "rivo", face: "curious", profileKey: "story.incident10" },
];

export function consequenceText(
  decision: "destination" | "engine" | "array",
  design: Partial<Design>,
  now: Snapshot,
  addedMass: number,
  { tp, n }: I18n,
): string {
  const params: Params = {
    dv: now.deltaV === null ? "" : n.kms(now.deltaV),
    left: n.kg(now.propellantLeftKg ?? 0),
    time: n.days(now.days ?? 0),
    power: n.kw(now.powerKw),
    mass: n.kg(addedMass),
  };
  if (decision === "destination") {
    return tp(design.destination === "low" ? "result.dest.low" : "result.dest.geo", params);
  }
  if (decision === "engine") {
    return tp(design.engine === "chemical" ? "result.chem" : "result.elec", params);
  }
  if (design.array === "large") {
    if (design.engine === "electric") return tp("result.elecLarge", params);
    return tp((now.propellantLeftKg ?? 0) < 0 ? "result.chemLargeShort" : "result.chemLarge", params);
  }
  return tp(design.engine === "electric" ? "result.elecSmall" : "result.chemSmall", params);
}

export function nadirReaction(decision: "destination" | "engine" | "array", now: Snapshot, supplies: number): Line {
  if (decision === "destination") {
    return now.deltaV !== null && now.deltaV > 2
      ? { speaker: "nadir", face: "confident", key: "nadir.home" }
      : { speaker: "nadir", face: "disbelief", key: "nadir.park" };
  }
  if (now.propellantLeftKg !== null && now.propellantLeftKg < 0) {
    return { speaker: "nadir", face: "panic", key: "nadir.short" };
  }
  if (now.days !== null && now.days > supplies) {
    return { speaker: "nadir", face: "groan", key: "nadir.coffee", sound: "nadir.coffee.sound" };
  }
  return { speaker: "nadir", face: "delighted", key: decision === "engine" ? "nadir.solved" : "nadir.workshop" };
}
