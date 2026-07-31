/* ===========================================================================
   plates.js — abstract card faces drawn to a canvas at runtime.

   The hero ring mixes real screenshots with generated plates. The generated
   half is drawn rather than shipped as images for three reasons: nothing to
   download, nothing to keep in sync with the palette, and every plate can be
   regenerated at whatever resolution the device deserves.

   All five styles share a language — brushed-silver ground, purple line work,
   one graphite element, a monospace caption — so a plate sitting between two
   screenshots reads as part of the same set rather than as a placeholder.
   =========================================================================== */

import * as THREE from "three";

/* Landscape 16:9, matching the hero cards — and close enough to the showcase
   plate's 1.53 that neither crops much. */
export const PLATE_W = 1280;
export const PLATE_H = 720;

/* The plate is metal, not paper: INK is the brushed base and INK_2 the lit
   edge of it. PURPLE/PURPLE_DIM carry the line work, and CHROME is the single
   graphite element per plate — the one dark mark that keeps a silver drawing
   from floating away. */
const INK = "#d6d8e0";
const INK_2 = "#edeef2";
const PURPLE = "#6f52cc";
const PURPLE_DIM = "#a892ee";
const CHROME = "#14161b";
const BONE = "#14161b";

/** Deterministic PRNG so a plate looks the same on every reload. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ground(ctx) {
  const g = ctx.createLinearGradient(0, 0, PLATE_W * 0.4, PLATE_H);
  g.addColorStop(0, INK_2);
  g.addColorStop(1, INK);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PLATE_W, PLATE_H);

  // corner glow, so the plate has a light direction like the screenshots do
  const r = ctx.createRadialGradient(
    PLATE_W * 0.2,
    PLATE_H * 0.12,
    0,
    PLATE_W * 0.2,
    PLATE_H * 0.12,
    PLATE_H * 0.8,
  );
  r.addColorStop(0, "rgba(168,146,238,0.16)");
  r.addColorStop(1, "rgba(168,146,238,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, PLATE_W, PLATE_H);
}

function caption(ctx, label, sub) {
  ctx.save();
  ctx.font = "500 21px ui-monospace, 'JetBrains Mono', monospace";
  ctx.fillStyle = BONE;
  ctx.globalAlpha = 0.92;
  ctx.fillText(label, 54, PLATE_H - 84);
  if (sub) {
    ctx.font = "400 17px ui-monospace, 'JetBrains Mono', monospace";
    ctx.fillStyle = PURPLE;
    ctx.globalAlpha = 0.8;
    ctx.fillText(sub, 54, PLATE_H - 54);
  }
  ctx.restore();
}

/** Registration ticks in the corners — the "instrument" cue. */
function ticks(ctx) {
  ctx.save();
  ctx.strokeStyle = "rgba(20,22,27,0.34)";
  ctx.lineWidth = 1.5;
  const m = 40;
  const len = 22;
  for (const [x, y, dx, dy] of [
    [m, m, 1, 1],
    [PLATE_W - m, m, -1, 1],
    [m, PLATE_H - m, 1, -1],
    [PLATE_W - m, PLATE_H - m, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * len);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * len, y);
    ctx.stroke();
  }
  ctx.restore();
}

/* ——————————————————————— the five styles ——————————————————————— */

function drawGrid(ctx, rand) {
  const step = 34;
  ctx.strokeStyle = "rgba(168,146,238,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < PLATE_W; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, PLATE_H);
  }
  for (let y = step; y < PLATE_H; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(PLATE_W, y);
  }
  ctx.stroke();

  // one bold axis pair, offset so the composition is not centred
  const ax = Math.round(PLATE_W * (0.3 + rand() * 0.4));
  const ay = Math.round(PLATE_H * (0.3 + rand() * 0.4));
  ctx.strokeStyle = PURPLE_DIM;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax, 0);
  ctx.lineTo(ax, PLATE_H);
  ctx.moveTo(0, ay);
  ctx.lineTo(PLATE_W, ay);
  ctx.stroke();

  // a dimension line with arrowheads, in brass
  const y = ay + 120;
  const x0 = 90;
  const x1 = PLATE_W - 120;
  ctx.strokeStyle = CHROME;
  ctx.fillStyle = CHROME;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  for (const [x, dir] of [
    [x0, 1],
    [x1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * 12, y - 5);
    ctx.lineTo(x + dir * 12, y + 5);
    ctx.closePath();
    ctx.fill();
  }
}

