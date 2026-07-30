"use client";

import { useEffect } from "react";
import { acquireLenis } from "@/lib/scroll";

/**
 * Owns the lifetime of the shared Lenis instance for the whole app. Renders
 * nothing. Everything that needs a scroll value reads it from lib/scroll —
 * there is deliberately no context here, because the consumers are inside
 * animation frame loops where a React re-render would be the wrong mechanism.
 */
export default function SmoothScroll() {
  useEffect(() => acquireLenis(), []);
  return null;
}
