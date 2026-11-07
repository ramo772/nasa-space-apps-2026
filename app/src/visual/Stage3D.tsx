import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { CrewMember } from "../app/gameState";
import { Crew } from "./Crew";
import { Depot } from "./Depot";
import { NADIR_LAYERS, Nadir } from "./Nadir";
import { Sectors, type SectorLabels } from "./Sectors";
import { RIVO_FACES, Rivo } from "./Rivo";
import type { Shot, StageState } from "./stageState";
import { c, earthTexture, floorTexture, screenTexture, wrenchShape } from "./textures";

type Vec3 = [number, number, number];

const SHOTS: Record<Shot, { position: Vec3; target: Vec3 }> = {
  wide: { position: [0, 4.6, 16], target: [0, 3.1, -2] },
  table: { position: [0, 8.6, 13.6], target: [0, 0.4, -1.4] },
  window: { position: [0, 3.2, 12], target: [0, 4.4, -6] },
  wake: { position: [1.2, 4.2, 12], target: [1.6, 2.9, 0] },
  engine: { position: [1.4, 5, 11.5], target: [7, 0.7, -3] },
  capsule: { position: [3.2, 4.2, 13], target: [9.4, 1.8, 0] },
  review: { position: [-3, 4.6, 13], target: [3.5, 3, -2] },
  reviewRtl: { position: [4, 4.6, 13], target: [-14, 3, -2] },
};

const EARTH = {
  home: { position: [0, -15.5, -34], scale: 1 },
  geo: { position: [-3, -3.6, -34], scale: 0.42 },
  far: { position: [-5.5, 10.2, -34], scale: 0.11 },
} as const;

const boxCache = new Map<string, THREE.BufferGeometry>();
function roundedBox(size: Vec3, radius: number) {
  const key = `${size.join()}|${radius}`;
  let geometry = boxCache.get(key);
  if (!geometry) {
    geometry = new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius);
    boxCache.set(key, geometry);
  }
  return geometry;
}

function Box({
  size,
  position,
  rotation,
  color,
  radius = 0.08,
  rough = 0.65,
  metal = 0,
  shadow = true,
  emissive,
  glow = 0,
}: {
  size: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  color: string;
  radius?: number;
  rough?: number;
  metal?: number;
  shadow?: boolean;
  emissive?: string;
  glow?: number;
}) {
  return (
    <mesh geometry={roundedBox(size, Math.min(radius, Math.min(...size) / 2 - 0.001))} position={position} rotation={rotation} castShadow={shadow} receiveShadow>
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? "#000000"} emissiveIntensity={glow} />
    </mesh>
  );
}

function Glow({ size, position, rotation, color = c.primary }: { size: Vec3; position?: Vec3; rotation?: Vec3; color?: string }) {
  return (
    <mesh geometry={roundedBox(size, Math.min(0.03, Math.min(...size) / 2 - 0.001))} position={position} rotation={rotation}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function CameraRig({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const look = useRef(new THREE.Vector3(...SHOTS.wide.target));
  const goal = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);
  const trauma = useRef(0);
  const lastPulse = useRef(stage.pulse);
  const time = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    if (stage.pulse !== lastPulse.current || stage.shake > 0.3) {
      lastPulse.current = stage.pulse;
      if (!reducedMotion) trauma.current = Math.min(1, trauma.current + stage.shake);
    }
    invalidate();
  }, [stage.pulse, stage.shake, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const shot = SHOTS[stage.shot];
    // Narrow screens pull back, so the same room stays in frame.
    const pullBack = Math.max(1, 1.55 / (size.width / size.height));
    goalLook.set(...shot.target);
    goal.set(...shot.position).sub(goalLook).multiplyScalar(pullBack).add(goalLook);

    const instant = reducedMotion || first.current;
    first.current = false;
    const blend = instant ? 1 : 1 - Math.exp(-delta * 2.1);
    camera.position.lerp(goal, blend);
    look.current.lerp(goalLook, blend);

    // Shake moves only the camera, from decaying trauma, and never touches the simulation.
    time.current += delta;
    trauma.current = Math.max(0, trauma.current - delta * 1.3);
    const shake = trauma.current * trauma.current;
    const shaken = camera.position.clone();
    shaken.x += 0.22 * shake * Math.sin(time.current * 41);
    shaken.y += 0.16 * shake * Math.sin(time.current * 53);
    camera.position.copy(shaken);
    camera.lookAt(look.current);
    camera.position.x -= 0.22 * shake * Math.sin(time.current * 41);
    camera.position.y -= 0.16 * shake * Math.sin(time.current * 53);

    if (camera.position.distanceTo(goal) > 0.01 || shake > 0.001) invalidate();
  });
  return null;
}

