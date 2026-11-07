// Splits Dr. Nadir's approved main pose into puppet layers, and cuts his approved expressions into heads.
// Nothing is redrawn: every pixel comes from assets/identity/characters/dr-nadir-character-sheet.png.
// Run from app/, after extract-character-art.mjs: node scripts/extract-nadir-puppet.mjs
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/characters");
const sheet = resolve(here, "../../assets/identity/characters/dr-nadir-character-sheet.png");
const pose = resolve(outDir, "nadir-pose.webp");
const toUrl = (path, type) => `data:image/${type};base64,${readFileSync(path).toString("base64")}`;

// In the pose image's own coordinates. The pose crop starts 15 px below the top of the sheet.
const HEAD = [[120, 0], [345, 0], [345, 125], [330, 192], [285, 200], [205, 198], [170, 178], [120, 120]];
const ARM = [[0, 105], [122, 105], [130, 195], [168, 232], [190, 262], [178, 338], [80, 338], [50, 262], [0, 250]];

// Legs are split from the hips, so he can take real steps. The body keeps the hips and belt above the join.
const LEG_LEFT = [[120, 462], [262, 462], [262, 556], [224, 690], [186, 762], [170, 796], [176, 915], [30, 915], [30, 760], [80, 620]];
const LEG_RIGHT = [[250, 462], [408, 462], [420, 640], [460, 800], [460, 915], [270, 915], [283, 776], [293, 742], [262, 556]];

// Expression heads: rectangles on the sheet, then a keep-area in tile fractions that drops shoulders and hands.
const HEADS = {
  panic: { rect: [1288, 112, 176, 190], keep: [[0, 0], [1, 0], [1, 0.68], [0.86, 0.87], [0.46, 0.87], [0.3, 0.8], [0, 0.6]] },
  disbelief: { rect: [1477, 112, 168, 190], keep: [[0, 0], [1, 0], [1, 0.66], [0.72, 0.87], [0.42, 0.87], [0.16, 0.72], [0, 0.6]] },
  delighted: { rect: [1091, 345, 212, 208], keep: [[0, 0], [1, 0], [1, 0.6], [0.84, 0.9], [0.56, 0.9], [0.34, 0.82], [0, 0.6]] },
  groan: { rect: [1378, 345, 225, 208], keep: [[0, 0], [1, 0], [1, 0.56], [0.72, 0.76], [0.3, 0.8], [0, 0.72]] },
};

const browser = await chromium.launch();
const page = await browser.newPage();

const output = await page.evaluate(
  async ({ poseUrl, sheetUrl, HEAD, ARM, HEADS, LEG_LEFT, LEG_RIGHT }) => {
    const load = async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return image;
    };
    const poseImage = await load(poseUrl);
    const sheetImage = await load(sheetUrl);
    const made = {};

    const path = (context, points) => {
      context.beginPath();
      points.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
    };

    const canvas_width = () => poseImage.naturalWidth;
    const layer = (draw) => {
      const canvas = document.createElement("canvas");
      canvas.width = poseImage.naturalWidth;
      canvas.height = poseImage.naturalHeight;
      const context = canvas.getContext("2d");
      draw(context);
      return canvas.toDataURL("image/webp", 0.92);
    };

    made["nadir-head"] = layer((context) => {
      path(context, HEAD);
      context.clip();
      context.drawImage(poseImage, 0, 0);
    });
    made["nadir-arm"] = layer((context) => {
      path(context, ARM);
      context.clip();
      context.drawImage(poseImage, 0, 0);
    });
    // The body keeps a little of the neck, so no gap shows when the head moves.
    made["nadir-leg-left"] = layer((context) => {
      path(context, LEG_LEFT);
      context.clip();
      context.drawImage(poseImage, 0, 0);
    });
    made["nadir-leg-right"] = layer((context) => {
      path(context, LEG_RIGHT);
      context.clip();
      context.drawImage(poseImage, 0, 0);
    });
    made["nadir-body"] = layer((context) => {
      context.drawImage(poseImage, 0, 0);
      context.globalCompositeOperation = "destination-out";
      path(context, HEAD.map(([x, y]) => [x, y > 150 ? y - 16 : y]));
      context.fill();
      path(context, ARM);
      context.fill();
      // Everything below the hips belongs to the legs. The legs overlap upward behind this edge.
      context.fillRect(0, 490, canvas_width(), 500);
    });

    for (const [name, { rect, keep }] of Object.entries(HEADS)) {
      const [x, y, w, h] = rect;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(sheetImage, x, y, w, h, 0, 0, w, h);
      const pixels = context.getImageData(0, 0, w, h);
      const data = pixels.data;

      // Remove the tile's navy backdrop by flooding in from its edges.
      const isBackdrop = (i) => data[i] < 56 && data[i + 1] < 90 && data[i + 2] > 22 && data[i + 2] > data[i] + 8;
      const gone = new Uint8Array(w * h);
      const stack = [];
      for (let px = 0; px < w; px += 1) stack.push(px, 0);
      for (let py = 0; py < h; py += 1) stack.push(0, py, w - 1, py);
      while (stack.length) {
        const py = stack.pop();
        const px = stack.pop();
        const index = py * w + px;
        if (gone[index] || !isBackdrop(index * 4)) continue;
        gone[index] = 1;
        for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < w && ny < h) stack.push(nx, ny);
        }
      }

      // Clip away shoulders and hands below the head.
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const maskContext = mask.getContext("2d", { willReadFrequently: true });
      path(maskContext, keep.map(([fx, fy]) => [fx * w, fy * h]));
      maskContext.fill();
      const kept = maskContext.getImageData(0, 0, w, h).data;
      for (let index = 0; index < w * h; index += 1) {
        if (kept[index * 4 + 3] < 128) gone[index] = 1;
      }

      // Keep the largest shape, which removes sparkles, sweat marks and steam lines.
      const labels = new Int32Array(w * h);
      let best = 0;
      let bestSize = 0;
      let next = 0;
      for (let start = 0; start < labels.length; start += 1) {
        if (gone[start] || labels[start]) continue;
        next += 1;
        let size = 0;
        const queue = [start];
        labels[start] = next;
        while (queue.length) {
          const index = queue.pop();
          size += 1;
          const px = index % w;
          const py = (index - px) / w;
          for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const n = ny * w + nx;
            if (!gone[n] && !labels[n]) {
              labels[n] = next;
              queue.push(n);
            }
          }
        }
        if (size > bestSize) {
          bestSize = size;
          best = next;
        }
      }
      for (let index = 0; index < w * h; index += 1) {
        if (labels[index] !== best) data[index * 4 + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      made[`nadir-head-${name}`] = canvas.toDataURL("image/webp", 0.92);
    }
    return { made, size: [poseImage.naturalWidth, poseImage.naturalHeight] };
  },
  { poseUrl: toUrl(pose, "webp"), sheetUrl: toUrl(sheet, "png"), HEAD, ARM, HEADS, LEG_LEFT, LEG_RIGHT },
);

