"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

import "./bent"; // registers <bentPlaneGeometry> and <meshSineMaterial>
import { HeroCardMaterial } from "./heroCardMaterial"; // registers <heroCardMaterial>
import { APERTURE_FRAG, APERTURE_VERT } from "./aperture";
import { makeBannerTexture } from "./bannerTexture";
import { makeCardMask } from "./cardMask";
import CanvasBoundary from "@/components/CanvasBoundary";
import { useCardMedia, mediaAspect } from "@/lib/useCardMedia";
import { useNearViewport } from "@/lib/useNearViewport";
import {
  angleDelta,
  damp,
  influence,
  omegaFor,
  prefersReducedMotion,
  spring,
} from "@/lib/motion";

/** cover-fit multiplier: fill the card without distorting, cropping the long axis */
function coverScale(imageAspect, paneAspect) {
  return imageAspect > paneAspect
    ? [paneAspect / imageAspect, 1]
    : [1, imageAspect / paneAspect];
}

/* 16:9, and the whole ring scaled to 0.85 of its first size so it sits smaller
   in frame. Scaling every dimension together rather than just pulling the
   camera back keeps the gaps and clearances proportional: the ring is a touch
   tighter now so the remaining cards feel a bit closer together. */
const CARD_W = 1.51;
const CARD_H = 0.85;
const RING_RADIUS = 2.35;
/* Bend scaled to the card's width, so a wide card curves as much as a narrow
   one did rather than looking almost flat. */
const CARD_BEND = 0.153;
/** full turns of the ring across the section's scroll span */
const TURNS = 1;

/* --------------------------------------------------------------------- card */

/**
 * The click transition: renders the ring to a target and composites it against
 * the chosen card's own footage through the aperture wipe ported from the
 * overpass-editions work page (see ./aperture.js).
 *
 * Takes over drawing entirely — a useFrame priority of 1 or more switches R3F's
 * automatic render off — but only does the expensive path while a transition is
 * actually running. At rest this is one ordinary render and no target at all,
 * which is the difference between a wipe you can afford and the nine-portal
 * version that made this hero stutter.
 */
function Aperture({ active, detail, coverRef }) {
  const { gl, scene, camera, size } = useThree();
  const target = useFBO();
  const trans = useRef(0);

  const quad = useMemo(() => {
    const s = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      vertexShader: APERTURE_VERT,
      fragmentShader: APERTURE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tWork: { value: null },
        tDetail: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCoverTo: { value: new THREE.Vector2(1, 1) },
        uTransition: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    mesh.frustumCulled = false;
    s.add(mesh);
    return { s, cam, mat, mesh };
  }, []);

  useEffect(
    () => () => {
      quad.mesh.geometry.dispose();
      quad.mat.dispose();
    },
    [quad],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    trans.current = damp(trans.current, active ? 1 : 0, 0.2, dt);

    if (trans.current <= 0.002) {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    const u = quad.mat.uniforms;
    u.tWork.value = target.texture;
    u.tDetail.value = detail ?? target.texture;
    u.uTransition.value = trans.current;
    u.uCoverTo.value.set(coverRef.current[0], coverRef.current[1]);
    // gl_FragCoord is in device pixels, so this must be the drawing buffer
    gl.getDrawingBufferSize(u.uResolution.value);
    gl.render(quad.s, quad.cam);
  }, 1);

  void size;
  return null;
}

/**
 * A card, and — while you are entering it — a portal, after pmndrs/examples
 * "enter-portals". Clicking damps `blend` to 1, which is MeshPortalMaterial's
 * own "you are inside now" transition: the frame stops clipping and its
 * contents take the whole viewport. The camera dollies toward the card at the
 * same time (see Rig), so the two halves agree and you arrive *through* the
 * card rather than past it.
 *
 * ONLY the card being entered is a portal. Every MeshPortalMaterial renders
 * its scene to its own target every frame, so nine of them on a ring is nine
 * extra render passes per frame — which is exactly what made this hero stutter
 * when all the cards were portals. At rest a card is a flat drei <Image>: one
 * draw call, no target. The swap is unnoticeable because the portal's interior
 * is the same plate at the same framing.
 */
