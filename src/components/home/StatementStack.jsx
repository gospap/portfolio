"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { trackEnter } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { useNearViewport } from "@/lib/useNearViewport";

const StatementScene = dynamic(() => import("./StatementScene"), { ssr: false });

/*
 * The DOM half of the statement's object.
 *
 * The quote beside this says the interface, the service and the board are not
 * three jobs but three views of one problem. So: three machined plates, splayed
 * apart and turned away from each other, that converge into a single aligned
 * stack as the quote inks itself in. It is the sentence, as an object.
 *
 * It shares the quote's scroll window exactly — same element geometry, same
 * lead and run as ScrubQuote's tracker — so the plates finish closing on the
 * frame the last word lands. Two trackers rather than one shared ref because
 * the section between them is server-rendered markup; they read the same
 * Lenis value at the same moment, so the result is identical.
 */
export default function StatementStack() {
  const host = useRef(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const near = useNearViewport(host, false, "80% 0px");

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion()) return;
    setReady(true);

    const tracker = trackEnter(el, { lead: 0.62, run: 1.05 });
    let raf = 0;
    const tick = () => {
      progress.current = tracker.read();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      tracker.dispose();
      setReady(false);
    };
  }, []);

  return (
    <div ref={host} className="stmt__art" aria-hidden>
      {ready && near ? (
        <StatementScene progress={progress} active={near} />
      ) : null}
    </div>
  );
}
