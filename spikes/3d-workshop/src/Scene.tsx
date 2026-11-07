import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import tokens from "../../../design/tokens.json";
import { consequence, MAX_ENGINE_KW, openPanels, type ArrayKw } from "./draft";

const c = tokens.color;
const PANEL_WIDTH = 1.45;
const PANELS_PER_WING = 4;
const FOLDED_ANGLE = 1.45; // radians

/** Layout for one accordion wing. Each panel starts where the previous panel ends. */
function layoutWing(open: readonly number[], panels: readonly (THREE.Group | null)[]) {
  let x = 0;
  let z = 0;
  open.forEach((amount, index) => {
    const rotation = (1 - amount) * FOLDED_ANGLE * (index % 2 === 0 ? 1 : -1);
    panels[index]?.position.set(x, 0, z);
    panels[index]?.rotation.set(0, rotation, 0);
    x += PANEL_WIDTH * Math.cos(rotation);
    z -= PANEL_WIDTH * Math.sin(rotation);
  });
}

function SolarPanel() {
  return (
    <group position={[PANEL_WIDTH / 2, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[PANEL_WIDTH - 0.04, 1.9, 0.05]} />
        <meshStandardMaterial color={c.text} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[PANEL_WIDTH - 0.16, 1.76, 0.02]} />
        <meshStandardMaterial color={c.surfaceRaised} metalness={0.4} roughness={0.35} />
      </mesh>
      {[-0.44, 0, 0.44].map((y) => (
        <mesh key={y} position={[0, y, 0.045]}>
          <boxGeometry args={[PANEL_WIDTH - 0.16, 0.025, 0.005]} />
          <meshBasicMaterial color={c.primary} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.025, 1.76, 0.005]} />
        <meshBasicMaterial color={c.primary} />
      </mesh>
    </group>
  );
}

interface Animated {
  panels: (THREE.Group | null)[][];
  open: number[];
  engineGlow: THREE.MeshStandardMaterial | null;
  conduitGlow: THREE.MeshStandardMaterial | null;
  engineBar: THREE.Mesh | null;
  pulse: THREE.Mesh | null;
  engineLevel: number;
  pulseAt: number;
}

const engineCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.5, 2.0, -4.9),
  new THREE.Vector3(0.9, 0.18, -3.6),
  new THREE.Vector3(1.8, 0.18, -2.1),
  new THREE.Vector3(3.6, 0.18, -2.2),
  new THREE.Vector3(5.1, 0.75, -2.2),
]);
const lifeSupportCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.5, 2.0, -4.9),
  new THREE.Vector3(-0.9, 0.18, -3.6),
  new THREE.Vector3(-1.8, 0.18, -2.1),
  new THREE.Vector3(-3.6, 0.18, -2.2),
  new THREE.Vector3(-5.1, 0.75, -2.2),
]);

const STAR_POSITIONS = (() => {
  const positions: number[] = [];
  for (let index = 0; index < 90; index += 1) {
    // A fixed sequence, so the sky is identical on every load.
    const x = ((index * 37) % 90) - 45;
    const y = ((index * 53) % 34) + 1;
    positions.push(x, y, -44);
  }
  return new Float32Array(positions);
})();

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={c.surface} roughness={0.85} />
    </mesh>
  );
}

function Room() {
  return (
    <group>
      {/* Floor and ceiling */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[22, 0.1, 18]} />
        <meshStandardMaterial color={c.surfaceRaised} roughness={0.9} />
      </mesh>
      <Wall position={[0, 8.05, 0]} size={[22, 0.1, 18]} />

      {/* Back wall around the window: x -5 to 5, y 2 to 6.8 */}
      <Wall position={[-8, 4, -5]} size={[6, 8, 0.4]} />
      <Wall position={[8, 4, -5]} size={[6, 8, 0.4]} />
      <Wall position={[0, 1, -5]} size={[10, 2, 0.4]} />
      <Wall position={[0, 7.4, -5]} size={[10, 1.2, 0.4]} />
      <Wall position={[-11, 4, 0]} size={[0.4, 8, 18]} />
      <Wall position={[11, 4, 0]} size={[0.4, 8, 18]} />

      {/* Window frame */}
      {[
        { position: [0, 2.02, -4.72], size: [10.3, 0.16, 0.2], color: c.text },
        { position: [0, 6.78, -4.72], size: [10.3, 0.16, 0.2], color: c.text },
        { position: [-5.08, 4.4, -4.72], size: [0.16, 4.9, 0.2], color: c.text },
        { position: [5.08, 4.4, -4.72], size: [0.16, 4.9, 0.2], color: c.text },
        { position: [-1.67, 4.4, -4.78], size: [0.06, 4.8, 0.06], color: c.text },
        { position: [1.67, 4.4, -4.78], size: [0.06, 4.8, 0.06], color: c.text },
        { position: [-4.7, 1.9, -4.6], size: [1.1, 0.14, 0.2], color: c.accent },
        { position: [4.7, 1.9, -4.6], size: [1.1, 0.14, 0.2], color: c.accent },
      ].map((bar, index) => (
        <mesh key={index} position={bar.position as [number, number, number]}>
          <boxGeometry args={bar.size as [number, number, number]} />
          <meshStandardMaterial color={bar.color} />
        </mesh>
      ))}

      {/* Ceiling light */}
      <mesh position={[0, 7.75, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.09, 12, 48]} />
        <meshBasicMaterial color={c.primary} />
      </mesh>
      <mesh position={[0, 7.9, -0.5]}>
        <cylinderGeometry args={[1.9, 1.9, 0.25, 40]} />
        <meshStandardMaterial color={c.text} />
      </mesh>
    </group>
  );
}

