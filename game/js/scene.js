import * as THREE from "../vendor/three.module.js";
import {
  GOAL_PADS,
  INTERACT_RANGE,
  ROCKET,
  SPAWN,
  approachPoint,
  axesFromCodes,
  cameraBasis,
  forwardFromYaw,
  insideHangar,
  nearestHot,
  stepPlayer,
} from "./sim.js";

// Follow camera sits behind the player's -Z nose.
// Movement reads camera.getWorldDirection every frame. placeCamera is the
// only place that turns yaw into a camera position, and it uses forwardFromYaw.
//
// Colliders are WALLS plus the rocket circle. Decorative, no collider:
// film cards (spires, mushrooms, boulders), pads, labels, and the sky arc.
// Cards that stand on a wall sit on that wall's box.
// The sky arc is a painting, not an orbit.

const UP = new THREE.Vector3(0, 1, 0);
const BENCH_COLOR = {
  look: 0x38bdf8,
  survive: 0x34d399,
  sample: 0xa78bfa,
  lab: 0x38bdf8,
  fuel: 0xfbbf24,
  shout: 0xfb7185,
  store: 0xa78bfa,
  commit: 0x34d399,
  abort: 0x94a3b8,
};

export function mountWorld(canvas, hooks) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x3a1870);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe7a4c8, 48, 120);
  scene.background = new THREE.Color(0x3a1870);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 180);

  const hemi = new THREE.HemisphereLight(0xffd0e4, 0x4a2848, 0.62);
  const sun = new THREE.DirectionalLight(0xffc2a0, 3.2);
  sun.position.set(-14, 5.4, -18);
  sun.target.position.set(0, 1, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 70;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0006;
  const fill = new THREE.DirectionalLight(0x6d4cff, 0.55);
  fill.position.set(12, 8, 14);
  const rimLight = new THREE.DirectionalLight(0xfff1d0, 1.45);
  rimLight.position.set(1, 4, 18);
  scene.add(hemi, sun, sun.target, fill, rimLight);
  const hangarLight = new THREE.PointLight(0xffb45e, 28, 24, 2);
  hangarLight.position.set(0, 2.6, -8.4);
  const alarm = new THREE.PointLight(0xfb7185, 0, 12, 2);
  alarm.position.set(0, 2.2, -8);
  scene.add(hangarLight, alarm);

  const state = { x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw };
  const pressed = new Set();
  let stations = [];
  let walk = null;
  let locked = false;
  let buildFlags = { active: false, parts: {}, alarm: false };
  let outro = null;
  let elapsed = 0;
  let stride = 0;

  scene.add(buildStars());
  scene.add(buildSky());
  scene.add(buildIsland());
  const roofBeams = buildHangar(scene);
  dressWorld(scene);
  const visitor = buildVisitor();
  scene.add(visitor);
  const { player, visor, legs, arms } = buildCharacter();
  scene.add(player);
  const footShadow = buildFootShadow();
  scene.add(footShadow);
  const rocketBits = buildRocket();
  scene.add(rocketBits.root);
  const markers = new THREE.Group();
  scene.add(markers);
  const dest = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.035, 8, 22),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  );
  dest.rotation.x = Math.PI / 2;
  dest.visible = false;
  scene.add(dest);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const floorPlane = new THREE.Plane(UP, 0);
  const hitPoint = new THREE.Vector3();
  const lookScratch = new THREE.Vector3();

  function placeCamera(yaw, x, z) {
    const fwd = forwardFromYaw(yaw);
    const lift = groundHeight(x, z);
    // Still above the short hangar walls so the yard and the room share one view.
    camera.position.set(x - fwd.x * 5.2, lift + 1.85, z - fwd.z * 5.2);
    camera.lookAt(x, lift + 1.05, z);
    camera.updateMatrixWorld();
  }

  function readBasis() {
    camera.updateMatrixWorld();
    camera.getWorldDirection(lookScratch);
    lookScratch.y = 0;
    if (lookScratch.lengthSq() < 1e-8) lookScratch.set(0, 0, -1);
    else lookScratch.normalize();
    return cameraBasis({ x: lookScratch.x, z: lookScratch.z });
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function rebuildMarkers() {
    clearGroup(markers);
    for (const station of stations) {
      const color = station.color || BENCH_COLOR[station.id] || 0x38bdf8;
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.78, 0.08, 22),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: station.hot ? 0.7 : 0.08,
          roughness: 0.42,
        }),
      );
      pad.position.set(station.x, 0.05, station.z);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.03, 8, 28),
        new THREE.MeshBasicMaterial({ color }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(station.x, 0.12, station.z);
      ring.userData.pulse = Boolean(station.hot);
      const sprite = labelSprite(station.label || station.id);
      sprite.position.set(station.x, 1.85, station.z);
      markers.add(pad, ring, sprite);
    }
  }

  function tryInteract() {
    if (locked) return;
    const near = nearestHot(state.x, state.z, stations, INTERACT_RANGE);
    if (near) hooks.onInteract(near.station.id);
  }

  function update(dt, extra) {
    const safeDt = Math.max(0, dt);
    elapsed += safeDt;
    const codes = [...pressed];
    const axes = axesFromCodes(codes);
    const typing = Math.abs(axes.forward) + Math.abs(axes.strafe) > 0;
    if (typing) walk = null;
    let world = extra && extra.world ? extra.world : null;
    if (!world && walk && !locked) {
      const aim = approachPoint(state, walk);
      const left = Math.hypot(walk.x - state.x, walk.z - state.z);
      const arrived = left < (walk.then ? 1.15 : 0.4);
      if (arrived) {
        const then = walk.then;
        walk = null;
        if (then) hooks.onInteract(then);
      } else {
        world = { x: aim.x - state.x, z: aim.z - state.z };
      }
    }
    const next = stepPlayer(state, {
      basis: world ? null : readBasis(),
      axes,
      world,
      sprint: pressed.has("ShiftLeft") || pressed.has("ShiftRight"),
    }, safeDt);
    state.x = next.x;
    state.z = next.z;
    state.yaw = next.yaw;
    const lift = groundHeight(state.x, state.z);
    player.position.set(state.x, lift, state.z);
    player.rotation.y = state.yaw;
    if (next.moving && !reduced) {
      stride += safeDt * 11;
      const step = Math.sin(stride);
      legs[0].rotation.x = step * 0.75;
      legs[1].rotation.x = Math.sin(stride + Math.PI) * 0.75;
      arms[0].rotation.x = Math.sin(stride + Math.PI) * 0.55;
      arms[1].rotation.x = step * 0.55;
      player.position.y = lift + Math.abs(step) * 0.04;
    } else {
      for (const limb of [...legs, ...arms]) limb.rotation.x *= 0.8;
    }
    footShadow.position.set(state.x, lift + 0.035, state.z);
    player.updateMatrixWorld(true);

    const inside = insideHangar(state.x, state.z);
    roofBeams.visible = !inside;
    hangarLight.intensity = inside ? 18 : 10;
    alarm.intensity = buildFlags.alarm ? 8 : 0;

    for (const key of ["lab", "fuel", "shout", "store", "commit"]) {
      const node = rocketBits.parts[key];
      const fitted = Boolean(buildFlags.parts && buildFlags.parts[key]);
      const goal = key === "commit" ? (fitted ? 1 : 0.7) : (fitted ? 1 : 0.001);
      const scale = node.scale.x + (goal - node.scale.x) * (1 - Math.exp(-8 * safeDt));
      node.scale.set(scale, scale, scale);
    }
    rocketBits.body.material.emissiveIntensity = buildFlags.active ? 0.35 : 0.04;

    if (outro) {
      outro.t += reduced ? 3 : safeDt;
      if (outro.mode === "launch") {
        const k = Math.min(1, outro.t / 2.15);
        rocketBits.root.position.y = k * k * 24;
        const flame = 0.35 + k * 1.8;
        rocketBits.flame.scale.set(flame, flame * 1.4, flame);
      }
      if (outro.t > 2.2 && !outro.fired) {
        outro.fired = true;
        if (outro.done) outro.done();
      }
    }

    visitor.rotation.y += safeDt * 0.18;
    dest.visible = Boolean(walk);
    if (walk) {
      dest.position.set(walk.x, groundHeight(walk.x, walk.z) + 0.08, walk.z);
      dest.rotation.z += safeDt * 1.4;
    }
    markers.traverse((node) => {
      if (!node.userData.pulse) return;
      const pulse = 1 + Math.sin(elapsed * 3) * 0.05;
      node.scale.set(pulse, pulse, pulse);
    });

    placeCamera(state.yaw, state.x, state.z);
    const near = nearestHot(state.x, state.z, stations, INTERACT_RANGE);
    if (hooks.onStatus) {
      hooks.onStatus({
        inside,
        nearId: near ? near.station.id : "",
        walkingId: walk && walk.then ? walk.then : "",
        x: state.x,
        z: state.z,
      });
    }
  }

  function frame(now) {
    const raw = frame.then ? (now - frame.then) / 1000 : 0;
    frame.then = now;
    update(Math.min(0.05, raw));
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (locked || event.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(floorPlane, hitPoint)) return;
    if (Math.hypot(hitPoint.x, hitPoint.z) > 18.2) return;
    const near = nearestHot(hitPoint.x, hitPoint.z, stations, 1.35);
    walk = near
      ? { x: near.station.x, z: near.station.z, then: near.station.id }
      : { x: hitPoint.x, z: hitPoint.z, then: null };
  });

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    pressed.add(event.code);
    if (event.code.startsWith("Arrow") || event.code === "Space") event.preventDefault();
    if (event.code === "KeyE" || event.code === "Space") tryInteract();
    if (event.code === "KeyR" && hooks.onRetry) hooks.onRetry();
  });
  window.addEventListener("keyup", (event) => pressed.delete(event.code));
  window.addEventListener("blur", () => pressed.clear());
  window.addEventListener("resize", resize);

  resize();
  placeCamera(state.yaw, state.x, state.z);
  const params = new URLSearchParams(window.location.search);
  if (params.has("selftest")) runSelfTest();
  requestAnimationFrame(frame);

  return {
    setStations(next) {
      stations = next.slice();
      rebuildMarkers();
    },
    setBuild(flags) {
      buildFlags = {
        active: Boolean(flags.active),
        parts: { ...(flags.parts || {}) },
        alarm: Boolean(flags.alarm),
      };
    },
    setLocked(value) {
      locked = Boolean(value);
      if (locked) walk = null;
    },
    playOut(mode, done) {
      if (mode === "reset") {
        outro = null;
        rocketBits.root.position.y = 0;
        rocketBits.flame.scale.set(0.001, 0.001, 0.001);
        return;
      }
      outro = { mode, t: 0, done, fired: false };
    },
  };

  function runSelfTest() {
    const checks = [];
    const check = (name, ok) => {
      checks.push({ name, ok: Boolean(ok) });
    };
    const sample = (code) => {
      state.x = SPAWN.x;
      state.z = SPAWN.z;
      state.yaw = SPAWN.yaw;
      player.position.set(state.x, 0, state.z);
      player.rotation.y = 0;
      placeCamera(state.yaw, state.x, state.z);
      camera.updateMatrixWorld(true);
      const before = new THREE.Vector3();
      camera.getWorldDirection(before);
      before.y = 0;
      before.normalize();
      const right = new THREE.Vector3().crossVectors(before, UP);
      const origin = { x: state.x, z: state.z };
      pressed.add(code);
      update(0.45);
      pressed.delete(code);
      const disp = new THREE.Vector3(state.x - origin.x, 0, state.z - origin.z);
      const along = code === "KeyD" ? right : before;
      const moved = disp.length();
      check(`${code} moved`, moved > 0.8);
      check(`${code} direction`, moved > 0.2 && disp.normalize().dot(along) > 0.9);
      const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
      check(`${code} faces travel`, facing.dot(disp) > 0.9);
      const visorAt = new THREE.Vector3();
      const chestAt = new THREE.Vector3();
      visor.getWorldPosition(visorAt);
      player.getWorldPosition(chestAt);
      const cue = visorAt.sub(chestAt).setY(0);
      check(`${code} visor leads`, cue.length() > 0.05 && cue.normalize().dot(disp) > 0.9);
      const seen = new THREE.Vector3();
      camera.getWorldDirection(seen);
      seen.y = 0;
      seen.normalize();
      const expect = forwardFromYaw(state.yaw);
      check(`${code} camera matches yaw`, seen.dot(new THREE.Vector3(expect.x, 0, expect.z)) > 0.98);
    };
    sample("KeyW");
    sample("KeyD");
    state.x = SPAWN.x;
    state.z = SPAWN.z;
    state.yaw = 0;
    const pad = GOAL_PADS[0];
    for (let i = 0; i < 220; i += 1) {
      const aim = approachPoint(state, pad);
      update(1 / 30, { world: { x: aim.x - state.x, z: aim.z - state.z } });
    }
    check("reached look pad", Math.hypot(pad.x - state.x, pad.z - state.z) < 1.2);
    check("inside hangar", insideHangar(state.x, state.z));
    const ok = checks.every((item) => item.ok);
    const report = {
      ok,
      checks,
      x: Number(state.x.toFixed(2)),
      z: Number(state.z.toFixed(2)),
    };
    window.__selfTest = report;
    const node = document.querySelector("#selftest");
    if (node) node.textContent = JSON.stringify(report);
    document.title = ok ? "Odyssey selftest ok" : "Odyssey selftest fail";
  }
}

