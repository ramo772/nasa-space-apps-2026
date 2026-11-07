import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { c } from "./textures";

type Vec3 = [number, number, number];

/** A hull module. Rotated off-true on purpose: the depot is compatible, not tidy. */
function Module({ position, rotation = [0, 0, 0], size, color = c.mutedText }: { position: Vec3; rotation?: Vec3; size: Vec3; color?: string }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.15} emissive={color} emissiveIntensity={0.28} />
    </mesh>
  );
}

function Drum({ position, rotation = [0, 0, 0], radius, length, color = c.mutedText }: { position: Vec3; rotation?: Vec3; radius: number; length: number; color?: string }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 20]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} emissive={color} emissiveIntensity={0.28} />
    </mesh>
  );
}

function Light({ position, color = c.primary, size = 0.16 }: { position: Vec3; color?: string; size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 10, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function WarmWindows({ position, rotation = [0, 0, 0], count }: { position: Vec3; rotation?: Vec3; count: number }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[index * 0.5, 0, 0]}>
          <planeGeometry args={[0.32, 0.26]} />
          <meshBasicMaterial color={c.accent} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function SolarWing({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Module position={[1.9, 0, 0]} size={[3.8, 0.1, 0.1]} color={c.text} />
      {[0.7, 1.9, 3.1].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]}>
          <boxGeometry args={[1.05, 1, 0.04]} />
          <meshStandardMaterial color={c.surfaceRaised} metalness={0.5} roughness={0.3} emissive={c.primary} emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function RoboticArm({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Drum position={[0, 0.9, 0]} radius={0.13} length={1.8} color={c.text} />
      <Light position={[0, 1.85, 0]} color={c.accent} size={0.2} />
      <group position={[0, 1.85, 0]} rotation={[0, 0, -1]}>
        <Drum position={[0, 0.8, 0]} radius={0.11} length={1.6} color={c.text} />
        <Module position={[0, 1.7, 0]} size={[0.5, 0.26, 0.26]} color={c.accent} />
      </group>
    </group>
  );
}

/**
 * The M.E.A.T.-A.R.O.I.D. depot, seen from the window: a mechanical asteroid of mismatched, compatible modules.
 * It's fictional, built only from basic shapes, and carries no agency marks.
 */
export function Depot({ visible, reducedMotion }: { visible: boolean; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [visible, invalidate]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const goal = visible ? 1 : 0;
    const next = reducedMotion ? goal : THREE.MathUtils.lerp(root.current.scale.x, goal, 1 - Math.exp(-delta * 1.6));
    root.current.scale.setScalar(Math.max(next, 0.0001));
    root.current.visible = next > 0.01;
    if (ring.current && !reducedMotion) ring.current.rotation.z += delta * 0.18;
    if (Math.abs(next - goal) > 0.002) invalidate();
  });

  return (
    <group ref={root} position={[8.6, 3.2, -24]} scale={0.0001}>
      {/* Main body: blocks and drums bolted together at odd angles */}
      <Module position={[0, 1.6, 0]} rotation={[0.2, 0.4, 0.25]} size={[6, 3.4, 4]} />
      <Module position={[-3.8, 0.4, 0.8]} rotation={[-0.3, 0.2, -0.5]} size={[3.4, 2.4, 3]} color={c.border} />
      <Module position={[3.8, 2.8, -0.5]} rotation={[0.5, -0.3, 0.7]} size={[3.2, 2.2, 2.6]} color={c.text} />
      <Module position={[1, -1.2, 1]} rotation={[0.1, 0.7, 0.4]} size={[3, 2, 2.6]} color={c.surfaceRaised} />
      <Drum position={[-2.4, 3.6, 0]} rotation={[0.4, 0, 1.1]} radius={1.1} length={3.8} />
      <Drum position={[5.6, 0.2, 0.6]} rotation={[0.2, 0.3, 0.4]} radius={0.8} length={3.2} color={c.border} />

      {/* Replacement panels and scars */}
      <Module position={[-0.8, 2.2, 2.1]} rotation={[0.2, 0.4, 0.25]} size={[1.4, 0.9, 0.06]} color={c.accent} />
      <Module position={[1.6, 0.5, 2.25]} rotation={[0.2, 0.4, 0.25]} size={[1.1, 0.7, 0.06]} color={c.text} />
      <Module position={[-4.3, 0.4, 2.3]} rotation={[-0.3, 0.2, -0.5]} size={[1.2, 0.18, 0.06]} color={c.background} />
      <Module position={[0.6, 2.9, 2.2]} rotation={[0.2, 0.4, 0.75]} size={[1.6, 0.12, 0.06]} color={c.background} />
      <Module position={[4, 3.3, 0.9]} rotation={[0.5, -0.3, 0.7]} size={[1.6, 0.18, 0.06]} color={c.accent} />

      <WarmWindows position={[-1.8, 1.1, 2.2]} rotation={[0.2, 0.4, 0.25]} count={5} />
      <WarmWindows position={[-5, 0.9, 2.3]} rotation={[-0.3, 0.2, -0.5]} count={3} />

      {/* Rotating service ring */}
      <group ref={ring} position={[0.5, 4.8, -0.5]} rotation={[1.2, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[3.4, 0.2, 10, 48]} />
          <meshStandardMaterial color={c.text} roughness={0.6} />
        </mesh>
        {[0, 1.57, 3.14, 4.71].map((angle) => (
          <Light key={angle} position={[Math.cos(angle) * 3.4, Math.sin(angle) * 3.4, 0.25]} />
        ))}
      </group>

      {/* Solar wings at unusual angles */}
      <SolarWing position={[-5, 3.6, 0.2]} rotation={[0.5, 0.2, 2.5]} />
      <SolarWing position={[6, 3.6, -0.6]} rotation={[-0.4, -0.3, 0.55]} />
      <SolarWing position={[-4.8, -1, 0.6]} rotation={[0.2, 0.5, 3.7]} />

      {/* Robotic arms and a docking tunnel */}
      <RoboticArm position={[2.6, 3.2, 1.2]} rotation={[0.2, 0.3, 0.3]} />
      <RoboticArm position={[-2.2, -0.4, 2]} rotation={[-0.4, 0.2, 2.5]} />
      <Drum position={[0.4, -3, 4.5]} rotation={[1.25, 0, 0.1]} radius={0.75} length={9} color={c.mutedText} />
      <mesh position={[0.5, -3.5, 8.6]} rotation={[1.25, 0, 0]}>
        <torusGeometry args={[0.85, 0.12, 10, 32]} />
        <meshBasicMaterial color={c.accent} toneMapped={false} />
      </mesh>

      <Light position={[-6.6, 1.2, 0.8]} />
      <Light position={[7, 1.4, 0.6]} />
      <Light position={[-1.5, -2.2, 2]} />
      <Light position={[3.4, 4.4, 1.2]} />
    </group>
  );
}
