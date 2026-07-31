"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import CanvasBoundary from "@/components/CanvasBoundary";
import { ChromeRig, CHROME, STEEL_MATERIAL } from "@/components/three/rig";
import { clamp01, smootherstep } from "@/lib/motion";

/* ===========================================================================
   StudyColumn — the degree, as a machined stack.

   /about already states "4 / 5" twice: as a figure and as a row of pips. This
   is the same fact a third time, and it earns its canvas by being the one that
   shows what the other two only assert — four segments finished and polished,
   the fifth still raw stock, sitting proud of the stack and waiting to be cut.

   It reads the SAME numbers the DOM does, from PROFILE, so the object can
   never disagree with the pips beside it.
   =========================================================================== */

const R = 0.62; // segment radius
const H = 0.2; // segment height
const GAP = 0.035;

function Column({ done, total, progress }) {
  const group = useRef(null);
  const segs = useRef([]);
  const span = total * (H + GAP) - GAP;

  useFrame(({ clock }) => {
    const p = clamp01(progress.current ?? 0);
    /* A slow presentation turn, always: machined metal that never moves reads
       as a photograph of metal. Slow enough that reading beside it is fine. */
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.14;

    for (let i = 0; i < total; i++) {
      const m = segs.current[i];
      if (!m) continue;
      /* The stack builds from the bottom as the section arrives — each
         segment has its own slice of the window, so it counts up rather than
         appearing all at once. */
      const k = smootherstep(0, 1, clamp01((p - i * 0.1) / 0.5));
      const y = -span / 2 + i * (H + GAP) + H / 2;
      /* the unfinished segment sits proud, and is the only one that drifts */
      const raw = i >= done ? 1 : 0;
      m.position.set(0, y + (1 - k) * 1.4, 0);
      m.scale.setScalar(Math.max(0.001, k));
      m.rotation.y = raw * Math.sin(clock.elapsedTime * 0.6 + i) * 0.09;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: total }, (_, i) => {
        const finished = i < done;
        return (
          <mesh
            key={i}
            ref={(node) => {
              segs.current[i] = node;
            }}
          >
            {/* Cut stock: a low-segment cylinder with a chamfer reads as
                turned metal, where a smooth one reads as a plastic pill. */}
            <cylinderGeometry
              args={[
                finished ? R : R * 0.86,
                finished ? R : R * 0.86,
                H,
                finished ? 64 : 12,
                1,
              ]}
            />
            <meshStandardMaterial
              {...STEEL_MATERIAL}
              color={finished ? CHROME.steel : CHROME.steelDeep}
              /* raw stock is not polished: rough, barely metallic, no colour */
              roughness={finished ? 0.32 : 0.78}
              metalness={finished ? 0.72 : 0.3}
              emissive={finished ? CHROME.accentDeep : "#000000"}
              emissiveIntensity={finished ? 0.07 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function StudyColumn({ done, total, progress, active }) {
  return (
    <CanvasBoundary>
      <Canvas
        camera={{ position: [0, 0.35, 3.9], fov: 34 }}
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ChromeRig />
        <Column done={done} total={total} progress={progress} />
      </Canvas>
    </CanvasBoundary>
  );
}