function buildSky() {
  const group = new THREE.Group();
  const map = new THREE.TextureLoader().load("assets/sky.jpg");
  map.colorSpace = THREE.SRGBColorSpace;
  // Cylinder theta 0 faces +Z. The follow camera looks toward -Z, so the arc
  // is centered on theta = PI. U starts on the screen-right side of that arc.
  map.wrapS = THREE.RepeatWrapping;
  map.repeat.x = -1;
  map.offset.x = 1;
  const radius = 54;
  const arc = Math.PI * 1.35;
  const height = radius * arc * (900 / 1600);
  const vista = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 72, 1, true, Math.PI - arc / 2, arc),
    new THREE.MeshBasicMaterial({ map, side: THREE.BackSide, depthWrite: false, fog: false }),
  );
  // The painted horizon sits about 42% up the plate. Park that line on the ground.
  vista.position.y = height * (0.5 - 0.42);
  group.add(vista);
  return group;
}

const CRATERS = [
  { x: -5.8, z: 9.6, r: 2.7, d: 0.48 },
  { x: 6.2, z: 8.4, r: 2.4, d: 0.4 },
  { x: -10.2, z: 3.6, r: 3.2, d: 0.55 },
  { x: 11.0, z: 2.8, r: 2.9, d: 0.5 },
  { x: -4.6, z: 0.8, r: 1.9, d: 0.3 },
  { x: 5.4, z: -1.6, r: 2.3, d: 0.34 },
  { x: 14.2, z: 12.2, r: 3.5, d: 0.6 },
  { x: -14.4, z: 11.2, r: 3.3, d: 0.55 },
  { x: 7.6, z: 14.6, r: 2.5, d: 0.42 },
  { x: -8.2, z: 15.0, r: 2.3, d: 0.4 },
];

