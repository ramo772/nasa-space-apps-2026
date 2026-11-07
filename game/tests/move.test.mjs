import test from "node:test";
import assert from "node:assert/strict";
import {
  GOAL_PADS,
  ISLAND_RADIUS,
  PLAYER_RADIUS,
  ROCKET,
  SPAWN,
  SPOTS,
  WALLS,
  approachPoint,
  axesFromCodes,
  cameraBasis,
  forwardFromYaw,
  insideHangar,
  nearestHot,
  resolveSolids,
  stepPlayer,
  yawFromDirection,
} from "../js/sim.js";

function basisFor(yaw) {
  return cameraBasis(forwardFromYaw(yaw));
}

test("yaw 0 faces -Z and camera-right is +X", () => {
  const fwd = forwardFromYaw(0);
  assert.ok(Math.abs(fwd.x) < 1e-9);
  assert.ok(Math.abs(fwd.z + 1) < 1e-9);
  const basis = cameraBasis(fwd);
  assert.ok(Math.abs(basis.r.x - 1) < 1e-9);
  assert.ok(Math.abs(basis.r.z) < 1e-9);
  const turned = forwardFromYaw(Math.PI / 2);
  assert.ok(Math.abs(turned.x + 1) < 1e-9);
  assert.ok(Math.abs(turned.z) < 1e-9);
});

test("facing round-trips through the -Z yaw formula", () => {
  for (const [x, z] of [[0, -1], [1, 0], [0, 1], [-1, 0], [0.6, -0.8]]) {
    const len = Math.hypot(x, z);
    const yaw = yawFromDirection(x / len, z / len);
    const fwd = forwardFromYaw(yaw);
    const dot = fwd.x * (x / len) + fwd.z * (z / len);
    assert.ok(dot > 0.999, `dot ${dot} for ${x},${z}`);
  }
});

test("W walks along the camera and the body faces that way", () => {
  const start = { ...SPAWN };
  const basis = basisFor(start.yaw);
  const next = stepPlayer(start, {
    basis,
    axes: axesFromCodes(["KeyW"]),
  }, 0.45);
  const dx = next.x - start.x;
  const dz = next.z - start.z;
  const along = dx * basis.f.x + dz * basis.f.z;
  assert.ok(along > 1.5);
  const face = forwardFromYaw(next.yaw);
  const len = Math.hypot(dx, dz);
  assert.ok((face.x * dx + face.z * dz) / len > 0.9);
});

test("D and ArrowRight strafe to camera-right", () => {
  for (const code of ["KeyD", "ArrowRight"]) {
    const start = { ...SPAWN };
    const basis = basisFor(0);
    const next = stepPlayer(start, {
      basis,
      axes: axesFromCodes([code]),
    }, 0.45);
    const dx = next.x - start.x;
    const dz = next.z - start.z;
    const along = dx * basis.r.x + dz * basis.r.z;
    assert.ok(along > 1.5, code);
    assert.ok(Math.abs(dz) < 0.2, code);
  }
});

test("the south wall stops the player and the door lets them through", () => {
  let blocked = { x: -4, z: -1.6, yaw: 0 };
  for (let i = 0; i < 40; i += 1) {
    blocked = stepPlayer(blocked, { world: { x: 0, z: -1 } }, 1 / 30);
  }
  assert.ok(blocked.z > -2.5, `slipped through the wall to ${blocked.z}`);

  let open = { x: 0, z: -1.6, yaw: 0 };
  for (let i = 0; i < 50; i += 1) {
    open = stepPlayer(open, { world: { x: 0, z: -1 } }, 1 / 30);
  }
  assert.ok(open.z < -4, `door blocked at ${open.z}`);
  assert.ok(insideHangar(open.x, open.z));
});

test("spawn can walk onto every goal pad and up to every bench", () => {
  const spots = [
    ...GOAL_PADS,
    ...Object.entries(SPOTS).map(([id, spot]) => ({ id, ...spot })),
  ];
  for (const spot of spots) {
    let state = { ...SPAWN };
    for (let i = 0; i < 360; i += 1) {
      const goal = approachPoint(state, spot);
      const dx = goal.x - state.x;
      const dz = goal.z - state.z;
      if (Math.hypot(spot.x - state.x, spot.z - state.z) < 0.7) break;
      state = stepPlayer(state, { world: { x: dx, z: dz } }, 1 / 30);
    }
    const left = Math.hypot(spot.x - state.x, spot.z - state.z);
    assert.ok(left < 1.15, `${spot.id} stuck ${left.toFixed(2)} away`);
    const stuck = resolveSolids(state);
    assert.ok(Math.hypot(stuck.x - state.x, stuck.z - state.z) < 0.05);
  }
});

test("the rocket hull is solid and the island has an edge", () => {
  let state = { x: 0, z: -8, yaw: 0 };
  for (let i = 0; i < 40; i += 1) {
    state = stepPlayer(state, { world: { x: 0, z: -1 } }, 1 / 30);
  }
  const gap = Math.hypot(state.x - ROCKET.x, state.z - ROCKET.z);
  assert.ok(gap >= ROCKET.r + PLAYER_RADIUS - 0.02);

  let edge = { x: 0, z: 0, yaw: 0 };
  for (let i = 0; i < 80; i += 1) {
    edge = stepPlayer(edge, { world: { x: 1, z: 0 } }, 1 / 30);
  }
  assert.ok(Math.hypot(edge.x, edge.z) <= ISLAND_RADIUS + 0.001);
});

test("only the nearer hot bench is chosen", () => {
  const stations = [
    { id: "lab", x: 0, z: 0, hot: true },
    { id: "fuel", x: 3, z: 0, hot: true },
    { id: "shout", x: 0.2, z: 0, hot: false },
  ];
  const near = nearestHot(0.2, 0, stations, 1.5);
  assert.equal(near.station.id, "lab");
  assert.equal(nearestHot(10, 10, stations, 1.5), null);
});

test("every collider has a name the scene can mesh", () => {
  assert.equal(new Set(WALLS.map((wall) => wall.name)).size, WALLS.length);
  for (const wall of WALLS) assert.ok(wall.maxX > wall.minX && wall.maxZ > wall.minZ);
});
