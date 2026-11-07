import * as THREE from "three";
import tokens from "../../../design/tokens.json";

export const c = tokens.color;

function make(width: number, height: number, draw: (context: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** A small seeded generator, so the planet and floor look identical on every load. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export const earthTexture = () =>
  make(1024, 512, (context, w, h) => {
    const random = seeded(31);
    context.fillStyle = "#14609C";
    context.fillRect(0, 0, w, h);
    context.fillStyle = "#3C8F7A";
    for (let land = 0; land < 16; land += 1) {
      const x = random() * w;
      const y = 60 + random() * (h - 120);
      for (let blob = 0; blob < 16; blob += 1) {
        context.beginPath();
        context.ellipse(x + (random() - 0.5) * 150, y + (random() - 0.5) * 80, 12 + random() * 44, 8 + random() * 26, random() * 3, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.fillStyle = "rgba(255, 243, 214, 0.75)";
    for (let cloud = 0; cloud < 90; cloud += 1) {
      const x = random() * w;
      const y = random() * h;
      for (let puff = 0; puff < 4; puff += 1) {
        context.beginPath();
        context.ellipse(x + (random() - 0.5) * 60, y + (random() - 0.5) * 12, 8 + random() * 34, 2 + random() * 6, 0, 0, Math.PI * 2);
        context.fill();
      }
    }
  });

export const floorTexture = () =>
  make(1024, 1024, (context, w, h) => {
    context.fillStyle = c.surfaceRaised;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = c.surface;
    context.lineWidth = 4;
    for (let line = 0; line <= 8; line += 1) {
      context.beginPath();
      context.moveTo((line / 8) * w, 0);
      context.lineTo((line / 8) * w, h);
      context.moveTo(0, (line / 8) * h);
      context.lineTo(w, (line / 8) * h);
      context.stroke();
    }
    const middle = w / 2;
    context.strokeStyle = c.text;
    context.lineWidth = 6;
    context.beginPath();
    context.arc(middle, middle, 330, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = c.accent;
    context.lineWidth = 12;
    context.setLineDash([60, 44]);
    context.beginPath();
    context.arc(middle, middle, 395, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  });

export const screenTexture = (kind: "orbit" | "dish" | "bars") =>
  make(320, 200, (context, w, h) => {
    context.fillStyle = c.background;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = c.primary;
    context.fillStyle = c.primary;
    context.lineWidth = 5;
    context.beginPath();
    if (kind === "orbit") {
      context.ellipse(w / 2, h / 2, 120, 58, -0.25, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(w / 2 + 40, h / 2 - 8, 16, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = c.accent;
      context.beginPath();
      context.arc(w / 2 - 100, h / 2 + 34, 11, 0, Math.PI * 2);
      context.fill();
    } else if (kind === "dish") {
      context.arc(w / 2, 60, 74, 0.25, Math.PI - 0.25);
      context.stroke();
      context.beginPath();
      context.moveTo(w / 2, 136);
      context.lineTo(w / 2, 180);
      context.stroke();
    } else {
      [50, 90, 70, 130, 110].forEach((bar, index) => context.fillRect(50 + index * 46, h - 26 - bar, 28, bar));
    }
  });

export function wrenchShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.05);
  shape.lineTo(0.28, -0.05);
  shape.lineTo(0.38, -0.16);
  shape.lineTo(0.55, -0.1);
  shape.lineTo(0.46, -0.01);
  shape.lineTo(0.46, 0.01);
  shape.lineTo(0.55, 0.1);
  shape.lineTo(0.38, 0.16);
  shape.lineTo(0.28, 0.05);
  shape.lineTo(-0.5, 0.05);
  shape.closePath();
  return shape;
}