function Card({ item, media, index, count, onOpen, flying, rotRef }) {
  const group = useRef(null);
  const matRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const lift = useRef(0);
  const playing = useRef(false);

  const angle = (index / count) * Math.PI * 2;
  const position = useMemo(
    () => [Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS],
    [angle],
  );

  const mask = useMemo(
    () => makeCardMask({ title: item.label, kicker: item.sub, index }),
    [item.label, item.sub, index],
  );
  useEffect(() => () => mask?.dispose(), [mask]);

  const texture = media?.texture ?? null;
  const video = media?.video ?? null;
  const cover = useMemo(
    () => coverScale(mediaAspect(texture), CARD_W / CARD_H),
    [texture],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);

    /* How square-on to the camera this card is. The ring's rotation plus the
       card's own angle is zero exactly when it faces front, so focus is a pure
       function of the rotation — no events, no per-card bookkeeping. */
    const slots =
      angleDelta(0, rotRef.current + angle) / ((Math.PI * 2) / count);
    const focus = influence(slots, 1.0);

    /* Only the card in focus plays. Nine decoding videos would cost more than
       everything else in the scene put together; the rest hold their last
       decoded frame, which is why the hook waits for `loadeddata` before
       swapping the texture in. */
    if (video) {
      const want = focus > 0.72 && flying === null;
      if (want !== playing.current) {
        playing.current = want;
        if (want) video.play().catch(() => {});
        else video.pause();
      }
    }

    const m = matRef.current;
    if (m) {
      m.uFocus = damp(m.uFocus, focus, 0.1, dt);
      m.uHover = damp(m.uHover, hovered && flying === null ? 1 : 0, 0.09, dt);
      m.uPlaying = damp(m.uPlaying, playing.current ? 1 : 0, 0.14, dt);
      m.uTime = state.clock.elapsedTime;
    }

    lift.current = damp(
      lift.current,
      hovered && flying === null ? 1 : 0,
      0.09,
      dt,
    );
    const g = group.current;
    if (g) {
      g.scale.setScalar(1 + lift.current * 0.11);
      // the hovered card leans out of the ring toward you
      const k = 1 + lift.current * 0.05;
      g.position.set(position[0] * k, position[1], position[2] * k);
    }
  });

  const over = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);
  const out = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "";
  }, []);

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  if (!texture) return null;

  return (
    /* rotation.y = angle, NOT Math.PI + angle.
       A plane's normal is +z; rotating by `angle` maps it to the outward radial
       direction, so the card faces away from the ring's centre — toward a
       camera standing outside it. The pmndrs demo this ring is modelled on adds
       Math.PI, which turns every card to face inward, and from outside you are
       therefore looking at its back: the texture is mirrored. Nobody notices on
       an abstract photo. It is glaring the moment the card carries text. */
    <group ref={group} position={position} rotation={[0, angle, 0]}>
      {/* One material, always. The card used to swap to a MeshPortalMaterial
          while it was being entered; the aperture pass replaced that, so the
          card just stays a card and the transition happens above it. */}
      <mesh
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(index);
        }}
      >
        <bentPlaneGeometry args={[CARD_BEND, CARD_W, CARD_H, 28, 20]} />
        <heroCardMaterial
          key={HeroCardMaterial.key}
          ref={matRef}
          tMap={texture}
          tMask={mask}
          uCover={cover}
          uSize={[CARD_W, CARD_H]}
          /* DoubleSide: the far half of the ring has to be drawn, or you see
             an arc instead of a circle. Its mirroring is undone in the shader
             via gl_FrontFacing — see heroCardMaterial.js. */
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------- banner */

