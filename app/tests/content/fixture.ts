import rawScenario from "../../src/content/scenarios/return-home-v1.json";
import rawSources from "../../src/content/sources.json";
import type { ScenarioPack, SourceRecord } from "../../src/content/scenario.schema";

export const testSources = rawSources as SourceRecord[];

/** A fresh, deep copy of the real pack, for each test to break in one way. */
export const makeTestPack = () => structuredClone(rawScenario) as ScenarioPack;
