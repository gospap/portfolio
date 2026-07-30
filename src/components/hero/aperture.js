/* ===========================================================================
   aperture — the click transition.

   Ported from the work page of `overpass-editions`
   (src/components/helix/shaders.ts · COMPOSITE_FRAG), which in turn is a port
   of AT's WorkComposite.fs. Kept line-for-line where it matters, because the
   brief was "the exact same wave pattern".

   What makes the pattern: fbm is sampled on the DIRECTION from the centre
   rather than on the pixel, so the noise is constant along every ray outward.
   The expanding edge therefore tears into radial spikes instead of dissolving
   into static — that one detail is the whole difference between an aperture
   opening and a crossfade.

   One addition: uCoverTo. The original composites two full-screen render
   targets, which already fill the frame. Here the incoming side is the card's
   own video, whose aspect is not the viewport's, so it needs cover-fitting on
   the way in or it would stretch.
   =========================================================================== */

const LIB = /* glsl */ `
vec2 scaleUV(vec2 uv, vec2 s) { return (uv - 0.5) * s + 0.5; }
vec2 scaleUV(vec2 uv, float s) { return (uv - 0.5) * s + 0.5; }

float hash(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
  return v;
}
`;

export const APERTURE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const APERTURE_FRAG = /* glsl */ `
${LIB}
uniform sampler2D tWork;
uniform sampler2D tDetail;
uniform vec2 uResolution;
uniform vec2 uCoverTo;
uniform float uTransition;
varying vec2 vUv;

vec3 rgbShift(sampler2D t, vec2 uv, float amt) {
  return vec3(
    texture2D(t, uv + vec2(amt, 0.0)).r,
    texture2D(t, uv).g,
    texture2D(t, uv - vec2(amt, 0.0)).b
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  /* aspect-corrected so the aperture stays a circle on any viewport */
  vec2 squareuv = (uv - 0.5) * (uResolution.x > uResolution.y
      ? vec2(uResolution.x / uResolution.y, 1.0)
      : vec2(1.0, uResolution.y / uResolution.x)) + 0.5;

  float trans = uTransition * 1.5;

  /* fbm on the ray direction, not the pixel — see the note at the top */
  vec2 dir = normalize(uv - 0.5 + 1e-6);
  float n = fbm(dir * 2.0);
  squareuv += smoothstep(0.2, 0.4, trans) * n * dir * 0.2;

  float d = smoothstep(trans + 0.25, trans - 0.25, distance(squareuv, vec2(0.5)));
  d *= smoothstep(0.0, 0.5, uTransition);

  vec2 fromuv = (uv - 0.5) / (1.0 + d) + 0.5;   // outgoing expands
  vec2 touv   = (uv - 0.5) / (2.0 - d) + 0.5;   // incoming falls from 2x
  fromuv = scaleUV(fromuv, 1.0 + uTransition * 0.1);
  touv   = scaleUV(touv, uCoverTo);             // cover-fit the incoming card

  vec3 from = rgbShift(tWork,   clamp(fromuv, 0.0, 1.0), 0.005 * uTransition);
  vec3 to   = rgbShift(tDetail, clamp(touv,   0.0, 1.0), 0.001 * (1.0 - uTransition));

  from *= smoothstep(1.0, 0.5, uTransition);
  to   *= smoothstep(0.2, 0.6, uTransition);

  /* both sides driven above 1.0 at the seam. The blow-out IS the flare —
     there is no bloom pass anywhere in this scene. */
  from *= mix(1.0, 2.0, d);
  to   *= mix(2.0, 1.0, d);

  gl_FragColor = vec4(mix(from, to, d), 1.0);
  #include <colorspace_fragment>
}
`;
