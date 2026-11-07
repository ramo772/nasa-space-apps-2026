import { describe, expect, it } from "vitest";
import { steerAround, TABLE_CLEARANCE } from "../../src/visual/walkPath";

const SPOTS: Record<string, [number, number]> = {
  table: [-4.2, 2.1],
  window: [-3.6, -1.6],
  bay: [3.9, -0.3],
  spine: [3.2, -2.4],
  capsule: [6.4, 2.9],
};

function walk(from: [number, number], to: [number, number]) {
  let [x, z] = from;
  let closest = Math.hypot(x, z);
  for (let frame = 0; frame < 2000; frame += 1) {
    const [aimX, aimZ] = steerAround(x, z, to[0], to[1]);
    const distance = Math.hypot(aimX - x, aimZ - z);
    if (Math.hypot(to[0] - x, to[1] - z) < 0.02) return { arrived: true, closest };
    const step = Math.min(distance, 0.05);
    x += ((aimX - x) / distance) * step;
    z += ((aimZ - z) / distance) * step;
    closest = Math.min(closest, Math.hypot(x, z));
  }
  return { arrived: false, closest };
}

describe("walking around the mission table", () => {
  const names = Object.keys(SPOTS);
  const pairs = names.flatMap((from) => names.filter((to) => to !== from).map((to) => [from, to] as const));

  it.each(pairs)("from %s to %s never crosses the table, and arrives", (from, to) => {
    const result = walk(SPOTS[from]!, SPOTS[to]!);
    expect(result.arrived).toBe(true);
    expect(result.closest).toBeGreaterThan(TABLE_CLEARANCE - 0.3);
  });

  it("goes straight when nothing is in the way", () => {
    expect(steerAround(6, 3, 6, 5)).toEqual([6, 5]);
  });
});
