"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import ShowcaseScene from "./ShowcaseScene";
import ProjectPanel from "./ProjectPanel";
import CanvasBoundary from "@/components/CanvasBoundary";
import { useCardTextures } from "@/lib/useCardTextures";
import { useNearViewport } from "@/lib/useNearViewport";
import { startScroll, stopScroll, scrollY } from "@/lib/scroll";

/*
 * Showcase — the DOM half, after pmndrs/examples "moksha".
 *
 * Structurally the inverse of the usual sticky-pinned section: the canvas is
 * the sticky layer (one viewport tall, pulled back under the content with a
 * negative margin) and the copy scrolls over it normally. The page therefore
 * scrolls exactly as far as its text is long, the scrollbar tells the truth,
 * and every word is real selectable DOM rather than a texture.
 */
export default function Showcase({ items, dict, accent = "#a892ee" }) {
  const section = useRef(null);
  const local = useRef(0);

  const [open, setOpen] = useState(null);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(0);

  const textures = useCardTextures(items);
  const near = useNearViewport(section, true);

  /* One number drives the whole scene: how far the page has scrolled into this
     section, in pixels. Read per frame from the shared Lenis value — never
     from a scroll event, which would be a different moment than the frame. */
  useEffect(() => {
    const el = section.current;
    if (!el || !near) return;

    let top = 0;
    const measure = () => {
      let node = el;
      let y = 0;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      top = y;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    let raf = 0;
    const tick = () => {
      local.current = scrollY() - top;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [near]);

  /* Which block is centred — for the counter in the frame. An observer rather
     than the frame loop: this changes a few times per page, and driving React
     state from rAF would re-render the tree sixty times a second. */
  useEffect(() => {
    const blocks = section.current?.querySelectorAll(".show__block");
    if (!blocks?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number(e.target.dataset.index));
        }
      },
      { threshold: 0.5 },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [items]);

  /* ——— the open project is the URL hash ———
     pushState, so Back closes the panel rather than leaving the page. */
  const openAt = useCallback(
    (i) => {
      setClosing(false);
      setOpen(i);
      const slug = items[i]?.slug;
      if (slug && window.location.hash.slice(1) !== slug) {
        window.history.pushState(null, "", `#${slug}`);
      }
    },
    [items],
  );

  const close = useCallback(() => {
    setClosing(true);
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
    window.setTimeout(() => {
      setOpen(null);
      setClosing(false);
    }, 420);
  }, []);

  useEffect(() => {
    const sync = () => {
      const slug = window.location.hash.slice(1);
      const i = items.findIndex((p) => p.slug === slug);
      setClosing(false);
      setOpen(i === -1 ? null : i);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [items]);

  useEffect(() => {
    if (open !== null && !closing) stopScroll();
    else startScroll();
    return () => startScroll();
  }, [open, closing]);

  const current = open === null ? null : items[open];

  return (
    <section ref={section} className="show theme-metal">
      {/* sticky canvas, pulled back under the copy */}
      <div className="show__bg">
        {near ? (
          <CanvasBoundary>
            <Canvas
              orthographic
              camera={{ zoom: 1, position: [0, 0, 600], near: 0.1, far: 2000 }}
              dpr={[1, 1.75]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
              }}
            >
              <ShowcaseScene
                items={items}
                textures={textures}
                localRef={local}
                accent={accent}
              />
            </Canvas>
          </CanvasBoundary>
        ) : null}
      </div>

      <div className="show__blocks">
        {items.map((item, i) => (
          <article
            key={item.slug}
            className={`show__block${i % 2 ? " show__block--right" : ""}`}
            data-index={i}
            id={`p-${item.slug}`}
          >
            <div className="show__copy">
              <p className="mono-note show__index">
                {String(i + 1).padStart(2, "0")} — {item.kicker}
              </p>
              <h2 className="show__title">{item.title}</h2>
              <p className="show__summary">{item.summary}</p>
              <p className="show__meta">
                <span>{item.year}</span>
                <span className={`show__status show__status--${item.status}`}>
                  {dict.status[item.status]}
                </span>
              </p>
              <button
                type="button"
                className="show__open"
                onClick={() => openAt(i)}
              >
                {dict.hero.open}
                <span aria-hidden>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* moksha's fixed frame: label top-left, counter bottom-right */}
      <div className="show__frame" aria-hidden>
        <span className="show__frameLabel mono-note">{dict.helix.counter}</span>
        <span className="show__frameCount">
          <em>{String(active + 1).padStart(2, "0")}</em>
          <span>/ {String(items.length).padStart(2, "0")}</span>
        </span>
      </div>

      {current ? (
        <ProjectPanel
          project={current}
          dict={dict}
          closing={closing}
          onClose={close}
        />
      ) : null}
    </section>
  );
}
