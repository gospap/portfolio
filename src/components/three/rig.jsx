"use client";

import { Environment, Lightformer } from "@react-three/drei";

/* ===========================================================================
   rig.jsx — one lighting setup for every scene on the site.

   Four canvases now carry machined chrome, and chrome is nothing but what it
   reflects: give two of them different environments and they stop reading as
   the same material under the same studio light, which is the whole illusion.
   So the rig lives here once and each scene imports it.

   The bake is a SINGLE frame (`frames={1}`). A live environment would re-render
   the cubemap every frame for a studio that never moves — the most expensive
   way on this site to draw nothing new.
   =========================================================================== */

/* The palette, in the same values globals.css uses. Kept as plain strings so a
   scene never has to read a CSS custom property from JS — that would be a
   forced style recalculation inside a frame loop. */
export const CHROME = {
  /* brushed steel — the body of anything machined */
  steel: "#c8ccd8",
  /* a shade deeper, for a face that should sit back */
  steelDeep: "#a9aebd",
  /* graphite, for engraving */
  ink: "#1b1e26",
  /* --purple-pale: glows and edges only, never asked to be read */
  accent: "#a892ee",
  /* --purple-deep: the tone that can carry meaning */
  accentDeep: "#5a40b0",
};

/**
 * The studio. A broad key panel overhead, a cool purple fill from the left and
 * a soft bounce from the right — the same three-quarter setup the hero's cards
 * are lit by, so a plate here and a card there catch the light the same way.
 */
export function ChromeRig({ intensity = 1 }) {
  return (
    <>
      {/* Ambient hemisphere so a face turned fully away is never black — on a
          silver page an unlit face reads as a hole, not as shadow. */}
      <hemisphereLight args={["#ffffff", "#8f86c8", 0.62 * intensity]} />
      <directionalLight position={[-6, 10, 8]} intensity={2.1 * intensity} />
      <directionalLight
        position={[7, 3, 4]}
        intensity={0.55 * intensity}
        color={CHROME.accent}
      />

      <Environment resolution={128} frames={1}>
        {/* the key: a wide softbox above and slightly in front */}
        <Lightformer
          form="rect"
          intensity={2.3}
          position={[0, 9, 3]}
          scale={[14, 9, 1]}
          rotation-x={Math.PI / 2}
        />
        {/* purple fill from the left — the only colour in the system */}
        <Lightformer
          form="rect"
          intensity={1.15}
          color={CHROME.accent}
          position={[-9, 2, 7]}
          scale={[7, 7, 1]}
          rotation-y={Math.PI / 2}
        />
        {/* cool bounce from the right, so the far edge does not go dead */}
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[9, 0, -3]}
          scale={[6, 6, 1]}
          rotation-y={-Math.PI / 2}
        />
        {/* a ring in front: the travelling highlight that says "polished" */}
        <Lightformer
          form="ring"
          intensity={1.5}
          color="#e8eaf2"
          position={[0, 2, 9]}
          scale={[4, 4, 1]}
        />
      </Environment>
    </>
  );
}

/** Standard material args for anything machined. Spread, do not fight. */
export const STEEL_MATERIAL = {
  color: CHROME.steel,
  roughness: 0.42,
  metalness: 0.62,
  envMapIntensity: 1.05,
};
