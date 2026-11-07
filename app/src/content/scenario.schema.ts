import { z } from "zod";

/**
 * Contract for scenario content. Every value must carry a unit, source, transformation and limitation,
 * and the engine reads values only through this validated shape.
 */

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);

export const classificationSchema = z.enum(["feasible", "partial", "infeasible"]);

/** Player results are calculated by the engine, so authored content cannot claim that label. */
export const authoredProvenanceSchema = z.enum(["nasa-source", "game-rule", "fiction"]);

export const sourceRecordSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("nasa"),
    id,
    title: text,
    provider: text,
    url: z.url(),
    accessedOn: z.iso.date(),
    fieldsUsed: z.array(text).min(1),
    originalUnits: z.array(text).min(1),
    transformation: text,
    limitations: text,
    license: text,
    /** "working-read" means an AI session read the terms. Only a person may record "confirmed". */
    licenseStatus: z.enum(["working-read", "confirmed"]),
  }),
  z.strictObject({
    kind: z.literal("team-fiction"),
    id,
    title: text,
    rationale: text,
    limitations: text,
  }),
]);

const valueSchema = z.strictObject({
  id,
  label: text,
  amount: z.number(),
  unit: text,
  provenance: authoredProvenanceSchema,
  sourceIds: z.array(id).min(1),
  transformation: text,
  limitation: text,
});

const effectSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("destination"), altitude: id, onArrival: z.enum(["feasible", "partial"]) }),
  z.strictObject({ type: z.literal("engine"), mode: z.enum(["chemical", "electric"]), isp: id, load: id }),
  z.strictObject({ type: z.literal("array"), power: id }),
]);

const packShape = z.strictObject({
  schemaVersion: z.literal(2),
  id,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  reviewStatus: z.enum(["owner-approved-mentor-review-pending", "reviewed"]),
  title: text,
  fictionalFraming: text,
  values: z.array(valueSchema).min(1),
  decisions: z
    .array(
      z.strictObject({
        id,
        options: z.array(z.strictObject({ id, effect: effectSchema })).min(2).max(3),
      }),
    )
    .length(3),
  limitations: z.array(text).min(1),
});

export type SourceRecord = z.infer<typeof sourceRecordSchema>;
export type ScenarioValue = z.infer<typeof valueSchema>;
export type ScenarioPack = z.infer<typeof packShape>;
export type Effect = z.infer<typeof effectSchema>;

/** The unit the rule engine expects for each value it reads directly. */
export const REQUIRED_UNITS: Readonly<Record<string, string>> = {
  "earth-gm": "km³/s²",
  "standard-gravity": "m/s²",
  "earth-radius": "km",
  "start-perigee": "km",
  "start-apogee": "km",
  "thrust-per-kw": "mN/kW",
  "array-specific-power": "W/kg",
  "dry-mass": "kg",
  "life-support": "kW",
  "supplies-limit": "days",
};

const EFFECT_UNITS = { altitude: "km", isp: "s", load: "kg", power: "kW" } as const;

export function parseScenarioPack(input: unknown, sources: readonly SourceRecord[]) {
  const sourceKinds = new Map(sources.map((source) => [source.id, source.kind]));

  return packShape
    .superRefine((pack, ctx) => {
      const fail = (message: string, path: PropertyKey[]) => ctx.addIssue({ code: "custom", message, path });
      const units = new Map(pack.values.map((value) => [value.id, value.unit]));

      const ids = pack.values.map((value) => value.id);
      for (const duplicate of new Set(ids.filter((value, index) => ids.indexOf(value) !== index))) {
        fail(`Duplicate value ID: ${duplicate}`, ["values"]);
      }

      pack.values.forEach((value, index) => {
        for (const sourceId of value.sourceIds) {
          const kind = sourceKinds.get(sourceId);
          const path = ["values", index, "sourceIds"];
          if (!kind) fail(`Unknown source ID: ${sourceId}`, path);
          else if (value.provenance === "nasa-source" && kind !== "nasa") fail(`NASA-labelled value cites a non-NASA source: ${sourceId}`, path);
          else if (value.provenance === "fiction" && kind !== "team-fiction") fail(`Fiction cites a NASA source: ${sourceId}`, path);
        }
      });

      for (const [valueId, unit] of Object.entries(REQUIRED_UNITS)) {
        if (units.get(valueId) !== unit) fail(`The engine needs ${valueId} in ${unit}`, ["values"]);
      }

      pack.decisions.forEach((decision, decisionIndex) =>
        decision.options.forEach((option, optionIndex) => {
          for (const [key, unit] of Object.entries(EFFECT_UNITS)) {
            const valueId = (option.effect as Record<string, unknown>)[key];
            if (typeof valueId !== "string") continue;
            const path = ["decisions", decisionIndex, "options", optionIndex, "effect"];
            if (!units.has(valueId)) fail(`Unknown value: ${valueId}`, path);
            else if (units.get(valueId) !== unit) fail(`${valueId} must be in ${unit}`, path);
          }
        }),
      );

      if (pack.decisions.map((decision) => decision.options[0]?.effect.type).join() !== "destination,engine,array") {
        fail("Decisions must run destination, engine, array", ["decisions"]);
      }
    })
    .safeParse(input);
}
