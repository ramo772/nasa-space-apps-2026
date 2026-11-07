import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Sector } from "./stageState";
import { c } from "./textures";

type Vec3 = [number, number, number];

export type SectorLabels = Record<Sector, string>;

function signTexture(text: string, active: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = active ? c.accent : c.background;
    context.beginPath();
    context.roundRect(4, 4, 632, 120, 24);
    context.fill();
    context.strokeStyle = active ? c.text : c.primary;
    context.lineWidth = 6;
    context.stroke();
    context.fillStyle = active ? c.textOnLight : c.text;
    context.font = "700 54px 'Space Grotesk', Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 320, 68, 590);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Sign({ text, active, position, rotation, size = 3 }: { text: string; active: boolean; position: Vec3; rotation?: Vec3; size?: number }) {
  const texture = useMemo(() => signTexture(text, active), [text, active]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size, size / 5]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

const SIGNS: Record<Sector, { position: Vec3; rotation?: Vec3; size?: number }> = {
  table: { position: [0, 0.3, 3.25], size: 1.9 },
  propulsion: { position: [6.4, 4.1, -4] },
  spine: { position: [0, 8.1, -4.85] },
  comms: { position: [-11.6, 6.1, -1.4], rotation: [0, 0.5, 0] },
  storage: { position: [12.4, 7.2, -4.2], rotation: [0, -0.25, 0] },
  docking: { position: [9.2, 7, -0.4], rotation: [0, -0.62, 0] },
};

/** Interior of the strange depot: tilted rooms, a loft, storage, and a docking ring. */
function DepotInterior() {
  return (
    <group>
      {/* Communications Loft: a tilted platform with a dish, up on the left wall */}
      <group position={[-11.6, 6.9, -2.2]} rotation={[0, 0.5, 0.08]}>
        <mesh>
          <boxGeometry args={[4.6, 0.2, 1.8]} />
          <meshStandardMaterial color={c.surfaceRaised} />
        </mesh>
        <mesh position={[1, 1.1, 0.1]} rotation={[0.9, 0.3, 0]}>
          <sphereGeometry args={[0.9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          <meshStandardMaterial color={c.text} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
        <mesh position={[1, 0.5, 0.1]}>
          <cylinderGeometry args={[0.07, 0.1, 0.9, 10]} />
          <meshStandardMaterial color={c.mutedText} />
        </mesh>
        <mesh position={[1.1, 1.7, 0.75]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshBasicMaterial color={c.accent} toneMapped={false} />
        </mesh>
      </group>

      {/* Module Storage: racks set at an angle against the right wall */}
      <group position={[11.2, 0, -3.8]} rotation={[0, -0.25, 0.03]}>
        {[1.1, 2.9, 4.7].map((y) => (
          <group key={y} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[3.4, 0.14, 1.3]} />
              <meshStandardMaterial color={c.accent} />
            </mesh>
            {[-1, 0, 1].map((x) => (
              <mesh key={x} position={[x, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.32, 0.36, 6, 14]} />
                <meshStandardMaterial color={x === 0 ? c.primary : c.text} roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Docking Ring: the hatch the automatic system connected to */}
      <mesh position={[9.9, 2.6, -0.9]} rotation={[0, -0.62, 0]}>
        <torusGeometry args={[3.1, 0.2, 12, 64]} />
        <meshStandardMaterial color={c.accent} roughness={0.5} />
      </mesh>

      {/* A second window, at an unexpected angle */}
      <group position={[-13.9, 5, 2]} rotation={[0, Math.PI / 2, 0.3]}>
        <mesh>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial color={c.background} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.5, 0.14, 10, 40]} />
          <meshStandardMaterial color={c.text} />
        </mesh>
        <mesh position={[0.5, -0.5, 0.02]}>
          <circleGeometry args={[0.5, 24]} />
          <meshBasicMaterial color={c.primary} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Loose things, drifting. They show microgravity without pretending the floor has gravity. */
function Drifters({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(
    () => [
      { position: [-2.4, 5.4, 1.4], speed: 0.31, size: 0.09, color: c.mutedText },
      { position: [3.2, 6.1, 0.6], speed: 0.23, size: 0.12, color: c.accent },
      { position: [-6.4, 4.6, -1.2], speed: 0.27, size: 0.08, color: c.text },
      { position: [1, 7, 1.8], speed: 0.19, size: 0.1, color: c.primary },
      { position: [6.4, 5.4, 1.6], speed: 0.35, size: 0.08, color: c.mutedText },
    ],
    [],
  );
  useFrame((state) => {
    if (reducedMotion || !group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((child, index) => {
      const item = items[index]!;
      child.position.y = item.position[1]! + Math.sin(time * item.speed + index) * 0.5;
      child.position.x = item.position[0]! + Math.cos(time * item.speed * 0.8 + index) * 0.5;
      child.rotation.x = time * item.speed;
      child.rotation.y = time * item.speed * 0.7;
    });
  });
  return (
    <group ref={group}>
      {items.map((item, index) => (
        <mesh key={index} position={item.position as Vec3}>
          <boxGeometry args={[item.size * 2.4, item.size, item.size]} />
          <meshStandardMaterial color={item.color} metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** Wall lights that come on one after another when the whole system is integrated. */
function IntegrationLights({ on, reducedMotion }: { on: boolean; reducedMotion: boolean }) {
  const lights = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const started = useRef<number | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    started.current = null;
    invalidate();
  }, [on, invalidate]);
  useFrame((state) => {
    if (on && started.current === null) started.current = state.clock.elapsedTime;
    const elapsed = started.current === null ? 0 : state.clock.elapsedTime - started.current;
    let moving = false;
    lights.current.forEach((material, index) => {
      if (!material) return;
      const lit = on && (reducedMotion || elapsed > index * 0.16);
      material.color.set(lit ? c.success : c.border);
      if (on && !lit) moving = true;
    });
    if (moving) invalidate();
  });
  return (
    <group>
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={index} position={[-6.6 + index * 1.2, 0.45, -5.18]}>
          <boxGeometry args={[0.8, 0.12, 0.05]} />
          <meshBasicMaterial
            ref={(material) => {
              lights.current[index] = material;
            }}
            color={c.border}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Sectors({ labels, active, integrated, signs, reducedMotion }: { labels: SectorLabels; active: Sector | null; integrated: boolean; signs: boolean; reducedMotion: boolean }) {
  return (
    <group>
      <DepotInterior />
      <Drifters reducedMotion={reducedMotion} />
      <IntegrationLights on={integrated} reducedMotion={reducedMotion} />
      {signs &&
        (Object.keys(SIGNS) as Sector[]).map((sector) => (
          <Sign key={sector} text={labels[sector]} active={active === sector} {...SIGNS[sector]} />
        ))}
    </group>
  );
}
