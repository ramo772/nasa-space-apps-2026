import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { StageState } from "./stageState";
import { c } from "./textures";

const FACE_NAMES = ["neutral", "curious", "deadpan", "warning", "pride"] as const;
export const RIVO_FACES = FACE_NAMES.map((name) => `${import.meta.env.BASE_URL}characters/rivo-${name}.webp`);

export const RIVO_POSITIONS = {
  title: [-1.3, 3.6, 3.2],
  review: [-1.5, 3.7, 2.2],
  table: [3.7, 2.7, 3],
  tableRtl: [4.6, 5.4, -0.6],
  window: [-6.4, 4.5, 0.2],
  engine: [0.1, 3.8, -0.8],
  capsule: [4.1, 4.4, 2.2],
} as const;

const RADIUS = 0.8;

/** Built from the approved RIVO sheet: cream shell, navy seams, orange side sensors, cyan channels. */
export function Rivo({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const textures = useLoader(THREE.TextureLoader, RIVO_FACES);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const face = useRef<THREE.MeshBasicMaterial>(null);
  const tilt = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const lastFace = useRef(stage.rivoFace);

  useEffect(() => {
    for (const texture of textures) texture.colorSpace = THREE.SRGBColorSpace;
  }, [textures]);

  useEffect(() => {
    if (face.current) {
      face.current.map = textures[FACE_NAMES.indexOf(stage.rivoFace)] ?? null;
      face.current.needsUpdate = true;
    }
    if (lastFace.current !== stage.rivoFace) {
      lastFace.current = stage.rivoFace;
      if (!reducedMotion) tilt.current = 1;
    }
    invalidate();
  }, [stage.rivoFace, textures, reducedMotion, invalidate]);

  useFrame((state, delta) => {
    if (!group.current || !body.current) return;
    const goal = new THREE.Vector3(...RIVO_POSITIONS[stage.rivo]);
    group.current.position.lerp(goal, reducedMotion ? 1 : 1 - Math.exp(-delta * 2.2));

    // RIVO communicates with small movements: a slow hover and a small tilt, never a broad gesture.
    tilt.current = Math.max(0, tilt.current - delta * 1.8);
    const time = state.clock.elapsedTime;
    body.current.position.y = reducedMotion ? 0 : Math.sin(time * 1.5) * 0.07;
    body.current.rotation.z = Math.sin(tilt.current * Math.PI) * 0.22;
    const toCamera = Math.atan2(state.camera.position.x - group.current.position.x, state.camera.position.z - group.current.position.z);
    body.current.rotation.y = toCamera + (reducedMotion ? 0 : Math.sin(time * 0.6) * 0.05);
    body.current.rotation.x = 0.1;
    if (ring.current) ring.current.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.04);
    if (group.current.position.distanceTo(goal) > 0.01) invalidate();
  });

  return (
    <group ref={group} position={[...RIVO_POSITIONS.table]}>
      <group ref={body}>
        <mesh castShadow>
          <sphereGeometry args={[RADIUS, 48, 36]} />
          <meshStandardMaterial color={c.text} roughness={0.55} />
        </mesh>

        {/* Curved display face, showing the approved face states */}
        <mesh>
          <sphereGeometry args={[RADIUS * 1.012, 40, 24, Math.PI / 2 - 0.92, 1.84, Math.PI / 2 - 0.58, 1.16]} />
          <meshBasicMaterial ref={face} map={textures[0] ?? null} toneMapped={false} />
        </mesh>

        {/* Navy seams and cyan light channels */}
        <mesh rotation={[Math.PI / 2 + 0.72, 0, 0]}>
          <torusGeometry args={[RADIUS * 0.72, 0.012, 6, 48]} />
          <meshStandardMaterial color={c.background} />
        </mesh>
        <mesh position={[0, RADIUS * 0.82, 0.3]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.06]} />
          <meshBasicMaterial color={c.primary} toneMapped={false} />
        </mesh>
        <mesh position={[0, -RADIUS * 0.72, 0.42]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[0.36, 0.1, 0.04]} />
          <meshBasicMaterial color={c.primary} toneMapped={false} />
        </mesh>

        {/* Orange side sensors */}
        {[1, -1].map((side) => (
          <group key={side} position={[side * RADIUS * 0.96, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.31, 0.36, 0.22, 32]} />
              <meshStandardMaterial color={c.accent} roughness={0.45} />
            </mesh>
            <mesh position={[0, side * 0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.19, 0.035, 10, 32]} />
              <meshBasicMaterial color={c.primary} toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* Orange bumpers */}
        <mesh position={[0, -RADIUS * 0.94, 0.08]} scale={[1, 0.3, 0.8]}>
          <sphereGeometry args={[0.3, 24, 16]} />
          <meshStandardMaterial color={c.accent} roughness={0.5} />
        </mesh>
        <mesh position={[0.38, RADIUS * 0.74, 0.28]} rotation={[0.3, 0.3, -0.55]} scale={[1, 0.25, 0.7]}>
          <sphereGeometry args={[0.2, 20, 14]} />
          <meshStandardMaterial color={c.accent} roughness={0.5} />
        </mesh>

        {/* Dorsal sensor fin */}
        <group position={[-0.12, RADIUS * 0.94, -0.24]} rotation={[-0.45, 0, 0.32]}>
          <mesh position={[0, 0.24, 0]} scale={[0.4, 1, 1]}>
            <coneGeometry args={[0.22, 0.62, 20]} />
            <meshStandardMaterial color={c.text} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.5, 0]} scale={[0.4, 1, 1]}>
            <coneGeometry args={[0.1, 0.26, 16]} />
            <meshStandardMaterial color={c.accent} roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0.2, 0.03]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.02, 0.34, 0.04]} />
            <meshBasicMaterial color={c.primary} toneMapped={false} />
          </mesh>
        </group>

        {/* Two small utility arms */}
        {[1, -1].map((side) => (
          <group key={side} position={[side * 0.58, -0.5, 0.2]} rotation={[0.2, 0, side * -0.9]}>
            <mesh position={[0, -0.14, 0]}>
              <cylinderGeometry args={[0.07, 0.085, 0.3, 14]} />
              <meshStandardMaterial color={c.text} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.075, 14, 10]} />
              <meshStandardMaterial color={c.background} />
            </mesh>
            {[1, -1].map((claw) => (
              <mesh key={claw} position={[claw * 0.06, -0.4, 0]} rotation={[0, 0, claw * 0.4]}>
                <boxGeometry args={[0.04, 0.16, 0.05]} />
                <meshStandardMaterial color={c.accent} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Cyan hover rings */}
      <group ref={ring} position={[0, -1.15, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.03, 8, 48]} />
          <meshBasicMaterial color={c.primary} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
          <torusGeometry args={[0.34, 0.02, 8, 32]} />
          <meshBasicMaterial color={c.primary} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
