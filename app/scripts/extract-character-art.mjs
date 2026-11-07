// Cuts production character art out of the approved sheets in assets/identity/characters/.
// The sheets are read and never changed. Output goes to public/characters/.
// Run from app/: node scripts/extract-character-art.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sheetDir = resolve(here, "../../assets/identity/characters");
const outDir = resolve(here, "../public/characters");
mkdirSync(outDir, { recursive: true });

// Rectangles measured on a 1671 x 941 reference view of each sheet.
const NADIR = {
  file: "dr-nadir-character-sheet.png",
  tiles: {
    "nadir-confident": [1068, 110, 197, 192],
    "nadir-panic": [1288, 110, 176, 192],
    "nadir-disbelief": [1477, 110, 168, 192],
    "nadir-delighted": [1091, 343, 260, 210],
    "nadir-groan": [1375, 343, 257, 210],
  },
  cutouts: { "nadir-pose": [0, 15, 460, 915] },
};
const RIVO = {
  file: "rivo-character-sheet.png",
  tiles: {
    "rivo-neutral": [613, 384, 184, 126],
    "rivo-curious": [821, 384, 184, 126],
    "rivo-deadpan": [1028, 384, 184, 126],
    "rivo-warning": [1233, 384, 184, 126],
    "rivo-pride": [1440, 384, 184, 126],
  },
  cutouts: {},
};

const browser = await chromium.launch();
const page = await browser.newPage();

for (const sheet of [NADIR, RIVO]) {
  const dataUrl = `data:image/png;base64,${readFileSync(resolve(sheetDir, sheet.file)).toString("base64")}`;
  const results = await page.evaluate(
    async ({ dataUrl, tiles, cutouts }) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const scale = image.naturalWidth / 1671;
      const output = {};

      const crop = ([x, y, w, h]) => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, x * scale, y * scale, w * scale, h * scale, 0, 0, canvas.width, canvas.height);
        return { canvas, context };
      };

      for (const [name, rect] of Object.entries(tiles)) {
        output[name] = crop(rect).canvas.toDataURL("image/webp", 0.9);
      }

      for (const [name, rect] of Object.entries(cutouts)) {
        const { canvas, context } = crop(rect);
        const { width, height } = canvas;
        const pixels = context.getImageData(0, 0, width, height);
        const data = pixels.data;
        const at = (px, py) => (py * width + px) * 4;

        // Flood the background inward from the crop edges. Navy gradient only: dark, blue-leaning, and
        // close to its neighbour, so the fill stops at the character's outline and lit fabric.
        const background = new Uint8Array(width * height);
        const stack = [];
        for (let px = 0; px < width; px += 1) stack.push(px, 0, px, height - 1);
        for (let py = 0; py < height; py += 1) stack.push(0, py, width - 1, py);
        const isBackdrop = (i) => data[i] < 52 && data[i + 1] < 96 && data[i + 2] > 22 && data[i + 2] > data[i] + 10;
        while (stack.length) {
          const py = stack.pop();
          const px = stack.pop();
          const index = py * width + px;
          if (background[index]) continue;
          const i = index * 4;
          if (!isBackdrop(i)) continue;
          background[index] = 1;
          for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const j = at(nx, ny);
            const close = Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]) < 26;
            if (close) stack.push(nx, ny);
          }
        }

        // The backdrop between the legs and under the boots is the same navy as the trousers, so a color
        // test either misses it or eats the trousers. These areas are marked by hand on the 460 x 915 crop.
        const eraser = document.createElement("canvas");
        eraser.width = width;
        eraser.height = height;
        const eraserContext = eraser.getContext("2d", { willReadFrequently: true });
        for (const polygon of [
          [[268, 556], [302, 680], [293, 742], [283, 776], [283, 900], [170, 900], [170, 796], [186, 762], [224, 690]],
          [[0, 846], [62, 846], [62, 892], [0, 915]],
          [[0, 892], [460, 892], [460, 915], [0, 915]],
        ]) {
          eraserContext.beginPath();
          polygon.forEach(([x, y], index) => (index ? eraserContext.lineTo(x, y) : eraserContext.moveTo(x, y)));
          eraserContext.closePath();
          eraserContext.fill();
        }
        const erased = eraserContext.getImageData(0, 0, width, height).data;
        for (let index = 0; index < width * height; index += 1) {
          if (erased[index * 4 + 3] > 128) background[index] = 1;
        }

        // The sheet's measuring bracket touches the crop's right side. Remove its cyan pixels.
        for (let py = 0; py < height; py += 1) {
          for (let px = Math.round(width * 0.93); px < width; px += 1) {
            const i = at(px, py);
            if (data[i] < 90 && data[i + 2] > 140) background[py * width + px] = 1;
          }
        }

        // Keep only the largest solid shape, which removes stars and orbit lines.
        const labels = new Int32Array(width * height);
        let best = 0;
        let bestSize = 0;
        let next = 0;
        for (let start = 0; start < labels.length; start += 1) {
          if (background[start] || labels[start]) continue;
          next += 1;
          let size = 0;
          const queue = [start];
          labels[start] = next;
          while (queue.length) {
            const index = queue.pop();
            size += 1;
            const px = index % width;
            const py = (index - px) / width;
            for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
              if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
              const n = ny * width + nx;
              if (!background[n] && !labels[n]) {
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

        // Soften the edge by one pixel, so no navy halo shows against the room.
        for (let py = 0; py < height; py += 1) {
          for (let px = 0; px < width; px += 1) {
            const index = py * width + px;
            if (labels[index] !== best) {
              data[index * 4 + 3] = 0;
              continue;
            }
            let edge = false;
            for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
              if (nx < 0 || ny < 0 || nx >= width || ny >= height || labels[ny * width + nx] !== best) edge = true;
            }
            if (edge) data[index * 4 + 3] = 110;
          }
        }
        context.putImageData(pixels, 0, 0);
        output[name] = canvas.toDataURL("image/webp", 0.92);
      }
      return { output, size: [image.naturalWidth, image.naturalHeight] };
    },
    { dataUrl, tiles: sheet.tiles, cutouts: sheet.cutouts },
  );
  console.log(sheet.file, "natural size", results.size.join(" x "));
  for (const [name, url] of Object.entries(results.output)) {
    const bytes = Buffer.from(url.split(",")[1], "base64");
    writeFileSync(resolve(outDir, `${name}.webp`), bytes);
    console.log(" ", name, Math.round(bytes.length / 1024), "KB");
  }
}

await browser.close();
