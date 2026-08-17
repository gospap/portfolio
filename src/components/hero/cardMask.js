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

/* A pill in the accent, right-aligned on the index line. Drawn rather than
   composed because everything else on this plate is: the badge has to bend and
   rotate with the card, and a DOM element cannot follow it.

   Returns nothing — it paints and leaves the cursor where it found it. */
function drawBadge(ctx, text, rightX, baselineY) {
  ctx.save();
  ctx.font = "600 24px ui-monospace, 'JetBrains Mono', monospace";
  ctx.letterSpacing = "2px";

  const padX = 20;
  const h = 40;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  const x = rightX - w;
  const y = baselineY - h + 8;
  const r = h / 2;

  /* Filled, not outlined. The plate under it is near-black and the accent is a
     bright cyan, so an outline would read as a thin grey rectangle at the size
     these cards are actually seen at. */
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = "rgba(6,255,255,0.92)";
  ctx.fill();

  ctx.fillStyle = "#04191b";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

export function makeCardMask({ title = "", kicker = "", index = 0, badge = "" }) {
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
  ctx.fillStyle = "#06ffff";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(index + 1).padStart(2, "0"), padX, y);

  /* Hairline under the index. It stops short of the badge rather than of the
     right edge when there is one — a rule running under a pill reads as a
     mistake, and the two are on the same line. */
  const badgeW = badge
    ? (() => {
        ctx.save();
        ctx.font = "600 24px ui-monospace, 'JetBrains Mono', monospace";
        ctx.letterSpacing = "2px";
        const w = Math.ceil(ctx.measureText(badge).width) + 40;
        ctx.restore();
        return w + 22;
      })()
    : 0;

  ctx.strokeStyle = "rgba(233,235,242,0.34)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX + 58, y - 9);
  ctx.lineTo(W - padX - badgeW, y - 9);
  ctx.stroke();

  if (badge) drawBadge(ctx, badge, W - padX, y);

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
  ctx.fillText(kicker, padX, y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
