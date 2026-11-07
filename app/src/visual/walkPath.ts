/** The mission table sits at the middle of the room. Anyone walking must go around it. */
export const TABLE_CLEARANCE = 3.75;

const ARC_STEP = 0.35; // radians looked ahead along the table's edge

/** Closest distance from the origin to the straight line between two floor points. */
function clearance(ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSquared = dx * dx + dz * dz;
  const along = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + az * dz) / lengthSquared));
  return Math.hypot(ax + dx * along, az + dz * along);
}

/**
 * Where to head next on the way to a goal. Straight there if the way is clear,
 * otherwise along the table's edge, taking the shorter way around.
 */
export function steerAround(x: number, z: number, goalX: number, goalZ: number): [number, number] {
  if (clearance(x, z, goalX, goalZ) >= TABLE_CLEARANCE - 0.01) return [goalX, goalZ];
  const angle = Math.atan2(z, x);
  const goalAngle = Math.atan2(goalZ, goalX);
  const difference = Math.atan2(Math.sin(goalAngle - angle), Math.cos(goalAngle - angle));
  const next = angle + Math.sign(difference || 1) * Math.min(Math.abs(difference), ARC_STEP);
  // Heading for a point further along the edge always cuts inward. This radius makes that settle at the clearance.
  const radius = (TABLE_CLEARANCE + 0.1) / Math.cos(ARC_STEP);
  return [Math.cos(next) * radius, Math.sin(next) * radius];
}