function Outside() {
  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[STAR_POSITIONS, 3]} />
        </bufferGeometry>
        <pointsMaterial color={c.text} size={0.2} sizeAttenuation />
      </points>
      <mesh position={[0, -13, -34]}>
        <sphereGeometry args={[17, 48, 32]} />
        <meshStandardMaterial color={c.surfaceRaised} roughness={0.8} emissive={c.primary} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, -13, -34]}>
        <sphereGeometry args={[17.25, 48, 32]} />
        <meshBasicMaterial color={c.primary} transparent opacity={0.28} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function MissionTable({ animated }: { animated: React.RefObject<Animated> }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 1, 48]} />
        <meshStandardMaterial color={c.text} roughness={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
        const angle = (index / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * 2.6, 0.5, Math.cos(angle) * 2.6]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.9, 0.55, 0.16]} />
            <meshStandardMaterial color={index % 2 === 0 ? c.accent : c.background} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.05, 48]} />
        <meshStandardMaterial color={c.background} roughness={1} />
      </mesh>
      <mesh position={[0, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.035, 8, 64]} />
        <meshBasicMaterial color={c.primary} />
      </mesh>

      {/* Physical power bars on the table: the same two values the HTML panel states. */}
      <group position={[-0.7, 1.05, 0.3]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshStandardMaterial color={c.mutedText} />
        </mesh>
      </group>
      <group position={[0.7, 1.05, 0.3]}>
        <mesh
          ref={(mesh) => {
            if (animated.current) animated.current.engineBar = mesh;
          }}
        >
          <boxGeometry args={[0.4, 1, 0.4]} />
          <meshStandardMaterial color={c.primary} emissive={c.primary} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Machines({ animated }: { animated: React.RefObject<Animated> }) {
  return (
    <group>
      {/* Engine module, right */}
      <group position={[6.6, 1.2, -2.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1, 1, 3, 32]} />
          <meshStandardMaterial color={c.text} roughness={0.55} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.7, 0, 0]}>
          <cylinderGeometry args={[1.03, 1.03, 0.5, 32]} />
          <meshStandardMaterial color={c.accent} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} position={[-1.55, 0, 0]}>
          <torusGeometry args={[0.72, 0.13, 12, 40]} />
          <meshStandardMaterial
            ref={(material) => {
              if (animated.current) animated.current.engineGlow = material;
            }}
            color={c.background}
            emissive={c.primary}
          />
        </mesh>
      </group>
      <mesh position={[6.6, 0.1, -2.2]}>
        <boxGeometry args={[3, 0.2, 2.4]} />
        <meshStandardMaterial color={c.background} />
      </mesh>

      {/* Life-support module, left */}
      <group position={[-6.6, 1.25, -2.2]}>
        <mesh castShadow>
          <boxGeometry args={[3, 2.5, 2.4]} />
          <meshStandardMaterial color={c.text} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.65, 1.21]}>
          <boxGeometry args={[2.3, 0.75, 0.04]} />
          <meshStandardMaterial color={c.background} />
        </mesh>
        <mesh position={[0, -0.45, 1.22]}>
          <boxGeometry args={[3, 0.3, 0.04]} />
          <meshStandardMaterial color={c.accent} />
        </mesh>
        <mesh position={[0, 0.65, 1.24]}>
          <boxGeometry args={[1.5, 0.05, 0.01]} />
          <meshBasicMaterial color={c.primary} />
        </mesh>
      </group>

      {/* Original workbench silhouette, foreground left */}
      <mesh position={[-7.2, 0.7, 3.4]} castShadow>
        <boxGeometry args={[4.2, 1.4, 1.8]} />
        <meshStandardMaterial color={c.text} roughness={0.6} />
      </mesh>
      <mesh position={[-5.15, 0.7, 3.4]}>
        <boxGeometry args={[0.3, 1.42, 1.82]} />
        <meshStandardMaterial color={c.accent} />
      </mesh>
    </group>
  );
}

