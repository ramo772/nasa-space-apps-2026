import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { CrewMember } from "../app/gameState";
import { figureSvg } from "../components/Avatar";
import { c } from "./textures";
import { steerAround } from "./walkPath";

const WIDTH = 200;
const HEIGHT = 470;
const FIGURE_HEIGHT = 3.7;

type Vec3 = [number, number, number];
const MISSION_SPOTS: readonly Vec3[] = [[5.6, 0, 2.8], [7, 0, 1], [-6.7, 0, 1.2], [-7.9, 0, -0.8]];
const REVIEW_SPOTS: readonly Vec3[] = [[-1.2, 0, 4], [0.2, 0, 3.6], [-6.4, 0, 3.6], [-7.6, 0, 3]];

/** Draws one crew member in their chosen avatar and suit color, with their name above them. */
function useFigureTexture(member: CrewMember, name: string) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    let made: THREE.CanvasTexture | null = null;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH * 2;
      canvas.height = HEIGHT * 2;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.font = "700 34px 'Space Grotesk', Inter, system-ui, sans-serif";
      const textWidth = Math.min(context.measureText(name).width, canvas.width - 40);
      context.fillStyle = c.background;
      context.beginPath();
      context.roundRect((canvas.width - textWidth) / 2 - 14, 76, textWidth + 28, 50, 14);
      context.fill();
      context.fillStyle = c.text;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(name, canvas.width / 2, 102, canvas.width - 40);
      made = new THREE.CanvasTexture(canvas);
      made.colorSpace = THREE.SRGBColorSpace;
      setTexture(made);
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(figureSvg(member.avatar, member.accent))}`;
    return () => {
      cancelled = true;
      made?.dispose();
    };
  }, [member.avatar, member.accent, name]);
  return texture;
}

function Member({ member, name, spot, reducedMotion, delay, pulse }: { member: CrewMember; name: string; spot: Vec3; reducedMotion: boolean; delay: number; pulse: number }) {
  const texture = useFigureTexture(member, name);
  const root = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const hop = useRef(0);
  const lastPulse = useRef(pulse);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (pulse !== lastPulse.current && !reducedMotion) hop.current = 1;
    lastPulse.current = pulse;
    invalidate();
  }, [pulse, reducedMotion, invalidate, texture]);

  useFrame((state, delta) => {
    if (!root.current || !figure.current) return;
    const { x, z } = root.current.position;
    const remaining = Math.hypot(spot[0] - x, spot[2] - z);
    const [aimX, aimZ] = reducedMotion ? [spot[0], spot[2]] : steerAround(x, z, spot[0], spot[2]);
    const leg = Math.hypot(aimX - x, aimZ - z);
    const step = reducedMotion ? leg : Math.min(leg, 3 * delta);
    if (leg > 0.0001) {
      root.current.position.x += ((aimX - x) / leg) * step;
      root.current.position.z += ((aimZ - z) / leg) * step;
    }
    hop.current = Math.max(0, hop.current - delta * 2.2);
    const beat = Math.sin(hop.current * Math.PI);
    const walking = remaining > 0.02 && !reducedMotion;
    const time = state.clock.elapsedTime + delay;
    const breath = reducedMotion ? 0 : Math.sin(time * 1.5) * 0.008;
    figure.current.position.y = beat * 0.22 + (walking ? Math.abs(Math.sin(time * 9)) * 0.1 : 0);
    figure.current.rotation.z = walking ? Math.sin(time * 9) * 0.05 : 0;
    figure.current.scale.set(1 - beat * 0.03, 1 + beat * 0.04 + breath, 1);
    if (hop.current > 0 || walking) invalidate();
  });

  if (!texture) return null;
  const width = (WIDTH / HEIGHT) * FIGURE_HEIGHT;
  return (
    <group ref={root} position={spot}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1.1, 0.6, 1]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color={c.background} transparent opacity={0.45} />
      </mesh>
      <group ref={figure}>
        <mesh position={[0, FIGURE_HEIGHT / 2, 0]}>
          <planeGeometry args={[width, FIGURE_HEIGHT]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** The player's own character in the room: separate from Dr. Nadir, in the avatar and suit they chose. */
export function Crew({ crew, names, review, pulse, reducedMotion }: { crew: readonly CrewMember[]; names: readonly string[]; review: boolean; pulse: number; reducedMotion: boolean }) {
  const spots = review ? REVIEW_SPOTS : MISSION_SPOTS;
  return (
    <group>
      {crew.map((member, index) => (
        <Member key={index} member={member} name={names[index] ?? ""} spot={spots[index] ?? MISSION_SPOTS[0]!} reducedMotion={reducedMotion} delay={index * 1.3} pulse={pulse} />
      ))}
    </group>
  );
}
