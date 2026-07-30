import * as THREE from "three";

/**
 * The strip that wraps the banner ring under the carousel. Drawn rather than
 * shipped as a PNG so it can carry a name and a role in whichever language the
 * page is in, without an asset per locale.
 *
 * `map.repeat.x` on the mesh tiles this horizontally, so the canvas only holds
 * ONE repetition and it has to loop seamlessly: the text is drawn with equal
 * padding either side of a centred separator.
 */
export function makeBannerTexture(words) {
  if (typeof document === "undefined") return null;

  const w = 2048;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Solid black band, white lettering — the one hard-contrast element on an
  // otherwise entirely silver page, so the ring reads as a machined collar
  // around the carousel rather than as a watermark floating under it.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  const text = `${words.join("  ·  ")}  ·  `;
  ctx.font = "600 62px ui-monospace, 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "10px";

  // Scale the type so exactly one repetition fills the canvas width — that is
  // what makes the tiling seam invisible.
  const natural = ctx.measureText(text).width;
  const scale = w / natural;
  ctx.save();
  ctx.scale(scale, 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, 0, h * 0.52);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