function drawContour(ctx, rand) {
  // Sum of a few sines makes a smooth scalar field; drawing its level sets by
  // marching rows is cheap and gives clean topographic bands.
  const waves = Array.from({ length: 4 }, () => ({
    fx: (rand() - 0.5) * 0.018,
    fy: (rand() - 0.5) * 0.018,
    p: rand() * Math.PI * 2,
    a: 0.4 + rand() * 0.6,
  }));
  const field = (x, y) =>
    waves.reduce((s, w) => s + w.a * Math.sin(x * w.fx + y * w.fy + w.p), 0);

  const levels = 16;
  for (let l = 0; l < levels; l++) {
    const target = -2 + (4 * l) / (levels - 1);
    ctx.beginPath();
    let drawing = false;
    for (let x = 0; x <= PLATE_W; x += 4) {
      // for each column find the y where the field crosses this level
      let found = -1;
      let prev = field(x, 0) - target;
      for (let y = 6; y <= PLATE_H; y += 6) {
        const cur = field(x, y) - target;
        if (prev <= 0 !== cur <= 0) {
          found = y - 6 * (cur / (cur - prev));
          break;
        }
        prev = cur;
      }
      if (found < 0) {
        drawing = false;
        continue;
      }
      if (!drawing) {
        ctx.moveTo(x, found);
        drawing = true;
      } else ctx.lineTo(x, found);
    }
    const t = l / (levels - 1);
    ctx.strokeStyle =
      l === Math.floor(levels * 0.6)
        ? CHROME
        : `rgba(168,146,238,${0.14 + 0.34 * t})`;
    ctx.lineWidth = l === Math.floor(levels * 0.6) ? 2 : 1.2;
    ctx.stroke();
  }
}

function drawTraces(ctx, rand) {
  // PCB-ish: axis-aligned runs with 45° corners, pads at the ends.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const lanes = 15;
  for (let i = 0; i < lanes; i++) {
    let x = 60 + rand() * (PLATE_W - 120);
    let y = 70 + rand() * (PLATE_H - 140);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 3 + Math.floor(rand() * 4);
    for (let s = 0; s < segs; s++) {
      const len = 40 + rand() * 130;
      const horizontal = rand() > 0.5;
      const dir = rand() > 0.5 ? 1 : -1;
      // 45° elbow before each straight, the way a real router does it
      const bevel = 16 * dir;
      if (horizontal) {
        ctx.lineTo(x + bevel, y + bevel);
        x += len * dir;
        ctx.lineTo(x, y + bevel);
        y += bevel;
      } else {
        ctx.lineTo(x + bevel, y + bevel);
        y += len * dir;
        ctx.lineTo(x + bevel, y);
        x += bevel;
      }
    }
    const accent = i === 3;
    ctx.strokeStyle = accent ? CHROME : `rgba(168,146,238,${0.3 + rand() * 0.45})`;
    ctx.lineWidth = accent ? 2.6 : 1.4 + rand() * 1.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, accent ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = accent ? CHROME : PURPLE;
    ctx.fill();
  }
}

function drawWave(ctx, rand) {
  // Stacked ridge lines, each occluded by the one in front of it.
  const rows = 34;
  const seeds = Array.from({ length: 8 }, () => ({
    f: 0.004 + rand() * 0.012,
    p: rand() * Math.PI * 2,
    a: 12 + rand() * 46,
  }));
  for (let r = rows - 1; r >= 0; r--) {
    const baseY = PLATE_H * 0.2 + (PLATE_H * 0.62 * r) / (rows - 1);
    const falloff = 1 - Math.abs(r / (rows - 1) - 0.5) * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, PLATE_H);
    for (let x = 0; x <= PLATE_W; x += 5) {
      const y =
        baseY -
        seeds.reduce(
          (s, w) => s + w.a * Math.sin(x * w.f + w.p + r * 0.28),
          0,
        ) *
          0.22 *
          falloff;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(PLATE_W, PLATE_H);
    ctx.closePath();
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.strokeStyle =
      r === Math.floor(rows * 0.35)
        ? CHROME
        : `rgba(168,146,238,${0.2 + 0.5 * (1 - r / rows)})`;
    ctx.lineWidth = r === Math.floor(rows * 0.35) ? 2.2 : 1.2;
    ctx.stroke();
  }
}

function drawAperture(ctx, rand) {
  const cx = PLATE_W * 0.5;
  const cy = PLATE_H * 0.44;
  const rings = 22;
  for (let i = rings; i > 0; i--) {
    const rad = (i / rings) * PLATE_W * 0.62;
    const start = rand() * Math.PI * 2;
    const sweep = Math.PI * (0.45 + rand() * 1.5);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, start, start + sweep);
    const t = 1 - i / rings;
    ctx.strokeStyle = i === 6 ? CHROME : `rgba(168,146,238,${0.12 + 0.5 * t})`;
    ctx.lineWidth = i === 6 ? 2.4 : 1 + t * 1.8;
    ctx.stroke();
  }
  // crosshair
  ctx.strokeStyle = "rgba(233,239,233,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 44, cy);
  ctx.lineTo(cx + 44, cy);
  ctx.moveTo(cx, cy - 44);
  ctx.lineTo(cx, cy + 44);
  ctx.stroke();
}

const STYLES = {
  grid: drawGrid,
  contour: drawContour,
  traces: drawTraces,
  wave: drawWave,
  aperture: drawAperture,
};

export const PLATE_STYLES = Object.keys(STYLES);

/**
 * Draw one plate and wrap it in a CanvasTexture.
 * Returns null during SSR, where there is no canvas to draw on.
 */
export function makePlate({ style = "grid", seed = 1, label = "", sub = "" } = {}) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = PLATE_W;
  canvas.height = PLATE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = mulberry32(seed * 2654435761);
  ground(ctx);
  (STYLES[style] ?? drawGrid)(ctx, rand);
  ticks(ctx);
  caption(ctx, label, sub);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
