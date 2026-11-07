import { describe, expect, it } from "vitest";
import { parseScenarioPack, sourceRecordSchema, type ScenarioPack } from "../../src/content/scenario.schema";
import { makeTestPack, testSources } from "./fixture";

const parse = (change: (pack: ScenarioPack) => void) => {
  const pack = makeTestPack();
  change(pack);
  return parseScenarioPack(pack, testSources);
};
const messages = (result: ReturnType<typeof parseScenarioPack>) =>
  result.error?.issues.map((issue) => issue.message).join("\n") ?? "";
const nasaValue = (pack: ScenarioPack) => pack.values.find((value) => value.id === "earth-gm")!;
const fictionValue = (pack: ScenarioPack) => pack.values.find((value) => value.id === "dry-mass")!;

describe("the shipped scenario pack", () => {
  it("passes validation", () => {
    const result = parseScenarioPack(makeTestPack(), testSources);
    expect(messages(result)).toBe("");
    expect(result.success).toBe(true);
  });

  it("records that mentor review is still pending", () => {
    expect(makeTestPack().reviewStatus).toBe("owner-approved-mentor-review-pending");
  });
});

describe("parseScenarioPack", () => {
  it("rejects a value with no unit", () => {
    expect(parse((pack) => { nasaValue(pack).unit = " "; }).success).toBe(false);
  });

  it("rejects a value with no source", () => {
    expect(parse((pack) => { nasaValue(pack).sourceIds = []; }).success).toBe(false);
  });

  it("rejects a value with no transformation or limitation", () => {
    expect(parse((pack) => { nasaValue(pack).transformation = ""; }).success).toBe(false);
    expect(parse((pack) => { nasaValue(pack).limitation = ""; }).success).toBe(false);
  });

  it("rejects an unknown source ID", () => {
    expect(messages(parse((pack) => { nasaValue(pack).sourceIds = ["missing"]; }))).toContain("Unknown source ID");
  });

  it("rejects NASA-labelled content that cites a fiction record", () => {
    expect(messages(parse((pack) => { fictionValue(pack).provenance = "nasa-source"; }))).toContain("non-NASA source");
  });

  it("rejects fiction that cites a NASA record", () => {
    expect(messages(parse((pack) => { fictionValue(pack).sourceIds = ["data-015"]; }))).toContain("Fiction cites a NASA source");
  });

  it("rejects authored content that claims to be a player result", () => {
    const result = parse((pack) => { (nasaValue(pack) as { provenance: string }).provenance = "player-result"; });
    expect(result.success).toBe(false);
  });

  it("rejects a unit the engine cannot use", () => {
    expect(messages(parse((pack) => { fictionValue(pack).unit = "lb"; }))).toContain("The engine needs dry-mass in kg");
  });

  it("rejects an option that uses a value in the wrong unit", () => {
    const result = parse((pack) => { pack.values.find((value) => value.id === "array-small")!.unit = "W"; });
    expect(messages(result)).toContain("array-small must be in kW");
  });

  it("rejects an option that points to an unknown value", () => {
    const result = parse((pack) => {
      pack.decisions[2]!.options[0]!.effect = { type: "array", power: "missing" };
    });
    expect(messages(result)).toContain("Unknown value: missing");
  });

  it("rejects non-finite numbers", () => {
    expect(parse((pack) => { nasaValue(pack).amount = Number.NaN; }).success).toBe(false);
    expect(parse((pack) => { nasaValue(pack).amount = Number.POSITIVE_INFINITY; }).success).toBe(false);
  });

  it("rejects a decision with only one option", () => {
    expect(parse((pack) => { pack.decisions[0]!.options.pop(); }).success).toBe(false);
  });

  it("rejects duplicate value IDs", () => {
    expect(messages(parse((pack) => { pack.values[1]!.id = pack.values[0]!.id; }))).toContain("Duplicate value ID");
  });

  it("rejects unknown keys", () => {
    expect(parse((pack) => { (pack as unknown as Record<string, unknown>).score = 1; }).success).toBe(false);
  });
});

describe("sourceRecordSchema", () => {
  const source = testSources[0]!;

  it("rejects a NASA source whose licence has not been checked", () => {
    expect(sourceRecordSchema.safeParse({ ...source, licenseStatus: "not-checked" }).success).toBe(false);
  });

  it("rejects a NASA source with no URL", () => {
    expect(sourceRecordSchema.safeParse({ ...source, url: undefined }).success).toBe(false);
  });
});
