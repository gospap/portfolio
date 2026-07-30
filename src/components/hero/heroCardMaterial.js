import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

/* ===========================================================================
   heroCardMaterial — one card on the ring.

   Replaces drei's <Image>, which could only draw a flat picture. A card here
   is meant to read as a physical object: a sheet of glass over a screen, with
   a label plate printed across the top of it.

   What makes it look like an object rather than a texture on a plane:
     · a rounded frame cut from an SDF, antialiased from fwidth;
     · a bright top edge and a dark bottom one, as if lit from above — the
       single strongest cue that a rectangle has thickness;
     · a broad diagonal sheen that tracks nothing, so it reads as a reflection
       of the room rather than as an animated highlight;
     · a vignette, because a real screen is never evenly lit to its corners;
     · a chrome rim, matching the machined edges elsewhere on the page.
   =========================================================================== */

const HeroCardMaterial = shaderMaterial(
  {
    tMap: null,
    tMask: null,
    uCover: new THREE.Vector2(1, 1),
    uSize: new THREE.Vector2(1, 1.42),
    uRadius: 0.055,
    uFocus: 0,
    uHover: 0,
    uPlaying: 0,
    uTime: 0,
    uAccent: new THREE.Color("#a892ee"),
  },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D tMap;
    uniform sampler2D tMask;
    uniform vec2  uCover;
    uniform vec2  uSize;
    uniform float uRadius;
    uniform float uFocus;
    uniform float uHover;
    uniform float uPlaying;
    uniform float uTime;
    uniform vec3  uAccent;
    varying vec2 vUv;

    float sdRoundRect(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    void main() {
      /* ——— the far half of the ring ———
         A ring wider than the frame shows you its far side above its near
         side, and the far side is being viewed from behind — where every
         texture is mirrored. Dropping back faces (FrontSide) fixes the text by
         deleting half the circle, which is not a fix.

         gl_FrontFacing tells us which side this fragment is on. Flipping u on
         the back faces un-mirrors them, so both halves of the ring render with
         their titles the right way round and the whole circle stays visible.
         Only x flips: the vertical lighting and the label band along the top
         are unaffected by which side you are looking from. */
      vec2 uvc = vUv;
      if (!gl_FrontFacing) uvc.x = 1.0 - uvc.x;

      // NB: not "half" — reserved in GLSL ES, fails to compile
      vec2 hb = uSize * 0.5;
      vec2 p = (uvc - 0.5) * uSize;
      float d = sdRoundRect(p, hb, uRadius);
      float aa = max(fwidth(d), 1e-4);
      float mask = 1.0 - smoothstep(-aa, aa, d);
      if (mask < 0.002) discard;

      // ——— the picture, cover-fitted ———
      vec2 uv = (uvc - 0.5) * uCover + 0.5;
      vec3 col = texture2D(tMap, uv).rgb;

      /* A card away from the front sits back: it loses a little contrast
         toward the silver of the room rather than going dark, which on a light
         page is what "further away" actually looks like.

         Kept deliberately shallow — 0.78 at its weakest. The earlier 0.44
         meant an off-focus card was more room than card, which read as the
         whole ring being half-transparent instead of as depth. Every card's
         footage should be legible; only the focused one should look lit. */
      col = mix(vec3(0.80, 0.81, 0.85), col, 0.78 + 0.22 * uFocus);

      // still frame reads flatter than a playing one
      col = mix(col, col * 1.06, uPlaying);

      // ——— lit like an object ———
      // top edge catches the light, bottom edge falls away
      float lightY = smoothstep(0.0, 0.35, 1.0 - uvc.y);
      col += lightY * 0.10 * (0.5 + 0.5 * uFocus);
      col -= smoothstep(0.72, 1.0, uvc.y) * 0.06;

      // broad diagonal room reflection, fixed to the card
      float sheen = smoothstep(0.35, 0.85, (uvc.x * 0.7 + (1.0 - uvc.y) * 0.3));
      col += sheen * 0.08 * (0.4 + 0.6 * uFocus);

      // a slow travelling glint, so the glass is alive without blinking
      float band = fract((uvc.x * 0.8 + uvc.y * 0.2) - uTime * 0.03);
      float glint = smoothstep(0.48, 0.5, band) * (1.0 - smoothstep(0.53, 0.56, band));
      col += glint * 0.07 * uFocus;

      // vignette — no real screen is even to its corners
      float vig = 1.0 - smoothstep(0.55, 1.15, length((uvc - 0.5) * vec2(1.0, 1.25)) * 2.0);
      col *= 0.86 + 0.14 * vig;

      // ——— the label plate ———
      vec4 label = texture2D(tMask, uvc);
      col = mix(col, label.rgb, label.a);

      // ——— rim ———
      float rim = 1.0 - smoothstep(0.0, aa * 2.0, abs(d));
      col += rim * vec3(0.86, 0.87, 0.92) * (0.35 + 0.35 * uFocus);
      float inner = 1.0 - smoothstep(aa * 2.0, aa * 7.0, abs(d + 0.006));
      col += inner * uAccent * (0.06 + 0.4 * uHover);

      gl_FragColor = vec4(col, mask);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

extend({ HeroCardMaterial });

export { HeroCardMaterial };