function Lights({ mood }: { mood: StageState["mood"] }) {
  const warm = useRef<THREE.PointLight>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [mood, invalidate]);
  const color = mood === "alert" ? c.danger : mood === "success" ? c.success : mood === "dim" ? c.mutedText : c.text;
  return (
    <>
      <hemisphereLight args={[c.text, c.surface, mood === "dim" ? 1.0 : 1.5]} />
      <directionalLight
        position={[4, 11, 8]}
        intensity={mood === "dim" ? 1.0 : 1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0006}
      />
      <pointLight ref={warm} position={[0, 7, 2]} intensity={mood === "calm" ? 12 : 26} distance={22} color={color} />
      <directionalLight position={[0, 5, -30]} intensity={1.4} color={c.primary} />
    </>
  );
}

function Room() {
  const floor = useMemo(() => floorTexture(), []);
  const wall = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-16, -1);
    shape.lineTo(16, -1);
    shape.lineTo(16, 11);
    shape.lineTo(-16, 11);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-6.2, 1.9);
    hole.lineTo(6.2, 1.9);
    hole.lineTo(6.2, 5.2);
    hole.absarc(4.2, 5.2, 2, 0, Math.PI / 2, false);
    hole.lineTo(-4.2, 7.2);
    hole.absarc(-4.2, 5.2, 2, Math.PI / 2, Math.PI, false);
    hole.closePath();
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
  }, []);
  const frame = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-6.5, 1.6);
    outer.lineTo(6.5, 1.6);
    outer.lineTo(6.5, 5.2);
    outer.absarc(4.2, 5.2, 2.3, 0, Math.PI / 2, false);
    outer.lineTo(-4.2, 7.5);
    outer.absarc(-4.2, 5.2, 2.3, Math.PI / 2, Math.PI, false);
    outer.closePath();
    const inner = new THREE.Path();
    inner.moveTo(-6.2, 1.9);
    inner.lineTo(6.2, 1.9);
    inner.lineTo(6.2, 5.2);
    inner.absarc(4.2, 5.2, 2, 0, Math.PI / 2, false);
    inner.lineTo(-4.2, 7.2);
    inner.absarc(-4.2, 5.2, 2, Math.PI / 2, Math.PI, false);
    inner.closePath();
    outer.holes.push(inner);
    return new THREE.ExtrudeGeometry(outer, { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial map={floor} roughness={0.75} />
      </mesh>
      <mesh geometry={wall} position={[0, 0, -5.5]} receiveShadow>
        <meshStandardMaterial color={c.surface} roughness={0.85} />
      </mesh>
      <mesh geometry={frame} position={[0, 0, -5.2]} castShadow>
        <meshStandardMaterial color={c.text} roughness={0.55} />
      </mesh>
      <Box size={[0.09, 5.4, 0.12]} position={[-2.1, 4.6, -5.1]} color={c.text} shadow={false} />
      <Box size={[0.09, 5.4, 0.12]} position={[2.1, 4.6, -5.1]} color={c.text} shadow={false} />
      <Box size={[1.5, 0.22, 0.3]} position={[-5.5, 1.5, -5]} color={c.accent} shadow={false} />
      <Box size={[1.5, 0.22, 0.3]} position={[5.5, 1.5, -5]} color={c.accent} shadow={false} />

      {/* Ribs, so the room reads as a pressure hull rather than a box */}
      {[-3.4, 2.6].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[13, 0.3, 10, 64, Math.PI]} />
          <meshStandardMaterial color={c.background} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0, -3.4]}>
        <torusGeometry args={[12.62, 0.05, 6, 64, Math.PI]} />
        <meshBasicMaterial color={c.accent} toneMapped={false} />
      </mesh>
      <Box size={[0.5, 15, 22]} position={[-14.4, 5, 3]} color={c.surface} shadow={false} />
      <Box size={[0.5, 15, 22]} position={[14.4, 5, 3]} color={c.surface} shadow={false} />
      <Box size={[32, 0.4, 22]} position={[0, 11, 3]} color={c.background} shadow={false} />

      {/* Ceiling lamp over the mission table */}
      <mesh position={[0, 9.6, 0]}>
        <cylinderGeometry args={[2.3, 2.5, 0.5, 48]} />
        <meshStandardMaterial color={c.text} />
      </mesh>
      <mesh position={[0, 9.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.09, 12, 64]} />
        <meshBasicMaterial color={c.primary} toneMapped={false} />
      </mesh>
      <Glow size={[5.5, 0.1, 0.4]} position={[-8.6, 8.2, -5]} color={c.text} />
      <Glow size={[5.5, 0.1, 0.4]} position={[8.6, 8.2, -5]} color={c.text} />
    </group>
  );
}

