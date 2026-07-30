"use client";

import { useEffect, useRef } from "react";

/**
 * The write-up behind a card. A fixed, scrollable overlay marked
 * data-lenis-prevent so the wheel reaches it instead of being eaten by the
 * page's smooth scroll.
 *
 * It animates in with a keyframe rather than a class toggled on the next
 * frame: requestAnimationFrame is throttled in background tabs, and a panel
 * whose entrance never ran would be stranded off-screen instead of simply
 * arriving without animation.
 */
export default function ProjectPanel({ project, dict, closing, onClose }) {
  const ref = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Focus trap. The canvas behind is still in the tab order otherwise, and
     tabbing out of a full-screen overlay into an invisible 3D scene is a dead
     end a keyboard user cannot see their way out of. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const focusable = el.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  const statusLabel = dict.status[project.status] ?? "";

  return (
    <div
      ref={ref}
      className={`pnl${closing ? " is-closing" : ""}`}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className="pnl__inner">
        <button
          ref={closeBtn}
          type="button"
          className="pnl__close"
          onClick={onClose}
        >
          <span aria-hidden>←</span>
          {dict.panel.back}
        </button>

        <div className="pnl__grid">
          <div className="pnl__main">
            <p className="kicker">{project.kicker}</p>
            <h2 className="pnl__title">{project.title}</h2>

            <ul className="pnl__meta">
              <li>
                <span className="mono-note">{dict.panel.year}</span>
                <span>{project.year}</span>
              </li>
              <li>
                <span className="mono-note">{dict.panel.role}</span>
                <span>{project.role}</span>
              </li>
              <li>
                <span className="mono-note">Status</span>
                <span className={`pnl__status pnl__status--${project.status}`}>
                  {statusLabel}
                </span>
              </li>
            </ul>

            <p className="pnl__summary">{project.summary}</p>

            <h3 className="pnl__h3">{dict.panel.highlights}</h3>
            <ol className="pnl__points">
              {project.highlights.map((h, i) => (
                <li key={i}>
                  <span className="pnl__pointNum mono-note">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p>{h}</p>
                </li>
              ))}
            </ol>

            {project.url ? (
              <a
                className="btn pnl__cta"
                href={project.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {dict.panel.visit}
                <span aria-hidden>↗</span>
              </a>
            ) : null}
          </div>

          <aside className="pnl__aside">
            <h3 className="pnl__h3">{dict.panel.stack}</h3>
            <ul className="pnl__stack">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
