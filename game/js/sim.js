// One movement frame for the walkable base.
// Three.js local forward is -Z. rotation.y > 0 turns counter-clockwise from above.
// yaw 0 faces world (0, -1). yaw +PI/2 faces (-1, 0).
// Camera-right is forward × up = (-fwd.z, 0, fwd.x). At yaw 0 that is (1, 0).

export const PLAYER_RADIUS = 0.42;
export const ISLAND_RADIUS = 18;
export const WALK_SPEED = 5.6;
export const SPRINT_SPEED = 8.6;
export const INTERACT_RANGE = 1.5;

export const SPAWN = Object.freeze({ x: 0, z: 11, yaw: 0 });

export const ROCKET = Object.freeze({ x: 0, z: -10, r: 1.05 });

// Collision boxes. Visual walls in scene.js are built from this same list.
export const WALLS = Object.freeze([
  { name: "hangar-west", minX: -7.6, maxX: -7.0, minZ: -14.6, maxZ: -2.5 },
  { name: "hangar-east", minX: 7.0, maxX: 7.6, minZ: -14.6, maxZ: -2.5 },
  { name: "hangar-north", minX: -7.6, maxX: 7.6, minZ: -14.6, maxZ: -14.0 },
  { name: "hangar-south-l", minX: -7.6, maxX: -1.7, minZ: -3.05, maxZ: -2.5 },
  { name: "hangar-south-r", minX: 1.7, maxX: 7.6, minZ: -3.05, maxZ: -2.5 },
  { name: "habitat", minX: 8.2, maxX: 12.6, minZ: 3.4, maxZ: 7.8 },
  { name: "crates", minX: -11.2, maxX: -8.6, minZ: 5.6, maxZ: 8.0 },
]);

export const GOAL_PADS = Object.freeze([
  { id: "look", x: -3.2, z: -5.7, label: "See it up close", color: 0x38bdf8 },
  { id: "survive", x: 0, z: -5.7, label: "Bring the ship home", color: 0x34d399 },
  { id: "sample", x: 3.2, z: -5.7, label: "Bring a piece home", color: 0xa78bfa },
]);

export const SPOTS = Object.freeze({
  lab: { x: -4.3, z: -9.0 },
  fuel: { x: 4.3, z: -9.0 },
  shout: { x: -4.3, z: -12.1 },
  store: { x: 4.3, z: -12.1 },
  commit: { x: -3.3, z: -12.3 },
  abort: { x: 3.4, z: -12.3 },
});

export function forwardFromYaw(yaw) {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

export function yawFromDirection(x, z) {
  return Math.atan2(-x, -z);
}

export function cameraBasis(fwd) {
  const len = Math.hypot(fwd.x, fwd.z) || 1;
  const x = fwd.x / len;
  const z = fwd.z / len;
  return { f: { x, z }, r: { x: -z, z: x } };
}

export function axesFromCodes(codes) {
  const has = (code) => codes.includes(code);
  return {
    forward: (has("KeyW") || has("ArrowUp") ? 1 : 0) - (has("KeyS") || has("ArrowDown") ? 1 : 0),
    strafe: (has("KeyD") || has("ArrowRight") ? 1 : 0) - (has("KeyA") || has("ArrowLeft") ? 1 : 0),
  };
}

export function wishFromAxes(basis, axes) {
  const x = basis.f.x * axes.forward + basis.r.x * axes.strafe;
  const z = basis.f.z * axes.forward + basis.r.z * axes.strafe;
  const len = Math.hypot(x, z);
  if (len < 1e-6) return { x: 0, z: 0 };
  if (len > 1) return { x: x / len, z: z / len };
  return { x, z };
}

export function dampYaw(current, target, rate, dt) {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  const gain = 1 - Math.exp(-rate * dt);
  return current + delta * gain;
}

export function insideHangar(x, z) {
  return x > -6.95 && x < 6.95 && z < -3.08 && z > -13.95;
}

// Straight lines from the yard into the hangar hit the south wall.
// Walk to the door mouth, through the opening, then to the bench.
export function approachPoint(from, goal) {
  if (insideHangar(from.x, from.z)) return goal;
  const wantsIn = Math.abs(goal.x) < 6.9 && goal.z < -3.15 && goal.z > -13.9;
  if (!wantsIn) return goal;
  if (Math.abs(from.x) > 1.05 || from.z > -1.75) return { x: 0, z: -1.75 };
  return { x: 0, z: -4.3 };
}

export function nearestHot(x, z, stations, range = INTERACT_RANGE) {
  let best = null;
  let bestD = range;
  for (const station of stations) {
    if (!station.hot) continue;
    const dist = Math.hypot(station.x - x, station.z - z);
    if (dist <= bestD) {
      best = station;
      bestD = dist;
    }
  }
  return best ? { station: best, dist: bestD } : null;
}

export function resolveSolids(pos, radius = PLAYER_RADIUS, walls = WALLS) {
  let x = pos.x;
  let z = pos.z;
  for (let pass = 0; pass < 3; pass += 1) {
    for (const box of walls) {
      const closestX = Math.max(box.minX, Math.min(x, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
      const dx = x - closestX;
      const dz = z - closestZ;
      const d2 = dx * dx + dz * dz;
      const r2 = radius * radius;
      if (d2 >= r2) continue;
      if (d2 < 1e-8) {
        const left = Math.abs(x - box.minX);
        const right = Math.abs(box.maxX - x);
        const south = Math.abs(z - box.minZ);
        const north = Math.abs(box.maxZ - z);
        const edge = Math.min(left, right, south, north);
        if (edge === left) x = box.minX - radius;
        else if (edge === right) x = box.maxX + radius;
        else if (edge === south) z = box.minZ - radius;
        else z = box.maxZ + radius;
        continue;
      }
      const dist = Math.sqrt(d2);
      const push = (radius - dist) / dist;
      x += dx * push;
      z += dz * push;
    }
    const rdx = x - ROCKET.x;
    const rdz = z - ROCKET.z;
    const reach = radius + ROCKET.r;
    const rd = Math.hypot(rdx, rdz);
    if (rd < reach) {
      if (rd < 1e-6) x = ROCKET.x + reach;
      else {
        x = ROCKET.x + (rdx / rd) * reach;
        z = ROCKET.z + (rdz / rd) * reach;
      }
    }
  }
  const island = Math.hypot(x, z);
  if (island > ISLAND_RADIUS) {
    const scale = ISLAND_RADIUS / island;
    x *= scale;
    z *= scale;
  }
  return { x, z };
}

export function stepPlayer(state, input, dt, walls = WALLS) {
  let wish;
  if (input.world) {
    const len = Math.hypot(input.world.x, input.world.z);
    wish = len < 1e-6
      ? { x: 0, z: 0 }
      : { x: input.world.x / len, z: input.world.z / len };
  } else {
    if (!input.basis) throw new Error("camera basis missing");
    wish = wishFromAxes(input.basis, input.axes || { forward: 0, strafe: 0 });
  }
  const moving = Math.hypot(wish.x, wish.z) > 0.05;
  const speed = input.sprint ? SPRINT_SPEED : WALK_SPEED;
  let next = { x: state.x, z: state.z };
  if (moving) {
    next = resolveSolids(
      { x: state.x + wish.x * speed * dt, z: state.z + wish.z * speed * dt },
      PLAYER_RADIUS,
      walls,
    );
  }
  const yaw = moving
    ? dampYaw(state.yaw, yawFromDirection(wish.x, wish.z), 12, dt)
    : state.yaw;
  return { x: next.x, z: next.z, yaw, moving, wish };
}