function flatWeight(x, z) {
  const pad = Math.hypot(x, z + 10);
  const padW = pad < 2.3 ? 1 : pad < 3.4 ? (3.4 - pad) / 1.1 : 0;
  const corridor = Math.abs(x);
  const corW = corridor < 1.45 ? 1 : corridor < 2.7 ? (2.7 - corridor) / 1.25 : 0;
  const inRun = z < 14.2 && z > -14.6;
  return Math.max(padW, inRun ? corW : 0);
}

function groundHeight(x, z) {
  let y = Math.sin(x * 0.31) * Math.cos(z * 0.22) * 0.08;
  for (const crater of CRATERS) {
    const dist = Math.hypot(x - crater.x, z - crater.z);
    if (dist >= crater.r) continue;
    const u = dist / crater.r;
    y -= Math.cos(u * Math.PI * 0.5) * crater.d;
    if (u > 0.76) y += ((u - 0.76) / 0.24) * crater.d * 0.42;
  }
  const edge = Math.hypot(x, z);
  if (edge > 30) y -= (edge - 30) * 0.04;
  return y * (1 - flatWeight(x, z));
}

function buildIsland() {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load("assets/ground.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  const geo = new THREE.PlaneGeometry(88, 88, 150, 150);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = groundHeight(x, z);
    pos.setY(i, y);
    const low = Math.min(1, Math.max(0, -y / 0.45));
    colors[i * 3] = 0.84 - low * 0.32;
    colors[i * 3 + 1] = 0.40 - low * 0.16 + low * low * 0.22;
    colors[i * 3 + 2] = 0.52 - low * 0.1 + low * low * 0.28;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: texture, vertexColors: true, roughness: 0.96, metalness: 0 }),
  );
  ground.receiveShadow = true;
  ground.castShadow = true;
  group.add(ground);
  const crust = new THREE.Mesh(
    new THREE.CylinderGeometry(46, 42, 3.2, 72),
    new THREE.MeshStandardMaterial({ color: 0xb85c88, roughness: 0.95 }),
  );
  crust.position.y = -2.4;
  group.add(crust);
  const stoneGeo = new THREE.SphereGeometry(1, 12, 8);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d4d78, roughness: 0.94 });
  const stones = [
    [-3.6, 7.2, 0.34, 0.16, 0.28],
    [3.8, 6.4, 0.28, 0.14, 0.32],
    [-6.8, 12.4, 0.42, 0.18, 0.36],
    [7.4, 11.8, 0.38, 0.16, 0.3],
    [-2.8, 13.6, 0.22, 0.1, 0.2],
    [3.2, 13.2, 0.26, 0.12, 0.22],
    [-8.4, 7.6, 0.5, 0.2, 0.4],
    [9.2, 6.8, 0.46, 0.18, 0.38],
    [4.6, 3.4, 0.3, 0.13, 0.26],
    [-5.2, 4.4, 0.32, 0.14, 0.28],
    [12.4, 8.6, 0.55, 0.22, 0.48],
    [-12.6, 6.4, 0.5, 0.2, 0.44],
  ];
  for (const [x, z, sx, sy, sz] of stones) {
    const rock = new THREE.Mesh(stoneGeo, stoneMat);
    rock.scale.set(sx, sy, sz);
    rock.position.set(x, groundHeight(x, z) + sy * 0.35, z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }
  return group;
}

function buildFootShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const pen = canvas.getContext("2d");
  const ink = pen.createRadialGradient(64, 64, 6, 64, 64, 62);
  ink.addColorStop(0, "rgba(48, 12, 36, 0.5)");
  ink.addColorStop(1, "rgba(48, 12, 36, 0)");
  pen.fillStyle = ink;
  pen.fillRect(0, 0, 128, 128);
  const map = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 24),
    new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

const PROP = {
  spire: { url: "assets/spire.png", aspect: 527 / 656 },
  mushrooms: { url: "assets/mushrooms.png", aspect: 660 / 592 },
  boulder: { url: "assets/boulder.png", aspect: 619 / 436 },
};
const propMaterial = {};

function filmProp(kind, height, x, z, yaw = 0) {
  if (!propMaterial[kind]) {
    const map = new THREE.TextureLoader().load(PROP[kind].url);
    map.colorSpace = THREE.SRGBColorSpace;
    propMaterial[kind] = new THREE.MeshBasicMaterial({
      map,
      alphaTest: 0.12,
      side: THREE.DoubleSide,
      fog: false,
    });
  }
  const width = height * PROP[kind].aspect;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), propMaterial[kind]);
  face.position.set(x, height / 2, z);
  face.rotation.y = yaw;
  return face;
}