console.log("pose size", output.size.join(" x "));
for (const [name, url] of Object.entries(output.made)) {
  const bytes = Buffer.from(url.split(",")[1], "base64");
  writeFileSync(resolve(outDir, `${name}.webp`), bytes);
  console.log(" ", name, Math.round(bytes.length / 1024), "KB");
}

// A composite for lining up the puppet by eye. Set CHECK_SHOT to a file path to write it.
if (process.env.CHECK_SHOT) {
  const img = (name) => toUrl(resolve(outDir, `${name}.webp`), "webp");
  const NECK = [245, 192];
  const SIZES = {
    panic: { size: [176, 190], anchor: [0.6, 0.8], scale: 1.12 },
    disbelief: { size: [168, 190], anchor: [0.56, 0.8], scale: 1.12 },
    delighted: { size: [212, 208], anchor: [0.62, 0.8], scale: 0.98 },
    groan: { size: [225, 208], anchor: [0.48, 0.72], scale: 1.0 },
  };
  const figure = (face) => {
    const scale = 0.66;
    const head = face === "confident"
      ? `<img src="${img("nadir-head")}" style="position:absolute;left:0;top:0;width:${460 * scale}px;z-index:1">`
      : (() => {
          const { size, anchor, scale: s } = SIZES[face];
          const w = size[0] * s * scale;
          const h = size[1] * s * scale;
          return `<img src="${img(`nadir-head-${face}`)}" style="position:absolute;width:${w}px;height:${h}px;left:${NECK[0] * scale - anchor[0] * w}px;top:${NECK[1] * scale - anchor[1] * h}px;z-index:1">`;
        })();
    return `<div style="position:relative;width:${460 * scale}px;height:${915 * scale}px">
      <img src="${img("nadir-leg-left")}" style="position:absolute;left:0;top:0;width:100%;z-index:0">
      <img src="${img("nadir-leg-right")}" style="position:absolute;left:0;top:0;width:100%;z-index:0">
      <img src="${img("nadir-arm")}" style="position:absolute;left:0;top:0;width:100%;z-index:0">
      ${head}
      <img src="${img("nadir-body")}" style="position:absolute;left:0;top:0;width:100%;z-index:2">
    </div>`;
  };
  await page.setViewportSize({ width: 1540, height: 620 });
  await page.setContent(`<body style="margin:0;background:#2a8;display:flex;gap:4px;padding:6px">${["confident", "panic", "disbelief", "delighted", "groan"].map(figure).join("")}</body>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: process.env.CHECK_SHOT });
}

await browser.close();
