"use client";

import { useEffect, useRef } from "react";

/**
 * One-shot entrance for DOM content. Unobserves after firing, so a long page
 * ends up with no live observers rather than one per element.
 *
 * `index` staggers siblings through the --i custom property (see globals.css)
 * rather than nth-child, so the stagger order can differ from the DOM order.
 */
export default function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className = "",
  threshold = 0.2,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen at mount is shown immediately: animating it
    // in would mean the first thing a visitor sees is a fade, which reads as
    // a slow page rather than as motion design.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ "--i": index }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
