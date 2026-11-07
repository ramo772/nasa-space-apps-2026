import rawScenario from "./scenarios/return-home-v1.json";
import rawSources from "./sources.json";
import { parseScenarioPack, sourceRecordSchema, type ScenarioPack, type SourceRecord } from "./scenario.schema";

/** Parses at startup, so invalid content fails at once instead of showing a wrong number later. */
export const SOURCES: readonly SourceRecord[] = rawSources.map((source) => sourceRecordSchema.parse(source));

const parsed = parseScenarioPack(rawScenario, SOURCES);
if (!parsed.success) throw new Error(`Invalid scenario pack: ${parsed.error.message}`);

export const SCENARIO: ScenarioPack = parsed.data;
