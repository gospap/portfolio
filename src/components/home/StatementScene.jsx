"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

import CanvasBoundary from "@/components/CanvasBoundary";
import { ChromeRig, CHROME, STEEL_MATERIAL } from "@/components/three/rig";
import { clamp01, smootherstep } from "@/lib/motion";

/* ===========================================================================
   StatementScene — three plates becoming one stack.

   Splayed and turned away from each other at rest; as the quote inks in they
   rotate square, close the gaps, and settle into a single aligned block. The
   third plate carries the accent edge, so the finished stack reads as one
   object with one seam of colour rather than as three grey slabs.

   The plates are UNLABELLED on purpose. Type on them would name three things
   the paragraph two inches away already names, and the object would become an
   illustration of the sentence instead of the sentence's own shape.
   =========================================================================== */

/* Resting splay, per plate: [x, y, z] offset and the yaw/roll it is turned by.
   Index 1 is the middle plate and barely moves — the other two travel to meet
   it, so the stack assembles around a fixed centre rather than drifting. */
const PLATES = [
  { rest: [-0.62, 0.5, 0.55], yaw: -0.5, roll: 0.16, y: 0.19 },
  { rest: [0.04, 0.0, 0.0], yaw: 0.12, roll: -0.04, y: 0.0 },
  { rest: [0.6, -0.5, -0.5], yaw: 0.46, roll: -0.14, y: -0.19 },
];

const PLATE = [1.5, 0.1, 1.05]; // w, thickness, d

function Stack({ progress }) {
  const group = useRef(null);
  const plates = useRef([]);

  useFrame(({ clock }) => {
    const p = clamp01(progress.current ?? 0);
    /* Assembly finishes a little before the scroll window does, so the stack
       is standing still and complete while the last words are still landing —
       an object that is still closing when you finish reading reads as late. */
    const close = smootherstep(0.08, 0.86, p);

    /* One slow presentation turn, always. The stack is machined metal: it has
       to move a little or it reads as a flat image of metal. */
    if (group.current) {
      group.current.rotation.y = -0.5 + clock.elapsedTime * 0.055;
    }

    for (let i = 0; i < PLATES.length; i++) {
      const m = plates.current[i];
      if (!m) continue;
      const s = PLATES[i];
      /* Outer plates lead, the middle one is nearly still — staggering the
         two travellers keeps the close from reading as a single snap. */
      const k = smootherstep(0, 1, clamp01((close - i * 0.06) / 0.88));
      m.position.set(
        s.rest[0] * (1 - k),
        s.rest[1] * (1 - k) + s.y * k,
        s.rest[2] * (1 - k),
      );
      m.rotation.set(s.roll * (1 - k), s.yaw * (1 - k), s.roll * (1 - k) * 0.5);
    }
  });

  return (
    <group ref={group} rotation={[0.3, -0.5, 0]}>
      {PLATES.map((s, i) => (
        <RoundedBox
          key={i}
          ref={(node) => {
            plates.current[i] = node;
          }}
          args={PLATE}
          radius={0.028}
          smoothness={4}
          steps={1}
          position={s.rest}
        >
          <meshStandardMaterial
            {...STEEL_MATERIAL}
            /* the bottom plate is the one that carries colour */
            color={i === 2 ? CHROME.steelDeep : STEEL_MATERIAL.color}
            emissive={i === 2 ? CHROME.accentDeep : "#000000"}
            emissiveIntensity={i === 2 ? 0.16 : 0}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

export default function StatementScene({ progress, active }) {
  return (
    <CanvasBoundary>
      <Canvas
        camera={{ position: [0, 1.15, 4.2], fov: 32 }}
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
        <Stack progress={progress} />
      </Canvas>
    </CanvasBoundary>
  );
}
