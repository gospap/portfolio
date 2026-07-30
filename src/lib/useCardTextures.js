"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { makePlate, PLATE_STYLES } from "@/lib/plates";

/**
 * One texture per card, shared by the hero ring and the project helix.
 *
 * Every card starts on a generated plate and is upgraded to its screenshot if
 * one loads. That ordering matters: the scene is complete on the first frame
 * instead of after the network settles, and a missing or half-deployed image
 * degrades to art rather than to a black rectangle.
 *
 * @param {Array<{key:string, cover?:string, plate?:string, label?:string, sub?:string}>} items
 * @returns {Array<THREE.Texture|null>} indexed to match `items`
 */
export function useCardTextures(items) {
  const [textures, setTextures] = useState([]);

  useEffect(() => {
    let dead = false;
    const owned = [];

    const initial = items.map((item, i) => {
      const tex = makePlate({
        style: item.plate ?? PLATE_STYLES[i % PLATE_STYLES.length],
        seed: i + 7,
        label: item.label ?? "",
        sub: item.sub ?? "",
      });
      if (tex) owned.push(tex);
      return tex;
    });
    if (!dead) setTextures(initial);

    const loader = new THREE.TextureLoader();
    items.forEach((item, i) => {
      if (!item.cover) return;
      loader.load(
        item.cover,
        (tex) => {
          if (dead) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          owned.push(tex);
          setTextures((prev) => {
            const next = prev.slice();
            next[i] = tex;
            return next;
          });
        },
        undefined,
        () => {
          /* 404 → keep the plate. The screenshot set is allowed to be
             incomplete; that is not an error worth logging. */
        },
      );
    });

    return () => {
      dead = true;
      for (const t of owned) t.dispose();
    };
    /* items is rebuilt per render by the page, so this depends on the identity
       of the keys rather than on the array itself */
  }, [items.map((i) => `${i.key}:${i.cover ?? ""}`).join("|")]);

  return textures;
}

/** Aspect ratio of a loaded texture, or a sane default before it arrives. */
export function textureAspect(tex) {
  const img = tex?.image;
  if (!img?.width || !img?.height) return 0.705; // the plate's 768:1090
  return img.width / img.height;
}