function dressWorld(scene) {
  const cards = [
    ["spire", 5.8, -5.4, -2.78, 0],
    ["boulder", 1.85, -3.2, -2.62, 0],
    ["mushrooms", 2.55, 3.55, -2.62, 0],
    ["spire", 5.5, 6.05, -2.8, 0],
    ["spire", 5.4, -7.3, -9.2, Math.PI / 2],
    ["boulder", 1.7, -7.25, -4.6, Math.PI / 2],
    ["spire", 5.2, 7.3, -8.4, -Math.PI / 2],
    ["mushrooms", 2.3, 7.28, -12.2, -Math.PI / 2],
    ["spire", 6.6, 10.7, 5.1, 0],
    ["boulder", 2.3, 9.3, 6.9, 0],
    ["mushrooms", 2.7, -9.9, 6.8, 0],
    ["boulder", 1.15, -4.4, 6.2, 0],
    ["boulder", 0.85, 4.8, 7.4, 0],
    ["boulder", 1.25, -7.2, 1.6, 0],
    ["boulder", 0.95, 7.6, 2.8, 0],
    ["mushrooms", 1.2, -8.6, 9.2, 0],
    ["boulder", 1.05, 8.4, 9.4, 0],
    ["boulder", 2.5, -13.6, 11.4, 0],
    ["boulder", 2.2, 12.2, 10.2, 0],
    ["mushrooms", 2.15, -12.4, 3.6, 0],
    ["spire", 4.4, 12.8, 1.4, 0],
  ];
  for (const [kind, height, x, z, yaw] of cards) scene.add(filmProp(kind, height, x, z, yaw));
}

