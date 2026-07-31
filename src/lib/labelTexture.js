"use client";

import * as THREE from "three";

/* ===========================================================================
   labelTexture.js — type engraved onto a face.

   Drawn to a 2D canvas rather than extruded as 3D type, for one reason that
   settles it: half this site is Greek. Real 3D type means shipping a font as
   geometry and hoping its glyph coverage holds; a canvas gets the page's own
   Manrope, with real hinting, in whichever alphabet the copy is written in.

   Nothing but the letterforms goes on the texture — no plate, no border, no
   brushed ground. Anything else and the type reads as a label stuck onto the
   object instead of as the object's own marking.
   =========================================================================== */

/** Greedy wrap against a measured width. */
function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * @param {string} text
 * @param {object} [opts]
 * @param {number} [opts.width]    texture width in px
 * @param {number} [opts.aspect]   width / height of the area being marked
 * @param {string} [opts.color]    fill; defaults to graphite
 * @param {number} [opts.weight]   font weight
 * @param {number} [opts.tracking] letter-spacing in em
 * @returns {THREE.CanvasTexture}
 */
export function makeLabelTexture(text, opts = {}) {
  const {
    width: W = 1024,
    aspect = 1024 / 512,
    color = "#1b1e26",
    weight = 500,
    tracking = 0,
  } = opts;
  const H = Math.round(W / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const ctx = canvas.getContext("2d");
  if (!ctx) return tex;

  const draw = () => {
    const family =
      getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const pad = Math.round(W * 0.05);
    const maxWidth = W - pad * 2;

    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if (tracking) ctx.letterSpacing = `${tracking}em`;

    /* Shrink to fit rather than clip: these labels are content, not a fixed
       string, and truncated type reads as a bug rather than as a design. */
    let size = Math.round(H * 0.42);
    let lines = [];
    for (; size > Math.round(H * 0.12); size -= 4) {
      ctx.font = `${weight} ${size}px ${family}`;
      lines = wrap(ctx, text, maxWidth);
      if (lines.length * size * 1.18 <= H - pad * 2) break;
    }

    ctx.fillStyle = color;
    const block = lines.length * size * 1.18;
    const first = (H - block) / 2 + size * 0.82;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, first + i * size * 1.18));

    tex.needsUpdate = true;
  };

  draw();
  /* The first pass can land before the webfont does, which would engrave the
     fallback face permanently. Redraw once Manrope arrives. */
  document.fonts?.ready.then(draw, () => {});

  return tex;
}