/** Hide the view until the reveal, then slide up out of the way. */
function Shutters({ closed, reducedMotion }: { closed: boolean; reducedMotion: boolean }) {
  const panel = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [closed, invalidate]);
  useFrame((_, delta) => {
    if (!panel.current) return;
    const goal = closed ? 0 : 6.2;
    const next = reducedMotion ? goal : THREE.MathUtils.lerp(panel.current.position.y, goal, 1 - Math.exp(-delta * 1.4));
    panel.current.position.y = next;
    if (Math.abs(next - goal) > 0.01) invalidate();
  });
  return (
    <group ref={panel}>
      {[2.45, 3.45, 4.45, 5.45, 6.45].map((y, index) => (
        <mesh key={y} position={[0, y, -5.45]}>
          <boxGeometry args={[12.6, 0.96, 0.08]} />
          <meshStandardMaterial color={index % 2 ? c.surfaceRaised : c.surface} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Space({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const planet = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => earthTexture(), []);
  const stars = useMemo(() => {
    const positions: number[] = [];
    for (let index = 0; index < 220; index += 1) {
      positions.push(((index * 67) % 120) - 60, ((index * 29) % 60) - 8, -42 - (index % 7));
    }
    return new Float32Array(positions);
  }, []);
  useEffect(() => invalidate(), [stage.earth, invalidate]);

  useFrame((_, delta) => {
    const group = planet.current;
    if (!group) return;
    const target = EARTH[stage.earth];
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 0.9);
    const position = new THREE.Vector3(...target.position);
    group.position.lerp(position, blend);
    const scale = THREE.MathUtils.lerp(group.scale.x, target.scale, blend);
    group.scale.setScalar(scale);
    if (!reducedMotion) group.rotation.y += delta * 0.012;
    if (group.position.distanceTo(position) > 0.02 || Math.abs(scale - target.scale) > 0.002) invalidate();
  });

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color={c.text} size={0.16} toneMapped={false} />
      </points>
      <group ref={planet} position={[...EARTH.home.position]} scale={1}>
        <mesh rotation={[0.3, 0, 0.12]}>
          <sphereGeometry args={[19, 64, 48]} />
          <meshStandardMaterial map={texture} roughness={0.9} emissive={c.primary} emissiveIntensity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[19.5, 48, 32]} />
          <meshBasicMaterial color={c.primary} transparent opacity={0.35} side={THREE.BackSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

const PANEL_WIDTH = 1.9;
const PANELS = 4;
const FOLDED = 1.45;

function SolarPanel() {
  return (
    <group position={[PANEL_WIDTH / 2, 0, 0]}>
      <Box size={[PANEL_WIDTH - 0.05, 2.3, 0.07]} color={c.text} radius={0.03} shadow={false} />
      <Box size={[PANEL_WIDTH - 0.2, 2.14, 0.03]} position={[0, 0, 0.04]} color={c.surfaceRaised} rough={0.3} metal={0.5} radius={0.01} shadow={false} />
      {[-0.54, 0, 0.54].map((y) => (
        <Glow key={y} size={[PANEL_WIDTH - 0.2, 0.025, 0.01]} position={[0, y, 0.06]} />
      ))}
      {[-0.42, 0, 0.42].map((x) => (
        <Glow key={x} size={[0.025, 2.14, 0.01]} position={[x, 0, 0.06]} />
      ))}
    </group>
  );
}

function SolarArray({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const panels = useRef<(THREE.Group | null)[][]>([[], []]);
  const open = useRef<number[]>(Array<number>(PANELS).fill(0));
  const invalidate = useThree((state) => state.invalidate);
  const target = stage.array === "large" ? 4 : 1;
  useEffect(() => invalidate(), [target, invalidate]);

  useFrame((_, delta) => {
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 3);
    let moving = false;
    open.current = open.current.map((amount, index) => {
      const goal = index < target ? 1 : 0;
      const next = amount + (goal - amount) * blend;
      if (Math.abs(goal - next) < 0.002) return goal;
      moving = true;
      return next;
    });
    for (const wing of panels.current) {
      let x = 0;
      let z = 0;
      open.current.forEach((amount, index) => {
        const rotation = (1 - amount) * FOLDED * (index % 2 === 0 ? 1 : -1);
        wing[index]?.position.set(x, 0, z);
        wing[index]?.rotation.set(0, rotation, 0);
        x += PANEL_WIDTH * Math.cos(rotation);
        z -= PANEL_WIDTH * Math.sin(rotation);
      });
    }
    if (moving) invalidate();
  });

  return (
    <group position={[0, 4.9, -11]}>
      <Box size={[1, 3.4, 1]} color={c.text} radius={0.14} />
      <Box size={[1.2, 0.2, 1.2]} position={[0, 1.8, 0]} color={c.accent} radius={0.05} />
      <Glow size={[0.5, 0.08, 0.02]} position={[0, 0.8, 0.51]} />
      {[1, -1].map((side, wing) => (
        <group key={side} position={[side * 0.5, 0, 0]} scale={[side, 1, 1]}>
          {Array.from({ length: PANELS }, (_, index) => (
            <group
              key={index}
              ref={(group) => {
                panels.current[wing]![index] = group;
              }}
            >
              <SolarPanel />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

const powerCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.6, 1.9, -5.1),
  new THREE.Vector3(0.9, 0.16, -4),
  new THREE.Vector3(2.4, 0.16, -2.9),
  new THREE.Vector3(3.9, 0.16, -2.9),
  new THREE.Vector3(4.5, 0.8, -2.9),
]);
const lifeCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.6, 1.9, -5.1),
  new THREE.Vector3(-0.9, 0.16, -4),
  new THREE.Vector3(-3.2, 0.16, -3),
  new THREE.Vector3(-5.2, 0.16, -3.4),
  new THREE.Vector3(-5.9, 0.7, -3.6),
]);

function EngineBay({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const chemical = useRef<THREE.Group>(null);
  const electric = useRef<THREE.Group>(null);
  const tank = useRef<THREE.Group>(null);
  const plume = useRef<THREE.Mesh>(null);
  const conduit = useRef<THREE.MeshStandardMaterial>(null);
  const tankMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const bar = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseAt = useRef(1);
  const level = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  const powerTube = useMemo(() => new THREE.TubeGeometry(powerCurve, 80, 0.09, 10), []);
  const lifeTube = useMemo(() => new THREE.TubeGeometry(lifeCurve, 80, 0.09, 10), []);
  const bell = useMemo(() => {
    const points = [
      [0.2, 0],
      [0.26, 0.2],
      [0.45, 0.55],
      [0.72, 0.95],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(points, 32);
  }, []);

  useEffect(() => {
    if (!reducedMotion) pulseAt.current = 0;
    invalidate();
  }, [stage.pulse, stage.array, stage.engine, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 4);
    let moving = false;
    const settle = (group: THREE.Object3D | null, goal: number) => {
      if (!group) return;
      const next = THREE.MathUtils.lerp(group.scale.x, goal, blend);
      group.scale.setScalar(next);
      group.visible = next > 0.02;
      if (Math.abs(next - goal) > 0.003) moving = true;
    };
    settle(chemical.current, stage.engine === "chemical" ? 1 : 0);
    settle(electric.current, stage.engine === "electric" ? 1 : 0);
    settle(tank.current, stage.engine ? 0.42 + stage.tankLevel * 0.78 : 0);

    level.current = THREE.MathUtils.lerp(level.current, stage.powerLevel, blend);
    if (Math.abs(level.current - stage.powerLevel) > 0.002) moving = true;
    const engineUsesPower = stage.engine === "electric" || stage.engine === null;
    if (conduit.current) conduit.current.emissiveIntensity = stage.engine === "chemical" ? 0.1 : 0.15 + level.current * 2.2;
    if (tankMaterial.current) {
      const alarm = stage.tankAlarm && !reducedMotion ? 0.5 + Math.sin(performance.now() * 0.006) * 0.5 : stage.tankAlarm ? 1 : 0;
      tankMaterial.current.emissiveIntensity = alarm * 1.2;
      if (stage.tankAlarm) moving = true;
    }
    if (ring.current) ring.current.emissiveIntensity = engineUsesPower ? 0.15 + level.current * 3 : 0.3;
    if (bar.current) {
      const height = 0.1 + level.current * 1.25;
      bar.current.scale.y = height;
      bar.current.position.y = 1.04 + height / 2;
    }
    if (plume.current) {
      plume.current.visible = stage.burning;
      if (stage.burning) plume.current.scale.setScalar(0.9 + Math.sin(performance.now() * 0.03) * 0.06);
    }
    if (stage.burning) moving = true;
    if (pulseAt.current < 1) {
      pulseAt.current = Math.min(1, pulseAt.current + delta / 1.1);
      moving = true;
    }
    if (pulse.current) {
      pulse.current.visible = pulseAt.current < 1;
      if (pulseAt.current < 1) pulse.current.position.copy(powerCurve.getPointAt(pulseAt.current));
    }
    if (moving) invalidate();
  });

  const plumeColor = stage.engine === "chemical" ? c.accent : c.primary;

  return (
    <group>
      {/* Conduits: the power reaching the engine is visible in the room */}
      <mesh geometry={powerTube}>
        <meshStandardMaterial ref={conduit} color={c.surface} emissive={c.primary} roughness={0.5} />
      </mesh>
      <mesh geometry={lifeTube}>
        <meshStandardMaterial color={c.surface} emissive={c.primary} emissiveIntensity={0.45} roughness={0.5} />
      </mesh>
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshBasicMaterial color={c.text} toneMapped={false} />
      </mesh>

      {/* Table power bar, the same value the meter states */}
      <mesh ref={bar} position={[2.05, 1.2, -0.9]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 20]} />
        <meshStandardMaterial color={c.primary} emissive={c.primary} emissiveIntensity={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Cradle */}
      <group position={[6.4, 0, -2.9]}>
        <Box size={[4.6, 0.3, 3]} position={[0, 0.15, 0]} color={c.background} radius={0.1} />
        <Box size={[0.3, 3.4, 0.3]} position={[-2.2, 1.7, -1.4]} color={c.accent} radius={0.06} />
        <Box size={[0.3, 3.4, 0.3]} position={[2.2, 1.7, -1.4]} color={c.accent} radius={0.06} />
        <Box size={[4.7, 0.3, 0.3]} position={[0, 3.4, -1.4]} color={c.accent} radius={0.06} />
        <Glow size={[1.1, 0.08, 0.06]} position={[0, 3.05, -1.3]} color={stage.moduleWarning ? c.accent : c.success} />

        <group ref={chemical} position={[0, 1.45, 0.1]} scale={0.001}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.95, 1.8, 8, 32]} />
            <meshStandardMaterial color={c.text} roughness={0.55} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.98, 0.98, 0.5, 32]} />
            <meshStandardMaterial color={c.accent} />
          </mesh>
          <mesh geometry={bell} rotation={[0, 0, Math.PI / 2]} position={[-1.65, 0, 0]}>
            <meshStandardMaterial color={c.mutedText} metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={electric} position={[0, 1.45, 0.1]} scale={0.001}>
          <Box size={[2.8, 1.5, 1.7]} color={c.text} radius={0.25} />
          <Box size={[2.84, 0.36, 1.74]} position={[0, -0.32, 0]} color={c.accent} radius={0.06} />
          {[
            [0, 0.42],
            [0, -0.42],
            [0.42, 0],
            [-0.42, 0],
          ].map(([y, z], index) => (
            <mesh key={index} position={[-1.45, y!, z!]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.26, 0.07, 10, 28]} />
              <meshStandardMaterial ref={index === 0 ? ring : undefined} color={c.background} emissive={c.primary} emissiveIntensity={index === 0 ? 1 : 1.4} />
            </mesh>
          ))}
        </group>

        <mesh ref={plume} position={[-2.25, 1.45, 0.1]} rotation={[0, 0, -Math.PI / 2]} visible={false}>
          <coneGeometry args={[0.3, 0.8, 24, 1, true]} />
          <meshBasicMaterial color={plumeColor} transparent opacity={0.75} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* The propellant tank visibly matches the load: huge for chemical, small for electric */}
        <group ref={tank} position={[0, 0.3, -2.3]} scale={0.001}>
          <mesh position={[0, 1.15, 0]} castShadow>
            <sphereGeometry args={[1.15, 32, 24]} />
            <meshStandardMaterial ref={tankMaterial} color={c.mutedText} metalness={0.35} roughness={0.35} emissive={c.danger} emissiveIntensity={0} />
          </mesh>
        </group>

        {/* The chemical engine's propellant line */}
        {stage.engine === "chemical" && (
          <mesh position={[0, 1.2, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 1.5, 14]} />
            <meshStandardMaterial color={c.accent} roughness={0.5} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Hologram({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const texture = useMemo(() => earthTexture(), []);
  const marker = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  // Drawn to fit the table, not to scale. The source drawer says so.
  const apogee = 2.05;
  const perigee = 0.72;
  const target = stage.destination === "geosynchronous" ? 0.46 : 0.27;
  const a = (apogee + perigee) / 2;
  const e = (apogee - perigee) / (apogee + perigee);
  const a2 = (apogee + target) / 2;
  const e2 = (apogee - target) / (apogee + target);

  const pointOn = (angle: number, major: number, eccentricity: number) => {
    const radius = (major * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
    return new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle) * 0.62);
  };

  const orbitLine = useMemo(() => {
    const points = Array.from({ length: 96 }, (_, index) => pointOn((index / 96) * Math.PI * 2, a, e));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 160, 0.018, 6, true);
  }, [a, e]);
  const transferLine = useMemo(() => {
    const points = Array.from({ length: 48 }, (_, index) => pointOn(Math.PI + (index / 47) * Math.PI, a2, e2));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.022, 6);
  }, [a2, e2]);
  useEffect(
    () => () => {
      orbitLine.dispose();
      transferLine.dispose();
    },
    [orbitLine, transferLine],
  );
  useEffect(() => invalidate(), [stage.orbit, stage.progress, stage.destination, invalidate]);

  useFrame((_, delta) => {
    if (root.current) {
      const goal = stage.orbit ? 1.55 : 0.0001;
      root.current.scale.setScalar(reducedMotion ? goal : THREE.MathUtils.lerp(root.current.scale.x, goal, 1 - Math.exp(-delta * 4)));
      root.current.visible = root.current.scale.x > 0.01;
    }
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 1.4);
    progress.current = THREE.MathUtils.lerp(progress.current, stage.progress, blend);
    if (marker.current) marker.current.position.copy(pointOn(Math.PI + progress.current * Math.PI, a2, e2));
    if (Math.abs(progress.current - stage.progress) > 0.002 || (root.current && Math.abs(root.current.scale.x - (stage.orbit ? 1.55 : 0)) > 0.01)) invalidate();
  });

  return (
    <group ref={root} position={[0.5, 3.05, -0.2]} rotation={[0.62, 0, 0]} scale={0.0001}>
      <mesh>
        <sphereGeometry args={[0.17, 32, 24]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh geometry={orbitLine}>
        <meshBasicMaterial color={c.primary} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {stage.destination && (
        <>
          <mesh geometry={transferLine}>
            <meshBasicMaterial color={c.accent} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[target, 0.014, 6, 64]} />
            <meshBasicMaterial color={c.success} toneMapped={false} />
          </mesh>
        </>
      )}
      <group ref={marker} position={[-apogee, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.095, 20, 16]} />
          <meshBasicMaterial color={c.accent} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.17, 0.012, 6, 32]} />
          <meshBasicMaterial color={c.text} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function MissionTable() {
  return (
    <group>
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.85, 3.15, 1.04, 64]} />
        <meshStandardMaterial color={c.text} roughness={0.6} />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2 + Math.PI / 10;
        return (
          <Box
            key={index}
            size={[1.1, 0.62, 0.22]}
            position={[Math.sin(angle) * 3.02, 0.52, Math.cos(angle) * 3.02]}
            rotation={[0, angle, 0]}
            color={index % 2 === 0 ? c.accent : c.background}
            radius={0.07}
            shadow={false}
          />
        );
      })}
      <mesh position={[0, 1.03, 0]} receiveShadow>
        <cylinderGeometry args={[2.68, 2.68, 0.06, 64]} />
        <meshStandardMaterial color={c.background} roughness={1} />
      </mesh>
      <mesh position={[0, 1.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.45, 0.04, 8, 96]} />
        <meshBasicMaterial color={c.primary} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial color={c.primary} transparent opacity={0.08} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Consoles() {
  const orbit = useMemo(() => screenTexture("orbit"), []);
  const dish = useMemo(() => screenTexture("dish"), []);
  const bars = useMemo(() => screenTexture("bars"), []);
  return (
    <group position={[-8.4, 0, -3.6]}>
      <Box size={[5, 1.6, 1.8]} position={[0, 0.8, 0]} color={c.text} radius={0.14} />
      <Box size={[5.04, 0.24, 1.84]} position={[0, 0.34, 0]} color={c.accent} radius={0.05} shadow={false} />
      <Box size={[4.6, 0.12, 0.9]} position={[0, 1.65, 0.28]} color={c.background} radius={0.05} shadow={false} />
      <Glow size={[1, 0.05, 0.3]} position={[-1.1, 1.73, 0.34]} />
      <Glow size={[0.5, 0.05, 0.3]} position={[0.2, 1.73, 0.34]} color={c.accent} />
      {[
        { x: -1.75, texture: dish },
        { x: 0, texture: orbit },
        { x: 1.75, texture: bars },
      ].map(({ x, texture }) => (
        <group key={x} position={[x, 2.75, -0.5]}>
          <Box size={[1.7, 1.2, 0.14]} color={c.surfaceRaised} radius={0.07} />
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[1.5, 1.02]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const CAPSULE_RADIUS = 2.15;
const CAPSULE_HEIGHT = 3.7;
const CAPSULE_MOUTH = 1.05;

function Capsule({ open, reducedMotion }: { open: boolean; reducedMotion: boolean }) {
  const door = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [open, invalidate]);
  useFrame((_, delta) => {
    if (!door.current) return;
    const goal = open ? 2.25 : 0;
    const next = reducedMotion ? goal : THREE.MathUtils.lerp(door.current.rotation.y, goal, 1 - Math.exp(-delta * 3));
    door.current.rotation.y = next;
    if (Math.abs(next - goal) > 0.003) invalidate();
  });
  return (
    <group position={[9.9, 0, -0.9]} rotation={[0, -0.62, 0]}>
      {/* Plinth */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[CAPSULE_RADIUS + 0.35, CAPSULE_RADIUS + 0.5, 0.4, 48]} />
        <meshStandardMaterial color={c.text} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[CAPSULE_RADIUS + 0.12, CAPSULE_RADIUS + 0.12, 0.14, 48]} />
        <meshStandardMaterial color={c.accent} />
      </mesh>

      {/* Shell, open at the front */}
      <mesh position={[0, 0.5 + CAPSULE_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[CAPSULE_RADIUS, CAPSULE_RADIUS, CAPSULE_HEIGHT, 48, 1, true, CAPSULE_MOUTH, Math.PI * 2 - CAPSULE_MOUTH * 2]} />
        <meshStandardMaterial color={c.text} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Warm interior and couch */}
      <mesh position={[0, 0.5 + CAPSULE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[CAPSULE_RADIUS - 0.05, CAPSULE_RADIUS - 0.05, CAPSULE_HEIGHT, 48, 1, true]} />
        <meshStandardMaterial color={c.accent} roughness={0.7} side={THREE.BackSide} emissive={c.accent} emissiveIntensity={0.3} />
      </mesh>
      <Box size={[1.5, 0.7, 1.8]} position={[0, 0.9, -0.5]} color={c.text} radius={0.22} />
      <Box size={[1.5, 2.1, 0.5]} position={[0, 1.9, -1.35]} rotation={[-0.2, 0, 0]} color={c.text} radius={0.2} />
      <Glow size={[1, 0.08, 0.05]} position={[0, 3.6, -1.6]} color={c.text} />

      {/* Dome */}
      <mesh position={[0, 0.5 + CAPSULE_HEIGHT, 0]} castShadow>
        <sphereGeometry args={[CAPSULE_RADIUS, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c.text} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5 + CAPSULE_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CAPSULE_RADIUS + 0.02, 0.09, 10, 64]} />
        <meshStandardMaterial color={c.accent} />
      </mesh>

      {/* The door slides around the shell, from closed to behind */}
      <group ref={door} position={[0, 0.5 + CAPSULE_HEIGHT / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[CAPSULE_RADIUS + 0.08, CAPSULE_RADIUS + 0.08, CAPSULE_HEIGHT, 32, 1, true, -CAPSULE_MOUTH, CAPSULE_MOUTH * 2]} />
          <meshStandardMaterial color={c.text} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[CAPSULE_RADIUS + 0.1, CAPSULE_RADIUS + 0.1, 1.1, 24, 1, true, -0.55, 1.1]} />
          <meshStandardMaterial color={c.background} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[CAPSULE_RADIUS + 0.11, CAPSULE_RADIUS + 0.11, 0.25, 24, 1, true, -CAPSULE_MOUTH, CAPSULE_MOUTH * 2]} />
          <meshStandardMaterial color={c.accent} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function Props({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const wrench = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const wrenchGeometry = useMemo(() => new THREE.ExtrudeGeometry(wrenchShape(), { depth: 0.09, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 }), []);
  useEffect(() => invalidate(), [stage.act, invalidate]);

  // The wrench was never secured. It drifts a little further along with each act of the story.
  const route: Vec3[] = [
    [-5.3, 1.9, 5.1],
    [-5, 2.7, 3.2],
    [1.6, 3.9, 3.4],
    [-2.6, 5, 0.6],
    [-1.3, 5.7, -2],
    [0.8, 6.3, -3],
  ];

  useFrame((_, delta) => {
    if (!wrench.current) return;
    const goal = new THREE.Vector3(...(route[Math.min(stage.act, route.length - 1)] as Vec3));
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 0.8);
    wrench.current.position.lerp(goal, blend);
    if (!reducedMotion) wrench.current.rotation.z += delta * 0.18;
    if (wrench.current.position.distanceTo(goal) > 0.01) invalidate();
  });

  return (
    <group>
      <group position={[-7.4, 0, 5.1]}>
        <Box size={[5.2, 1.7, 2.4]} position={[0, 0.85, 0]} color={c.text} radius={0.16} />
        <Box size={[0.5, 1.72, 2.42]} position={[2.45, 0.85, 0]} color={c.accent} radius={0.1} shadow={false} />
        {/* Sealed coffee bulb */}
        <group position={[0.6, 2.28, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.56, 32, 24]} />
            <meshStandardMaterial color={c.text} transparent opacity={0.35} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.14, 0]} scale={[0.9, 0.62, 0.9]}>
            <sphereGeometry args={[0.52, 32, 24]} />
            <meshStandardMaterial color="#4A2A1A" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.24, 0.26, 0.2, 20]} />
            <meshStandardMaterial color={c.mutedText} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      <group ref={wrench} position={[...route[0]!]} rotation={[0.4, 0.5, 0.3]} scale={0.8}>
        <mesh geometry={wrenchGeometry} castShadow>
          <meshStandardMaterial color={c.mutedText} metalness={0.3} roughness={0.45} />
        </mesh>
        <Glow size={[0.45, 0.03, 0.02]} position={[-0.1, 0, 0.1]} />
      </group>

      {/* Wall shelf and plant, from the approved workshop environment */}
      <group position={[-10.4, 5.7, -4.9]}>
        <Box size={[3.4, 0.18, 0.8]} color={c.accent} radius={0.04} />
        <mesh position={[-0.6, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.22, 0.5, 20]} />
          <meshStandardMaterial color={c.accent} />
        </mesh>
        {[-0.5, 0.2, 0.9, 1.6, 2.3, 3].map((angle, index) => (
          <mesh key={index} position={[-0.6 + Math.cos(angle) * 0.34, 0.92 + (index % 2) * 0.25, Math.sin(angle) * 0.34]} rotation={[0.3, angle, 0.7]} scale={[1, 0.34, 0.6]} castShadow>
            <sphereGeometry args={[0.42, 12, 10]} />
            <meshStandardMaterial color={c.success} roughness={0.8} />
          </mesh>
        ))}
        <Box size={[0.26, 1, 0.5]} position={[0.5, 0.55, 0]} color={c.primary} radius={0.03} />
        <Box size={[0.26, 0.86, 0.5]} position={[0.82, 0.48, 0]} color={c.text} radius={0.03} />
        <Box size={[0.26, 1.06, 0.5]} position={[1.14, 0.58, 0]} color={c.surfaceRaised} radius={0.03} />
      </group>
    </group>
  );
}

