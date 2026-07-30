"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { makePlate, PLATE_STYLES } from "@/lib/plates";

/**
 * A texture per card: the project's video if there is one, otherwise a
 * generated plate.
 *
 * Every card starts on a plate and is upgraded to video only once the file has
 * actually decoded a frame. That ordering is what keeps a missing or still-
 * encoding video from ever showing as a black rectangle — the ring is complete
 * on the first frame and improves from there.
 *
 * The <video> elements are handed back so the caller can play only the card in
 * focus. Nine videos decoding at once would cost more than the whole rest of
 * the scene; one does not.
 *
 * @param {Array<{key:string, slug?:string, video?:string, label?:string, sub?:string, plate?:string}>} cards
 * @returns {Array<{texture: THREE.Texture|null, video: HTMLVideoElement|null}>}
 */
export function useCardMedia(cards) {
  const [media, setMedia] = useState([]);

  const cardsKey = cards
    .map((card) => `${card.key}:${card.video ?? ""}`)
    .join("|");

  useEffect(() => {
    let dead = false;
    const owned = [];
    const videos = [];

    const entries = cards.map((card, i) => {
      const plate = makePlate({
        style: card.plate ?? PLATE_STYLES[i % PLATE_STYLES.length],
        seed: i + 7,
        label: card.label ?? "",
        sub: card.sub ?? "",
      });
      if (plate) owned.push(plate);
      return { texture: plate, video: null };
    });
    if (!dead) setMedia(entries);

    cards.forEach((card, i) => {
      if (!card.video) return;

      const el = document.createElement("video");
      el.src = card.video;
      el.muted = true; // autoplay is only permitted for muted video
      el.loop = true;
      el.playsInline = true;
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      videos.push(el);

      const onReady = () => {
        if (dead) return;
        const tex = new THREE.VideoTexture(el);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        // no mipmaps for video: they would be regenerated every frame
        tex.generateMipmaps = false;

        /* ——— why a paused card used to show nothing ———
           Modern three drives VideoTexture from requestVideoFrameCallback,
           which only fires when the element PRESENTS a new frame. A paused
           video never presents one, so needsUpdate was never set and the
           texture was never uploaded — the card stayed blank until the first
           time it played, and went back to showing that stale frame after.

           One explicit upload here gives every card a visible still from the
           moment its file has decoded, whether or not it is the one playing. */
        tex.needsUpdate = true;
        el.__tex = tex; // so the pause handler below can force the still
        owned.push(tex);
        setMedia((prev) => {
          const next = prev.slice();
          next[i] = { texture: tex, video: el };
          return next;
        });
      };

      /* loadeddata means one frame has decoded, so the texture has something to
         show while paused — without it a card that is not in focus would be
         blank until the first time it played. */
      el.addEventListener("loadeddata", onReady, { once: true });

      /* Every time it pauses, the frame it stopped on is the still the card
         will hold. Upload it once, or the card keeps whatever was last pushed
         to the GPU — which after a pause is a frame or two behind. */
      el.addEventListener("pause", () => {
        const entry = el.__tex;
        if (entry) entry.needsUpdate = true;
      });
      el.__tex = null;
      el.addEventListener(
        "error",
        () => {
          /* No video for this project yet — the plate stays. Not worth logging:
             the set is allowed to be incomplete. */
        },
        { once: true },
      );
      el.load();
    });

    return () => {
      dead = true;
      for (const v of videos) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
      for (const t of owned) t.dispose();
    };
    /* Keyed on the cards' identity rather than the array, which the page
       rebuilds on every render. */
  }, [cardsKey]);

  return media;
}

/** Aspect of whatever ended up in the texture — video or plate. */
export function mediaAspect(texture) {
  const img = texture?.image;
  // 16:9 default: it is what both the plates and the expected clips are, so a
  // texture that has not reported its size yet is framed right anyway
  if (!img) return 16 / 9;
  const w = img.videoWidth || img.width;
  const h = img.videoHeight || img.height;
  if (!w || !h) return 16 / 9;
  return w / h;
}