function buildHangar(scene) {
  const inlay = new THREE.Mesh(
    new THREE.RingGeometry(2.15, 2.28, 48),
    new THREE.MeshStandardMaterial({ color: 0xe7d2dc, roughness: 0.8, metalness: 0.02 }),
  );
  inlay.rotation.x = -Math.PI / 2;
  inlay.position.set(0, 0.025, -10);
  scene.add(inlay);

  const sign = labelSprite("WORKSHOP");
  sign.position.set(0, 1.7, -2.35);
  sign.scale.set(1.8, 0.45, 1);
  scene.add(sign);

  const beams = new THREE.Group();
  scene.add(beams);
  return beams;
}

function buildVisitor() {
  return new THREE.Group();
}

function buildCharacter() {
  const player = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(0.70, 1.96),
    portraitMaterial("assets/inventor-back.png", THREE.FrontSide),
  );
  back.position.set(0, 0.9, 0.07);
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(0.79, 1.96),
    portraitMaterial("assets/inventor.png", THREE.FrontSide),
  );
  front.position.set(0, 0.9, -0.07);
  front.rotation.y = Math.PI;
  front.scale.x = -1;
  player.add(back, front);
  const arms = [new THREE.Group(), new THREE.Group()];
  const legs = [new THREE.Group(), new THREE.Group()];
  player.add(arms[0], arms[1], legs[0], legs[1]);
  const visor = new THREE.Object3D();
  visor.position.set(0, 1.42, -0.62);
  player.add(visor);
  return { player, visor, legs, arms };
}

function portraitMaterial(url, side) {
  const map = new THREE.TextureLoader().load(url);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.2,
    roughness: 0.84,
    metalness: 0,
    emissive: 0xffffff,
    emissiveMap: map,
    emissiveIntensity: 0.45,
    side,
  });
}

