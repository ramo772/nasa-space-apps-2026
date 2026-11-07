import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { audio } from "../audio/audioManager";
import type { NadirFace } from "../content/script";
import type { StageState } from "./stageState";
import { c } from "./textures";
import { steerAround } from "./walkPath";

const url = (name: string) => `${import.meta.env.BASE_URL}characters/${name}.webp`;

export const NADIR_LAYERS = ["nadir-body", "nadir-arm", "nadir-leg-left", "nadir-leg-right", "nadir-head", "nadir-head-panic", "nadir-head-disbelief", "nadir-head-delighted", "nadir-head-groan"].map(url);

export const NADIR_SPOTS = {
  table: [-4.2, 0, 2.1],
  window: [-3.6, 0, -1.6],
  bay: [3.9, 0, -0.3],
  spine: [3.2, 0, -2.4],
  capsule: [6.4, 0, 2.9],
  hidden: [9, 0, 0.4],
} as const;

// Measurements of the 460 x 915 pose image, in pixels.
const IMAGE_W = 460;
const IMAGE_H = 915;
const HEIGHT = 4.12;
const UNIT = HEIGHT / IMAGE_H;
const WIDTH = IMAGE_W * UNIT;
const toWorld = (px: number, py: number): [number, number] => [(px - IMAGE_W / 2) * UNIT, (IMAGE_H - py) * UNIT];

const SHOULDER = toWorld(165, 265);
const NECK = toWorld(245, 192);
const HIP_LEFT = toWorld(195, 470);
const HIP_RIGHT = toWorld(305, 470);

const WALK_SPEED = 3.1; // world units per second
const STRIDE = 2.9; // radians of leg swing per world unit walked

/** How each expression head sits on the neck. The head is drawn behind the collar, which hides its cut edge. */
const HEADS: Record<Exclude<NadirFace, "confident">, { size: [number, number]; anchor: [number, number]; scale: number }> = {
  panic: { size: [176, 190], anchor: [0.6, 0.8], scale: 1.12 },
  disbelief: { size: [168, 190], anchor: [0.56, 0.8], scale: 1.12 },
  delighted: { size: [212, 208], anchor: [0.62, 0.8], scale: 0.98 },
  groan: { size: [225, 208], anchor: [0.48, 0.72], scale: 1 },
};

/**
 * Body language for each emotion, from docs/design/characters.md:
 * chest and hands when confident, compressing inward when the numbers contradict him.
 */
const POSES: Record<NadirFace, { arm: number; lean: number; squash: number; head: number; shake: number; bounce: number }> = {
  confident: { arm: 0, lean: 0.012, squash: 1, head: 0.015, shake: 0, bounce: 0 },
  delighted: { arm: -0.42, lean: 0.025, squash: 1.015, head: 0.04, shake: 0, bounce: 0.08 },
  panic: { arm: -0.6, lean: -0.04, squash: 0.975, head: -0.012, shake: 1, bounce: 0 },
  disbelief: { arm: 0.3, lean: -0.028, squash: 0.985, head: -0.025, shake: 0, bounce: 0 },
  groan: { arm: 0.45, lean: -0.05, squash: 0.96, head: 0.01, shake: 0, bounce: 0 },
};

