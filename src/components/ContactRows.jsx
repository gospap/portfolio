"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNearViewport } from "@/lib/useNearViewport";
import { prefersReducedMotion } from "@/lib/motion";

const ContactBlock = dynamic(() => import("@/components/three/ContactBlock"), {
  ssr: false,
});

/**
 * Contact rows with copy-to-clipboard. No form, no backend, no API key in a
 * Vercel environment variable — for three links that is all infrastructure and
 * no benefit, and a contact form is a slower mailto with a spam problem.
 *
 * The rows also drive the machined block beside them: whichever row has the
 * pointer or the focus turns its face round to be read. Which row that is goes
 * into a REF rather than state — the block reads it inside its own frame, and
 * re-rendering three rows to move one object would be the wrong mechanism.
 */
export default function ContactRows({ links, dict }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(0);
  const host = useRef(null);
  const activeRow = useRef(0);
  const [scene, setScene] = useState(false);
  const near = useNearViewport(host, false, "60% 0px");

  useEffect(() => setScene(!prefersReducedMotion()), []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* Clipboard is permission-gated and refuses outright in some contexts.
         Falling back to a selection lets the visitor finish the job with
         Ctrl+C rather than being told nothing happened. */
      const el = document.getElementById(`cv-${key}`);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      return;
    }
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  }, []);

  return (
    <div ref={host} className="contact__grid">
      {/* The block is an INDEX of the rows, so it needs rows to index. With
          one channel there is nothing to turn between and it would be exactly
          the decorative floating object this site does not do — it stays off
          until profile.js has a second link in it. */}
      {scene && near && links.length > 1 ? (
        <div className="contact__art" aria-hidden>
          <ContactBlock
            labels={links.map((l) => l.label)}
            activeRef={activeRow}
            active={near}
          />
        </div>
      ) : null}

      <div className="contact__rows">
        {links.map((l, i) => (
          <div
            className="contact__row"
            key={l.key}
            onPointerEnter={() => {
              activeRow.current = i;
            }}
            onFocusCapture={() => {
              activeRow.current = i;
            }}
          >
            <span className="mono-note contact__label">{l.label}</span>
            <a
              id={`cv-${l.key}`}
              className="contact__value"
              href={l.href}
              {...(l.key === "email"
                ? {}
                : { target: "_blank", rel: "noreferrer noopener" })}
            >
              {l.value}
            </a>
            <button
              type="button"
              className={`contact__copy${copied === l.key ? " is-done" : ""}`}
              onClick={() => copy(l.key, l.value)}
              aria-label={`${dict.contact.copyAria}: ${l.value}`}
            >
              {copied === l.key ? dict.contact.copied : dict.contact.copy}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
