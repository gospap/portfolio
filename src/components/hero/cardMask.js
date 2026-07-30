import * as THREE from "three";

/* ===========================================================================
   cardMask — the label plate that sits across the top of every hero card.

   Drawn to a canvas rather than composed from DOM or 3D text: the cards are
   bent and rotating, so DOM cannot track them, and 3D text would mean shipping
   a font atlas for two lines of type that never change after load. A canvas
   gives crisp text at whatever resolution the card deserves, in both alphabets,
   using the fonts the page has already loaded.

   The texture is mostly transparent — only the band at the top carries pixels —
   so the card's shader can lay it over the video with one mix().
   =========================================================================== */

/* 16:9, matching the cards — the mask is sampled with the card's raw UVs, so
   its proportions must be the card's or the band would be stretched. */
const W = 1280;
const H = 720;

export function makeCardMask({ title = "", kicker = "", index = 0 }) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, W, H);

  /* The band: solid at the top, falling to nothing by its lower edge, so the
     video underneath is never cut by a hard horizontal line. */
  const bandH = Math.round(H * 0.36);
  const grad = ctx.createLinearGradient(0, 0, 0, bandH);
  grad.addColorStop(0, "rgba(8,9,12,0.9)");
  grad.addColorStop(0.62, "rgba(8,9,12,0.72)");
  grad.addColorStop(1, "rgba(8,9,12,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, bandH);

  const padX = 58;
  let y = 76;

  // index, in the accent — the one coloured mark on the plate
  ctx.font = "500 26px ui-monospace, 'JetBrains Mono', monospace";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#a892ee";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(index + 1).padStart(2, "0"), padX, y);

  // hairline under the index, stopping short of the right edge
  ctx.strokeStyle = "rgba(233,235,242,0.34)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX + 58, y - 9);
  ctx.lineTo(W - padX, y - 9);
  ctx.stroke();

  // title — shrink to fit rather than wrap; these are product names, and a
  // wrapped product name reads as a mistake
  y += 76;
  let size = 68;
  ctx.letterSpacing = "0px";
  do {
    ctx.font = `300 ${size}px Manrope, system-ui, sans-serif`;
    if (ctx.measureText(title).width <= W - padX * 2) break;
    size -= 2;
  } while (size > 30);
  ctx.fillStyle = "#f4f5f8";
  ctx.fillText(title, padX, y);

  // kicker
  y += 44;
  ctx.font = "400 26px ui-monospace, 'JetBrains Mono', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "rgba(226,228,236,0.74)";
  ctx.fillText(kicker.toUpperCase(), padX, y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