function Banner({ words }) {
  const ref = useRef(null);
  const texture = useMemo(() => makeBannerTexture(words), [words]);

  /* Wave height, set imperatively — see MeshSineMaterial in ./bent.js for why
     this cannot be a JSX prop. 0.075 keeps the crest clear of the cards' lower
     edge even when one is scaled up on hover; the ported default of 0.25 put
     the band straight through them. */
  useEffect(() => {
    if (ref.current) ref.current.material.amplitude.value = 0.064;
  }, []);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh || !texture) return;
    mesh.material.time.value += delta * 0.9;
    mesh.material.map.offset.x += delta * 0.035;
  });

  useEffect(() => () => texture?.dispose(), [texture]);
  if (!texture) return null;

  return (
    /* Sits just under the cards rather than down at the foot of the ring, so
       it reads as a collar on the carousel instead of a separate object. */
    /* Cards span y −0.425…+0.425, or −0.47 when one is scaled up on hover. The
       band's crest reaches this y + half its height + the wave: −0.76 + 0.085 +
       0.064 = −0.611, clearing the lowest card edge by 0.14. */
    <mesh ref={ref} position={[0, -0.76, 0]}>
      <cylinderGeometry
        args={[RING_RADIUS + 0.34, RING_RADIUS + 0.34, 0.17, 160, 16, true]}
      />
      {/* Opaque: the band is solid black in the texture, so transparency would
          only let the silver behind wash it back to grey. */}
      <meshSineMaterial
        map={texture}
        map-anisotropy={16}
        map-repeat={[16, 1]}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

/* --------------------------------------------------------------------- rig */

function Rig({
  cards,
  media,
  sectionRef,
  dragRef,
  flying,
  onOpen,
  bannerWords,
}) {
  const group = useRef(null);
  const { camera, size } = useThree();
  const tracker = useRef(null);
  const rot = useRef({ x: 0, v: 0 });
  /* the ring's current rotation, readable by the cards — it is the only thing
     they need to work out how square-on to the camera they are */
  const rotValue = useRef(0);
  const idle = useRef(0);
  const cam = useRef({
    x: { x: 0, v: 0 },
    y: { x: 0, v: 0 },
    z: { x: 26, v: 0 },
  });
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  const count = cards.length;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const g = group.current;
    if (!g) return;

    /* The ring only rotates from manual drag now; scrolling the page should
       simply move on to the next chapter instead of spinning the carousel. */
    let target = dragRef.current;

    /* While flying, the ring turns the chosen card to face the camera. Solved
       through angleDelta so it takes the short way round rather than
       unwinding several turns of accumulated rotation. */
    if (flying !== null) {
      const want = -(flying / count) * Math.PI * 2;
      target = rot.current.x + angleDelta(rot.current.x, want);
    }

    if (reduced.current) {
      rot.current.x = target;
      rot.current.v = 0;
    } else {
      spring(rot.current, target, omegaFor(flying === null ? 0.19 : 0.13), dt);
    }
    g.rotation.y = rot.current.x;
    rotValue.current = rot.current.x;

    /* ——— camera ———
       Starts far out on z and springs in, which reads as the ring being
       approached rather than as a page that popped into place.

       Entering a portal dollies the camera almost onto the card's face. That
       move and the material's `blend` are two halves of one gesture: the frame
       stops clipping just as the camera reaches it, so you pass through the
       card rather than watch it grow. */
    const px = state.pointer.x;
    const py = state.pointer.y;
    /* Far enough back that the WHOLE ring fits across the frame. At 14.2 the
       near face is 11.65 away, where a 15° fov shows ~3.07 units of height and
       therefore ~5.46 of width on a 16:9 viewport — against a ring 5.1 across.
       At the old 10.6 the sides ran off both edges, which is why it read as a
       band of cards rather than a circle. */
    const goalZ = flying === null ? 14.2 : RING_RADIUS + 1.05;
    if (reduced.current) {
      camera.position.set(0, 1.2, goalZ);
    } else {
      camera.position.set(
        spring(cam.current.x, -px * 1.9, omegaFor(0.3), dt),
        spring(cam.current.y, py * 0.85 + 1.35, omegaFor(0.3), dt),
        spring(cam.current.z, goalZ, omegaFor(0.42), dt),
      );
    }
    camera.lookAt(0, 0, 0);

    /* The ring moves under a stationary pointer, so hover has to be re-tested
       every frame rather than only on pointermove. */
    state.events.update?.();
  });

  /* Nudge the whole ring right of centre on wide screens so the focused card
     clears the portrait panel on the left. On narrow screens the panel moves to
     the bottom, so the ring goes back to centre. */
  /* Only a small nudge now. The ring fills nearly the whole frame width, so
     anything more pushes its right edge off screen — the portrait panel gets
     the ring's left arc passing behind its fade instead, which is what the
     fade is for. */
  const shift = size.width >= 900 ? 0.2 : 0;

  /* The tilt and the shift belong to the RING, not to the cards — so the
     banner has to live inside them too. It used to be a sibling of this whole
     group, which left it level and centred while the cards were tilted 0.14 and
     pushed 0.62 to the right: the band visibly cut across the circle instead of
     wrapping it. The inner group is the only thing that spins. */
  return (
    <group position={[shift, 0, 0]} rotation={[0, 0, 0.14]}>
      <Banner words={bannerWords} />
      <group ref={group}>
        {cards.map((c, i) => (
          <Card
            key={c.key}
            item={c}
            index={i}
            count={count}
            media={media[i]}
            rotRef={rotValue}
            flying={flying}
            onOpen={onOpen}
          />
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------- shell */

export default function HeroCarousel({
  cards,
  dict,
  name,
  bannerWords,
  portrait,
}) {
  const section = useRef(null);
  const drag = useRef(0);
  const router = useRouter();
  const [flying, setFlying] = useState(null);
  /* null once the file 404s, which swaps the monogram plate in. Keeps a
     missing portrait from showing a broken-image icon in the hero. */
  const [photo, setPhoto] = useState(portrait || null);
  const media = useCardMedia(cards);

  /* ——— why the page used to arrive slowly after the wipe ———
     Next prefetches <Link>s that are on screen. It cannot prefetch a
     router.push, because it has no idea one is coming — so the destination's
     JS chunk and RSC payload were only requested at the moment of the push,
     which is AFTER the 1.05s of animation. The whole fetch therefore happened
     with nothing left to hide it.

     Nine cards share three routes, so warming all of them on mount costs three
     requests and removes the wait entirely: by the time the aperture is open
     the route is already in the client cache and the swap is instant. */
  useEffect(() => {
    const seen = new Set();
    for (const card of cards) {
      const base = card.route?.split("#")[0];
      if (!base || seen.has(base)) continue;
      seen.add(base);
      router.prefetch(base);
    }
  }, [cards, router]);

  /* Cover-fit for the incoming half of the aperture: the card's footage has to
     fill a viewport whose aspect is not its own. Held in a ref because the
     render pass reads it every frame and must not re-render to get it. */
  const detailCover = useRef([1, 1]);
  useEffect(() => {
    const tex = flying === null ? null : media[flying]?.texture;
    const a = mediaAspect(tex);
    const v = window.innerWidth / Math.max(1, window.innerHeight);
    detailCover.current = a > v ? [v / a, 1] : [1, a / v];
  }, [flying, media]);
  /* `true` initially: the hero is at the top of the page, so waiting for the
     observer's first callback would cost a visible frame of empty stage. */
  const near = useNearViewport(section, true);

  /* ——— drag ———
     Pointer events on the wrapper rather than on the canvas: the canvas is
     also the raycast surface, and a drag that starts on a card must not be
     swallowed by that card's click handler. A small threshold separates the
     two — under 6px is a click, over it is a drag. */
  const dragging = useRef(null);
  const moved = useRef(0);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = e.clientX;
    moved.current = 0;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (dragging.current === null) return;
    const dx = e.clientX - dragging.current;
    dragging.current = e.clientX;
    moved.current += Math.abs(dx);
    /* PLUS, not minus. With the camera on +z, a positive rotation.y carries the
       front of the ring toward +x — to the right. So dragging right must add:
       the card you have hold of goes the way your hand goes. The sign was
       inverted here, which is why the ring fought the cursor. */
    if (moved.current > 6) drag.current += dx * 0.0055;
  }, []);

  const endDrag = useCallback(() => {
    dragging.current = null;
  }, []);

  const open = useCallback(
    (index) => {
      // a drag that ended on a card is not a click on it
      if (moved.current > 6) return;
      const card = cards[index];
      if (!card?.route) return;
      setFlying(index);
      /* The aperture is the whole transition — there is no DOM wipe over it.
         By ~1.05s it has opened to full and the screen is the card's own
         footage, so the route swap underneath is invisible. */
      window.setTimeout(() => router.push(card.route), 1050);
    },
    [cards, router],
  );

  /* Coming back via the browser's Back button must not land on a wiped-out
     hero, so the overlay clears whenever this component is shown again. */
  useEffect(() => {
    const onShow = () => setFlying(null);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  return (
    <section className="hero theme-metal" ref={section} aria-label={name}>
      <div className="hero__stage">
        <div
          className="hero__canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {near ? (
            <CanvasBoundary>
              <Canvas
                camera={{ position: [0, 1.2, 26], fov: 15, near: 0.1, far: 60 }}
                dpr={[1, 1.75]}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance",
                }}
                onCreated={({ gl }) => {
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.05;
                }}
              >
                {/* Same numbers as the reference: with the camera at z≈9.5 and a
                  ring radius of 1.85, near=8.5/far=12.5 puts the fade exactly
                  across the far half of the ring. The colour must match the
                  mid-tone of the CSS backdrop behind the transparent canvas —
                  see hero.css — or the far cards fade to a shade that is not
                  actually behind them. */}
                {/* re-registered on the pulled-back camera: near face ~11.65
                  away, far face ~16.75, so the fade covers the back half of
                  the ring and nothing else */}
                <fog attach="fog" args={["#c5c8d1", 13, 18.5]} />
                <Rig
                  cards={cards}
                  media={media}
                  sectionRef={section}
                  dragRef={drag}
                  flying={flying}
                  onOpen={open}
                  bannerWords={bannerWords}
                />
                <Aperture
                  active={flying !== null}
                  detail={flying === null ? null : media[flying]?.texture}
                  coverRef={detailCover}
                />
              </Canvas>
            </CanvasBoundary>
          ) : null}
        </div>

        {/* Left column: portrait over a band that runs the full height of the
            hero and fades out to the right, so the ring is never cut by a hard
            edge — it dissolves behind the copy instead. pointer-events stay
            off so the whole stage remains draggable. */}
        <aside className="hero__aside">
          <div className="hero__portrait">
            {photo ? (
              /* a plain <img>: next/image would want intrinsic dimensions for
                 a file that is allowed not to exist yet */
              <img
                src={photo}
                alt={name}
                onError={() => setPhoto(null)}
                draggable={false}
              />
            ) : (
              <span className="hero__portraitFallback" aria-hidden>
                GP
              </span>
            )}
          </div>

          <div className="hero__copy">
            <p className="hero__role mono-note">{dict.hero.role}</p>
            <h1 className="hero__name">{name}</h1>
            <p className="hero__tagline">{dict.hero.tagline}</p>
          </div>
        </aside>

        <p className="hero__hint mono-note" aria-hidden>
          {dict.hero.hint}
        </p>
      </div>

      {/* The ring is a canvas. These are the real, focusable, crawlable
          equivalents of its cards — visually hidden, but the only way in for a
          keyboard or a screen reader, and the only version a crawler sees. */}
      <ul className="hero__index sr-only">
        {cards.map((c) => (
          <li key={c.key}>
            {c.route ? <a href={c.route}>{c.label}</a> : <span>{c.label}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
