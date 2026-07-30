"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { PaneMaterial, coverScale } from "./paneMaterial";
import { textureAspect } from "@/lib/useCardTextures";
import { clamp01, damp, influence } from "@/lib/motion";

/* ===========================================================================
   ShowcaseScene — after pmndrs/examples "moksha".

   Moksha's grammar, and what is kept from it:
     · an ORTHOGRAPHIC camera at zoom 1, so one world unit is one CSS pixel and
       a plate can be placed against the DOM layout by arithmetic instead of by
       eye;
     · plates that travel at a different rate from the copy beside them, which
       is the whole parallax effect;
     · drifting geometry between the plates for depth.

   What is deliberately NOT kept: moksha renders its type into the canvas. Here
   the type stays in the DOM — it has to be selectable, crawlable, and set in
   Greek as well as English, none of which a blob font in WebGL does well. The
   canvas is a parallax layer behind real text.
   =========================================================================== */

/** plates travel slightly faster than the copy — this is the parallax */
const PLATE_FACTOR = 1.22;

function Plate({ item, index, texture, localRef, blockH, accent }) {
  const mesh = useRef(null);
  const hovered = useRef(false);
  const hover = useRef(0);
  const { size } = useThree();

  const w = Math.min(size.width * 0.42, 620);
  const h = Math.min(size.height * 0.62, w * 1.25);
  const side = index % 2 === 0 ? 1 : -1;
  const x = side * Math.min(size.width * 0.245, 380);

  const aspect = textureAspect(texture);
  const cover = useMemo(() => coverScale(aspect, w / h), [aspect, w, h]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const m = mesh.current;
    if (!m) return;
    const u = m.material.uniforms;

    /* The block's own offset from centre, in pixels. Zero exactly when the
       copy beside it is centred — so the plate and its text agree at rest and
       only disagree while moving, which is what parallax should mean. */
    const off = localRef.current - index * blockH;
    m.position.set(x, off * PLATE_FACTOR, 0);

    const f = influence(off / blockH, 1.15);
    u.uFocus.value = damp(u.uFocus.value, f, 0.08, dt);
    hover.current = damp(hover.current, hovered.current ? 1 : 0, 0.09, dt);
    u.uHover.value = hover.current;
    u.uTime.value = state.clock.elapsedTime;
    u.uOpacity.value = damp(u.uOpacity.value, clamp01(0.15 + f * 1.4), 0.12, dt);
    u.uRadius.value = damp(u.uRadius.value, 10 + hover.current * 10, 0.1, dt);

    m.scale.setScalar(1 + hover.current * 0.028);
    // a slight tilt away from centre, so the wall of plates is not flat
    m.rotation.z = damp(m.rotation.z, -side * 0.012 * (1 - f), 0.14, dt);
  });

  if (!texture) return null;

  return (
    <mesh
      ref={mesh}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[w, h]} />
      <paneMaterial
        key={PaneMaterial.key}
        tMap={texture}
        uCover={cover}
        uSize={[w, h]}
        uAccent={new THREE.Color(accent)}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* Moksha's drifting diamonds used to live here — silver octahedra floating
   between the plates. Removed at the user's request; with them went the
   Environment cubemap and the two lights, which existed only so that metal had
   something to reflect. The scene is unlit now and costs a fraction of what it
   did. */

/** Hairline rules that slide past — moksha's "stripes". */
function Stripes({ span, localRef, count = 7 }) {
  const group = useRef(null);
  const { size } = useThree();

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        y: Math.random() * span,
        factor: 0.35 + Math.random() * 0.5,
        w: 0.25 + Math.random() * 0.6,
        x: (Math.random() - 0.5) * 1.3,
      })),
    [count, span],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const s = seeds[i];
      child.position.set(s.x * size.width, -s.y + localRef.current * s.factor, -60);
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i}>
          <planeGeometry args={[s.w * size.width, 1]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.09}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ShowcaseScene({ items, textures, localRef, accent }) {
  const { size } = useThree();
  const blockH = size.height;
  const span = blockH * items.length;

  return (
    <>
      {/* No lights, no environment map, no drifting geometry. Everything here
          is unlit — the plates carry their own image and the stripes are flat
          — so the scene costs one draw call per object and nothing else. The
          metal reads from the CSS ground behind the transparent canvas. */}
      <Stripes span={span} localRef={localRef} />

      {items.map((item, i) => (
        <Plate
          key={item.slug}
          item={item}
          index={i}
          texture={textures[i]}
          localRef={localRef}
          blockH={blockH}
          accent={accent}
        />
      ))}
    </>
  );
}