interface SceneProps {
  stage: StageState;
  reducedMotion: boolean;
  labels: SectorLabels;
  crew: readonly CrewMember[];
  names: readonly string[];
}

function Scene({ stage, reducedMotion, labels, crew, names }: SceneProps) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [stage, invalidate]);
  return (
    <>
      <color attach="background" args={[c.background]} />
      <fog attach="fog" args={[c.background, 30, 90]} />
      <CameraRig stage={stage} reducedMotion={reducedMotion} />
      <Lights mood={stage.mood} />
      <Space stage={stage} reducedMotion={reducedMotion} />
      <Depot visible={stage.depot} reducedMotion={reducedMotion} />
      <SolarArray stage={stage} reducedMotion={reducedMotion} />
      <Room />
      <Shutters closed={stage.shutters} reducedMotion={reducedMotion} />
      <Sectors labels={labels} active={stage.sector} integrated={stage.integrated} signs={stage.signs} reducedMotion={reducedMotion} />
      <MissionTable />
      <Hologram stage={stage} reducedMotion={reducedMotion} />
      <EngineBay stage={stage} reducedMotion={reducedMotion} />
      <Consoles />
      <Capsule open={stage.capsuleOpen} reducedMotion={reducedMotion} />
      <Props stage={stage} reducedMotion={reducedMotion} />
      <Nadir stage={stage} reducedMotion={reducedMotion} />
      {stage.crewVisible && <Crew crew={crew} names={names} review={stage.shot === "review" || stage.shot === "reviewRtl"} pulse={stage.pulse} reducedMotion={reducedMotion} />}
      <Rivo stage={stage} reducedMotion={reducedMotion} />
    </>
  );
}

useLoader.preload(THREE.TextureLoader, [...NADIR_LAYERS, ...RIVO_FACES]);

export default function Stage3D({
  onReady,
  onContextLost,
  ...scene
}: SceneProps & {
  onReady: () => void;
  onContextLost: () => void;
}) {
  const { reducedMotion } = scene;
  return (
    <Canvas
      flat
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ position: SHOTS.wide.position, fov: 40, far: 140 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
        onReady();
      }}
    >
      <Scene {...scene} />
    </Canvas>
  );
}
