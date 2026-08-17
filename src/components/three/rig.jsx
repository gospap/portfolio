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
  /* brushed steel — the body of anything machined. Unchanged from the silver
     palette, and deliberately: chrome is bright metal in both, and on a dark
     page it stops competing with the ground and starts reading as the lit
     object it always was. This is the one value the retheme did not touch. */
  steel: "#c8ccd8",
  /* a shade deeper, for a face that should sit back */
  steelDeep: "#8f94a3",
  /* graphite, for engraving — still dark, because it is cut INTO the bright
     metal above and takes its contrast from the steel, not from the page */
  ink: "#1b1e26",
  /* --cyan-soft: glows and edges only, never asked to be read */
  accent: "#6ff5f5",
  /* --cyan: the tone that can carry meaning */
  accentDeep: "#06ffff",
};

/**
 * The studio. A broad key panel overhead, a cyan fill from the left and a soft
 * bounce from the right — the same three-quarter setup the hero's cards are lit
 * by, so a plate here and a card there catch the light the same way.
 */
export function ChromeRig({ intensity = 1 }) {
  return (
    <>
      {/* Ambient hemisphere. On silver this was fighting to keep an unlit face
          off black, because a dark face on a pale page read as a hole punched
          through it. On a near-black page that same face reads correctly as
          shadow, so the ground half of the hemisphere goes dark and the fill
          comes down — the object is now allowed to have a dark side.

          It does not go to zero. A fully unlit face on a black page is a
          silhouette, and a silhouette loses the machined edge that is the
          entire point of the material. */}
      <hemisphereLight args={["#ffffff", "#08131a", 0.34 * intensity]} />
      <directionalLight position={[-6, 10, 8]} intensity={2.1 * intensity} />
      <directionalLight
        position={[7, 3, 4]}
        intensity={0.7 * intensity}
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
        {/* cyan fill from the left — the only colour in the system */}
        <Lightformer
          form="rect"
          intensity={1.3}
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
