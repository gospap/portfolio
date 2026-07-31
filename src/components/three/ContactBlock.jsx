"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import CanvasBoundary from "@/components/CanvasBoundary";
import { ChromeRig, CHROME, STEEL_MATERIAL } from "@/components/three/rig";
import { makeLabelTexture } from "@/lib/labelTexture";
import { angleDelta, omegaFor, spring } from "@/lib/motion";

/* ===========================================================================
   ContactBlock — the channels, on a block that turns to the one you are on.

   Not scroll-driven: this one answers the POINTER. Hover or tab to a contact
   row and the block turns that channel's face round to be read. It is an
   index of the same three links the rows are, which is what keeps it from
   being an ornament — the object tells you which row you are on.

   The turn is a critically damped spring rather than a chase, so moving down
   three rows quickly does not stop and restart at each one: the block keeps
   its momentum through the reversal, the way a real flywheel would.
   =========================================================================== */

const MARK_W = 0.82;
const MARK_H = 0.32;
const MARK_Z = 0.006;

const FACE_NORMALS = [
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(-1, 0, 0),
];

/* Where the camera is, normalised. The block is viewed three-quarters rather
   than dead-on, so "facing" is a dot against THIS and not simply the z term —
   assuming +z here would fade the engraving in and out a face too early. */
const CAM = [1.5, 1.15, 3.1];
const VIEW = new THREE.Vector3(...CAM).normalize();

function faceQuaternion(n) {
  const z = n.clone().normalize();
  const y = new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  y.crossVectors(z, x);
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(x, y, z),
  );
}

function Block({ labels, activeRef }) {
  const spin = useRef(null);
  const marks = useRef([]);
  /* The spring carries an ABSOLUTE angle, not a wrapped one: wrapping it here
     would make the shortest path across the 0/2π seam look like a full
     reverse revolution. angleDelta picks the direction, the spring integrates
     it, and the angle is free to run past 2π forever. */
  const state = useRef({ x: 0, v: 0 });
  const omega = useMemo(() => omegaFor(0.28), []);

  /* Four faces, however many channels: a face with nothing to say carries the
     wordmark rather than an empty engraving. */
  const faces = useMemo(
    () =>
      FACE_NORMALS.map((n, i) => ({
        n,
        quat: faceQuaternion(n),
        label: labels[i] ?? "GP",
      })),
    [labels],
  );

  const textures = useMemo(
    () =>
      faces.map((f) =>
        makeLabelTexture(f.label, {
          aspect: MARK_W / MARK_H,
          color: CHROME.ink,
          weight: 500,
          tracking: 0.12,
        }),
      ),
    [faces],
  );

  const markMaterials = useMemo(
    () =>
      textures.map(
        (map) =>
          new THREE.MeshStandardMaterial({
            map,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
            roughness: 0.55,
            metalness: 0.08,
            envMapIntensity: 0.4,
          }),
      ),
    [textures],
  );

  useEffect(
    () => () => {
      markMaterials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
    [markMaterials, textures],
  );

  useFrame((_, delta) => {
    const s = spin.current;
    if (!s) return;

    const want = -(activeRef.current ?? 0) * Math.PI * 0.5;
    /* Shortest way round from where the spring actually is, added back on to
       its absolute angle — this is the bit that makes 3 → 0 a quarter turn
       forward instead of three quarters back. */
    const target = state.current.x + angleDelta(state.current.x, want);
    const theta = spring(state.current, target, omega, Math.min(delta, 1 / 20));
    s.rotation.y = theta;

    const sin = Math.sin(theta);
    const cos = Math.cos(theta);
    for (let i = 0; i < faces.length; i++) {
      const node = marks.current[i];
      if (!node) continue;
      const { n } = faces[i];
      /* R_y(theta)·n dotted with the view — how squarely this face is read */
      const facing =
        (n.x * cos + n.z * sin) * VIEW.x + (-n.x * sin + n.z * cos) * VIEW.z;
      const o = Math.max(0, Math.min(1, (facing - 0.1) / 0.45));
      node.visible = o > 0.01;
      markMaterials[i].opacity = o * o;
    }
  });

  return (
    <group ref={spin} rotation={[0, 0, 0]}>
      <RoundedBox args={[1, 1, 1]} radius={0.05} smoothness={5} steps={1}>
        <meshStandardMaterial {...STEEL_MATERIAL} />
      </RoundedBox>
      {faces.map(({ n, quat }, i) => (
        <group
          key={i}
          ref={(node) => {
            marks.current[i] = node;
          }}
          position={n.clone().multiplyScalar(0.5)}
          quaternion={quat}
        >
          <mesh position={[0, 0, MARK_Z]} material={markMaterials[i]}>
            <planeGeometry args={[MARK_W, MARK_H]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ContactBlock({ labels, activeRef, active }) {
  return (
    <CanvasBoundary>
      <Canvas
        camera={{ position: CAM, fov: 30 }}
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          camera.lookAt(0, 0, 0);
        }}
      >
        <ChromeRig />
        <Block labels={labels} activeRef={activeRef} />
      </Canvas>
    </CanvasBoundary>
  );
}