function Layer({ texture, width, height, offset = [0, 0], z = 0 }: { texture: THREE.Texture | undefined; width: number; height: number; offset?: [number, number]; z?: number }) {
  return (
    <mesh position={[offset[0], offset[1], z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture ?? null} transparent alphaTest={0.3} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Nadir({ stage, reducedMotion }: { stage: StageState; reducedMotion: boolean }) {
  const textures = useLoader(THREE.TextureLoader, NADIR_LAYERS);
  const [bodyTexture, armTexture, legLeftTexture, legRightTexture, headTexture, panicTexture, disbeliefTexture, delightedTexture, groanTexture] = textures;
  const expressionTextures: Record<Exclude<NadirFace, "confident">, THREE.Texture | undefined> = {
    panic: panicTexture,
    disbelief: disbeliefTexture,
    delighted: delightedTexture,
    groan: groanTexture,
  };

  useMemo(() => {
    for (const texture of textures) texture.colorSpace = THREE.SRGBColorSpace;
  }, [textures]);

  const root = useRef<THREE.Group>(null);
  const flip = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legLeft = useRef<THREE.Group>(null);
  const legRight = useRef<THREE.Group>(null);
  const heads = useRef<Partial<Record<NadirFace, THREE.Group | null>>>({});
  const hop = useRef(0);
  const walkPhase = useRef(0);
  const walkBlend = useRef(0);
  const facing = useRef(1);
  const current = useRef({ arm: 0, lean: 0, squash: 1, head: 0, shake: 0, bounce: 0 });
  const lastFace = useRef(stage.nadirFace);
  const lastPulse = useRef(stage.pulse);
  const lastStep = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const move = useMemo(() => new THREE.Vector3(), []);

  // A new emotion or a confirmed decision gets one anticipate-and-settle beat, then he returns to rest.
  useEffect(() => {
    if ((stage.nadirFace !== lastFace.current || stage.pulse !== lastPulse.current) && !reducedMotion) hop.current = 1;
    lastFace.current = stage.nadirFace;
    lastPulse.current = stage.pulse;
    invalidate();
  }, [stage.nadirFace, stage.pulse, reducedMotion, invalidate]);

  useFrame((state, delta) => {
    if (!root.current || !flip.current || !torso.current || !arm.current || !head.current || !legLeft.current || !legRight.current) return;
    const time = state.clock.elapsedTime;
    const pose = POSES[stage.nadirFace];
    const now = current.current;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
    for (const key of ["arm", "lean", "squash", "head", "shake", "bounce"] as const) {
      now[key] += (pose[key] - now[key]) * blend;
    }

    // Walk at a constant pace to the next station, in magnetic boots: planted, deliberate steps.
    const goal = NADIR_SPOTS[stage.nadir];
    const hidden = stage.nadir === "hidden";
    const remaining = Math.hypot(goal[0] - root.current.position.x, goal[2] - root.current.position.z);
    const [aimX, aimZ] = reducedMotion || hidden ? [goal[0], goal[2]] : steerAround(root.current.position.x, root.current.position.z, goal[0], goal[2]);
    move.set(aimX - root.current.position.x, 0, aimZ - root.current.position.z);
    const distance = move.length();
    const step = reducedMotion ? distance : Math.min(distance, WALK_SPEED * delta);
    const walking = !reducedMotion && !hidden && remaining > 0.02;
    if (distance > 0.0001) {
      move.multiplyScalar(step / distance);
      root.current.position.add(move);
      walkPhase.current += step * STRIDE;
    }
    walkBlend.current += ((walking ? 1 : 0) - walkBlend.current) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 9));
    const walk = walkBlend.current;

    // He faces where he's going, and turns toward the room when he arrives.
    const wantFacing = walking && Math.abs(move.x) > 0.001 ? Math.sign(move.x) : root.current.position.x > 1 ? -1 : 1;
    facing.current += (wantFacing - facing.current) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 24));
    const seen = hidden ? 0.0001 : 1;
    const nextScale = reducedMotion ? seen : THREE.MathUtils.lerp(root.current.scale.y, seen, 1 - Math.exp(-delta * 7));
    root.current.scale.setScalar(nextScale);
    root.current.visible = nextScale > 0.01;
    flip.current.scale.x = Math.abs(facing.current) < 0.55 ? 0.55 * (Math.sign(facing.current) || 1) : facing.current;

    // Each boot clamps down in turn.
    const swing = Math.sin(walkPhase.current);
    const stepIndex = Math.floor(walkPhase.current / Math.PI);
    if (walking && stepIndex !== lastStep.current) {
      lastStep.current = stepIndex;
      audio.play("clack");
    }
    legLeft.current.rotation.z = -swing * 0.2 * walk;
    legRight.current.rotation.z = swing * 0.2 * walk;
    legLeft.current.position.y = HIP_LEFT[1] + Math.max(0, swing) * 0.07 * walk;
    legRight.current.position.y = HIP_RIGHT[1] + Math.max(0, -swing) * 0.07 * walk;

    hop.current = Math.max(0, hop.current - delta * 2.6);
    const beat = Math.sin(hop.current * Math.PI);
    const motion = reducedMotion ? 0 : 1;
    const breath = motion * Math.sin(time * 1.7);
    const talk = motion * (stage.nadirSpeaking ? 1 : 0) * (1 - walk);
    const shake = motion * now.shake * (1 - walk);
    const bob = Math.abs(Math.cos(walkPhase.current)) * 0.09 * walk;

    torso.current.position.y = beat * 0.22 + bob + motion * now.bounce * Math.abs(Math.sin(time * 5)) * (1 - walk);
    torso.current.position.x = shake * Math.sin(time * 34) * 0.012;
    torso.current.scale.set(1 - beat * 0.035 + (1 - now.squash) * 0.5, now.squash + beat * 0.05 + breath * 0.006, 1);
    torso.current.rotation.z = now.lean * (1 - walk) + beat * 0.02 + swing * 0.025 * walk;

    arm.current.rotation.z = now.arm * (1 - walk) + (1.05 + swing * 0.18) * walk + talk * Math.sin(time * 5.2) * 0.1 + breath * 0.01 + shake * Math.sin(time * 27) * 0.04 - beat * 0.15;
    head.current.rotation.z = now.head + talk * Math.sin(time * 6.4) * 0.03 + motion * Math.sin(time * 0.9) * 0.008 + shake * Math.sin(time * 31) * 0.012 - swing * 0.015 * walk;
    head.current.position.y = NECK[1] + talk * Math.abs(Math.sin(time * 7.3)) * 0.012 + breath * 0.004;

    for (const face of Object.keys(POSES) as NadirFace[]) {
      const group = heads.current[face];
      if (group) group.visible = face === stage.nadirFace;
    }

    if (hop.current > 0 || walking || walk > 0.01 || Math.abs(nextScale - seen) > 0.002 || Math.abs(facing.current - wantFacing) > 0.01) invalidate();
  });

  return (
    <group ref={root} position={[...NADIR_SPOTS.table]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, 0.02, 0]} scale={[1.35, 0.75, 1]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color={c.background} transparent opacity={0.45} />
      </mesh>

      <group ref={flip}>
        {/* Legs swing from the hips, behind the body's edge */}
        <group ref={legLeft} position={[HIP_LEFT[0], HIP_LEFT[1], -0.03]}>
          <Layer texture={legLeftTexture} width={WIDTH} height={HEIGHT} offset={[-HIP_LEFT[0], HEIGHT / 2 - HIP_LEFT[1]]} />
        </group>
        <group ref={legRight} position={[HIP_RIGHT[0], HIP_RIGHT[1], -0.035]}>
          <Layer texture={legRightTexture} width={WIDTH} height={HEIGHT} offset={[-HIP_RIGHT[0], HEIGHT / 2 - HIP_RIGHT[1]]} />
        </group>

        <group ref={torso}>
          <group ref={arm} position={[SHOULDER[0], SHOULDER[1], -0.02]}>
            <Layer texture={armTexture} width={WIDTH} height={HEIGHT} offset={[-SHOULDER[0], HEIGHT / 2 - SHOULDER[1]]} />
          </group>

          {/* The head sits behind the collar, so it can never float off the body */}
          <group ref={head} position={[NECK[0], NECK[1], -0.01]}>
            <group
              ref={(group) => {
                heads.current.confident = group;
              }}
            >
              <Layer texture={headTexture} width={WIDTH} height={HEIGHT} offset={[-NECK[0], HEIGHT / 2 - NECK[1]]} />
            </group>
            {(Object.keys(HEADS) as Exclude<NadirFace, "confident">[]).map((face) => {
              const { size, anchor, scale } = HEADS[face];
              const width = size[0] * UNIT * scale;
              const height = size[1] * UNIT * scale;
              return (
                <group
                  key={face}
                  visible={false}
                  ref={(group) => {
                    heads.current[face] = group;
                  }}
                >
                  <Layer texture={expressionTextures[face]} width={width} height={height} offset={[(0.5 - anchor[0]) * width, (anchor[1] - 0.5) * height]} />
                </group>
              );
            })}
          </group>

          <Layer texture={bodyTexture} width={WIDTH} height={HEIGHT} offset={[0, HEIGHT / 2]} />
        </group>
      </group>
    </group>
  );
}