function buildRocket() {
  const root = new THREE.Group();
  root.position.set(ROCKET.x, 0, ROCKET.z);
  const metal = new THREE.MeshStandardMaterial({ color: 0xf4ecdf, roughness: 0.48, metalness: 0.06 });
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 0.04, 28),
    new THREE.MeshStandardMaterial({ color: 0xc46a90, roughness: 0.95 }),
  );
  pad.position.y = 0.02;
  pad.receiveShadow = true;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.86, 32, 22), metal);
  body.scale.set(1.7, 0.58, 1.18);
  body.position.y = 0.7;
  body.castShadow = true;
  body.material.emissive = new THREE.Color(0xffc2a0);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x8fd4ea,
    emissive: 0x1a6a88,
    emissiveIntensity: 0.35,
    roughness: 0.06,
    metalness: 0.05,
    transparent: true,
    opacity: 0.82,
  });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 16), glassMat);
  glass.scale.set(1.35, 0.62, 0.7);
  glass.position.set(0, 0.92, 0.72);
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), metal);
  bubble.position.set(0, 1.18, -0.02);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 16), metal);
  lip.rotation.x = Math.PI / 2;
  lip.position.set(0, 1.16, -0.02);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xe4d8c8, roughness: 0.48 });
  const skidMat = new THREE.MeshStandardMaterial({ color: 0x3a2e44, roughness: 0.55 });
  const canopyRim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.028, 8, 28), metal);
  canopyRim.rotation.y = Math.PI / 2;
  canopyRim.scale.set(1, 0.62, 1);
  canopyRim.position.set(0, 0.94, 0.78);
  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xf7fbff }),
  );
  glint.scale.set(1.6, 0.45, 0.35);
  glint.position.set(-0.22, 1.08, 1.02);
  root.add(canopyRim, glint);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.045, 0.5), wingMat);
    wing.position.set(side * 1.9, 0.52, 0.2);
    wing.rotation.z = side * -0.08;
    wing.castShadow = true;
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 1.25), skidMat);
    skid.position.set(side * 0.72, 0.1, 0.42);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.46, 8), skidMat);
    leg.position.set(side * 0.72, 0.32, 0.42);
    root.add(wing, skid, leg);
  }
  const parts = {
    fuel: sideTanks(),
    lab: sensorMast(),
    shout: dish(),
    store: recorder(),
    commit: noseCone(),
  };
  for (const node of Object.values(parts)) node.scale.set(0.001, 0.001, 0.001);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.7, 12),
    new THREE.MeshBasicMaterial({ color: 0xff9a62 }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = 0.12;
  flame.scale.set(0.001, 0.001, 0.001);
  root.add(pad, body, glass, bubble, lip, flame, ...Object.values(parts));
  return { root, body, parts, flame };
}

function sideTanks() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, metalness: 0.2 });
  for (const side of [-1, 1]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.25, 12), mat);
    tank.position.set(side * 1.05, 0.72, 0.15);
    tank.castShadow = true;
    group.add(tank);
  }
  return group;
}

function sensorMast() {
  const group = new THREE.Group();
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 }),
  );
  mast.position.y = 1.45;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1, emissiveIntensity: 0.6, roughness: 0.25 }),
  );
  head.position.y = 1.78;
  group.add(mast, head);
  return group;
}

function dish() {
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.06, 18),
    new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0x9f1239, emissiveIntensity: 0.35, roughness: 0.35 }),
  );
  dish.position.set(0.15, 1.42, 0.35);
  return dish;
}

function recorder() {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x5b21b6, emissiveIntensity: 0.3, roughness: 0.4 }),
  );
  box.position.set(0.15, 0.7, 0.7);
  return box;
}

function noseCone() {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xd6ff7a, emissive: 0x8adf4a, emissiveIntensity: 0.45, roughness: 0.3 }),
  );
  dome.position.y = 1.28;
  dome.castShadow = true;
  return dome;
}

function buildStars() {
  const positions = new Float32Array(800 * 3);
  for (let i = 0; i < 800; i += 1) {
    const radius = 110 + Math.random() * 24;
    const theta = Math.random() * Math.PI * 2;
    const lift = Math.random();
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = 6 + lift * 28;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xf8fafc, size: 0.14, sizeAttenuation: true }),
  );
}

function labelSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const pen = canvas.getContext("2d");
  pen.fillStyle = "rgba(20,8,24,0.62)";
  pen.beginPath();
  pen.roundRect(36, 36, 440, 56, 28);
  pen.fill();
  pen.fillStyle = "#ff6b9d";
  pen.fillRect(56, 58, 16, 4);
  pen.fillStyle = "#fff4df";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  let size = 34;
  pen.font = `600 ${size}px Georgia, "Palatino Linotype", serif`;
  while (pen.measureText(text).width > 380 && size > 16) {
    size -= 2;
    pen.font = `600 ${size}px Georgia, "Palatino Linotype", serif`;
  }
  pen.fillText(text, 268, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(2.15, 0.54, 1);
  return sprite;
}

function clearGroup(group) {
  for (const child of [...group.children]) {
    child.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (!node.material) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    });
    group.remove(child);
  }
}
