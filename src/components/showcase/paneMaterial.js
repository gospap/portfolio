import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

/* ===========================================================================
   paneMaterial — one project plate in the showcase.

   Rounded corners are cut from a signed distance field in the fragment shader
   rather than modelled into the geometry, so the radius can be animated per
   frame and the antialiasing derives from fwidth — one pixel wide at any
   distance or DPR.

   The plate is graded, not just drawn: it desaturates and dims as it leaves
   the centre of the screen, so at any moment exactly one plate looks finished.
   A chrome rim and a light-purple inner edge carry the silver theme onto the
   glass.
   =========================================================================== */

const PaneMaterial = shaderMaterial(
  {
    tMap: null,
    uCover: new THREE.Vector2(1, 1),
    uSize: new THREE.Vector2(1, 1),
    uRadius: 10,
    uFocus: 1,
    uHover: 0,
    uOpacity: 1,
    uTime: 0,
    uAccent: new THREE.Color("#6ff5f5"),
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D tMap;
    uniform vec2  uCover;
    uniform vec2  uSize;
    uniform float uRadius;
    uniform float uFocus;
    uniform float uHover;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3  uAccent;
    varying vec2 vUv;

    // iquilezles.org/articles/distfunctions2d
    float sdRoundRect(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    void main() {
      // NB: not "half" — reserved in GLSL ES, and it fails to compile
      vec2 hb = uSize * 0.5;
      vec2 p = (vUv - 0.5) * uSize;
      float d = sdRoundRect(p, hb, uRadius);
      float aa = max(fwidth(d), 1e-4);
      float mask = 1.0 - smoothstep(-aa, aa, d);
      if (mask < 0.002) discard;

      vec2 uv = (vUv - 0.5) * uCover + 0.5;
      vec3 col = texture2D(tMap, uv).rgb;

      // Grading: away from centre the plate goes quiet. On a silver ground
      // "quiet" means washing TOWARD the metal, not darkening — a plate that
      // dims on a light page reads as broken rather than as out of focus.
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(lum), col, 0.42 + 0.58 * uFocus);
      col = mix(vec3(0.77, 0.78, 0.82), col, 0.34 + 0.66 * uFocus + 0.08 * uHover);

      // travelling specular band — the cue that this is glass over metal
      // (every smoothstep keeps edge0 < edge1; the reversed form is undefined)
      float band = fract((vUv.x * 0.72 + vUv.y * 0.28) - uTime * 0.04);
      float sweep = smoothstep(0.47, 0.50, band) * (1.0 - smoothstep(0.55, 0.58, band));
      col += sweep * (0.05 + 0.09 * uFocus);

      // chrome rim, with the accent sitting just inside it
      float rim = 1.0 - smoothstep(0.0, aa * 2.0, abs(d));
      float inner = 1.0 - smoothstep(aa * 2.0, aa * 6.0, abs(d + 2.0));
      col += rim * vec3(0.85, 0.86, 0.90) * (0.30 + 0.40 * uFocus);
      col += inner * uAccent * (0.10 + 0.35 * uHover) * uFocus;

      gl_FragColor = vec4(col, mask * uOpacity);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

extend({ PaneMaterial });

export { PaneMaterial };

/**
 * Cover-fit: the multiplier that maps a plate's UVs onto its texture so the
 * image fills it without distortion, cropping the long axis.
 */
export function coverScale(imageAspect, paneAspect) {
  return imageAspect > paneAspect
    ? [paneAspect / imageAspect, 1]
    : [1, imageAspect / paneAspect];
}
