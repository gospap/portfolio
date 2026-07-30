"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Contact rows with copy-to-clipboard. No form, no backend, no API key in a
 * Vercel environment variable — for three links that is all infrastructure and
 * no benefit, and a contact form is a slower mailto with a spam problem.
 */
export default function ContactRows({ links, dict }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(0);

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
    <div className="contact__rows">
      {links.map((l) => (
        <div className="contact__row" key={l.key}>
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
  );
}