function Rig({
  arrayKw,
  reducedMotion,
  onSettled,
}: {
  arrayKw: ArrayKw;
  reducedMotion: boolean;
  onSettled: (settled: boolean) => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const animated = useRef<Animated>({
    panels: [[], []],
    open: Array<number>(PANELS_PER_WING).fill(0),
    engineGlow: null,
    conduitGlow: null,
    engineBar: null,
    pulse: null,
    engineLevel: 0,
    pulseAt: 1,
  });
  const settled = useRef(false);

  const engineTube = useMemo(() => new THREE.TubeGeometry(engineCurve, 60, 0.08, 10), []);
  const lifeTube = useMemo(() => new THREE.TubeGeometry(lifeSupportCurve, 60, 0.08, 10), []);
  useEffect(
    () => () => {
      engineTube.dispose();
      lifeTube.dispose();
    },
    [engineTube, lifeTube],
  );

  const targetOpen = openPanels(arrayKw);
  const targetEngine = consequence(arrayKw).engineKw / MAX_ENGINE_KW;

  useEffect(() => {
    settled.current = false;
    animated.current.pulseAt = reducedMotion ? 1 : 0;
    onSettled(false);
    invalidate();
  }, [arrayKw, reducedMotion, invalidate, onSettled]);

  const apply = () => {
    const state = animated.current;
    state.panels.forEach((wing) => layoutWing(state.open, wing));
    const level = state.engineLevel;
    if (state.engineGlow) state.engineGlow.emissiveIntensity = 0.1 + level * 2.4;
    if (state.conduitGlow) state.conduitGlow.emissiveIntensity = 0.12 + level * 1.5;
    if (state.engineBar) {
      const height = 0.08 + level * 1.5;
      state.engineBar.scale.y = height;
      state.engineBar.position.y = height / 2;
    }
    if (state.pulse) {
      state.pulse.visible = state.pulseAt < 1;
      if (state.pulseAt < 1) state.pulse.position.copy(engineCurve.getPointAt(state.pulseAt));
    }
  };

  useFrame((_, delta) => {
    const state = animated.current;
    const step = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.2);
    let moving = false;

    state.open = state.open.map((amount, index) => {
      const target = index < targetOpen ? 1 : 0;
      const next = amount + (target - amount) * step;
      const done = Math.abs(target - next) < 0.002;
      if (!done) moving = true;
      return done ? target : next;
    });

    const nextLevel = state.engineLevel + (targetEngine - state.engineLevel) * step;
    if (Math.abs(targetEngine - nextLevel) < 0.002) state.engineLevel = targetEngine;
    else {
      state.engineLevel = nextLevel;
      moving = true;
    }

    if (state.pulseAt < 1) {
      state.pulseAt = Math.min(1, state.pulseAt + delta / 1.1);
      moving = true;
    }

    apply();

    if (moving) invalidate();
    else if (!settled.current) {
      settled.current = true;
      onSettled(true);
    }
  });

  return (
    <>
      <color attach="background" args={[c.background]} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[3, 7.6, 5]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[0, 6, -40]} intensity={1.2} />

      <Outside />
      <Room />
      <MissionTable animated={animated} />
      <Machines animated={animated} />

      {/* The array, outside the window. Mirrored wings. */}
      <group position={[0, 5, -9.5]}>
        <mesh>
          <boxGeometry args={[0.7, 2.4, 0.7]} />
          <meshStandardMaterial color={c.text} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.8, 0.14, 0.8]} />
          <meshStandardMaterial color={c.accent} />
        </mesh>
        {[1, -1].map((side, wing) => (
          <group key={side} position={[side * 0.35, 0, 0]} scale={[side, 1, 1]}>
            {Array.from({ length: PANELS_PER_WING }, (_, index) => (
              <group
                key={index}
                ref={(group) => {
                  animated.current.panels[wing]![index] = group;
                }}
              >
                <SolarPanel />
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* Conduits: the power consequence, drawn in the room. */}
      <mesh geometry={engineTube}>
        <meshStandardMaterial
          ref={(material) => {
            animated.current.conduitGlow = material;
          }}
          color={c.surface}
          emissive={c.primary}
        />
      </mesh>
      <mesh geometry={lifeTube}>
        <meshStandardMaterial color={c.surface} emissive={c.primary} emissiveIntensity={0.3} />
      </mesh>
      <mesh
        ref={(mesh) => {
          animated.current.pulse = mesh;
        }}
        visible={false}
      >
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial color={c.text} />
      </mesh>
    </>
  );
}

export default function Scene({
  arrayKw,
  reducedMotion,
  onSettled,
  onContextLost,
}: {
  arrayKw: ArrayKw;
  reducedMotion: boolean;
  onSettled: (settled: boolean) => void;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      flat
      shadows="percentage"
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ position: [0, 3.9, 14.5], fov: 46 }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 3.1, -2);
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
    >
      <Rig arrayKw={arrayKw} reducedMotion={reducedMotion} onSettled={onSettled} />
    </Canvas>
  );
}
