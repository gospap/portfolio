/* ===========================================================================
   motion.js — framerate-independent motion primitives.

   Everything animated on this site goes through one of these. The rule is that
   no function here may take a per-frame blend factor: they take a *time
   constant in seconds*, so the same call produces the same motion at 30fps,
   60fps or 144fps, and so a timing can be read off the source without knowing
   the refresh rate it was tuned at.
   =========================================================================== */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Hermite ramp, 0 below edge0 and 1 above edge1. Reversed edges ramp down. */
export function smoothstep(edge0, edge1, x) {
  const d = edge1 - edge0;
  if (d === 0) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / d);
  return t * t * (3 - 2 * t);
}

/** Second-order smoothstep — zero 1st *and* 2nd derivative at both ends. */
export function smootherstep(edge0, edge1, x) {
  const d = edge1 - edge0;
  if (d === 0) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / d);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/* ---------------------------------------------------------------------------
   Exponential damping — first order, no velocity.

   Use for anything that only ever chases (opacity, colour, a uniform). The
   value covers half the remaining distance every `halfLife` seconds, exactly,
   for any dt. This is what replaces `lerp(a, b, 0.1)` everywhere.
   --------------------------------------------------------------------------- */
export function damp(current, target, halfLife, dt) {
  if (halfLife <= 0) return target;
  return target + (current - target) * Math.pow(2, -dt / halfLife);
}

/** In-place damp of a THREE.Vector3 toward a plain xyz target. Allocation-free. */
export function damp3(v, tx, ty, tz, halfLife, dt) {
  const k = halfLife <= 0 ? 0 : Math.pow(2, -dt / halfLife);
  v.x = tx + (v.x - tx) * k;
  v.y = ty + (v.y - ty) * k;
  v.z = tz + (v.z - tz) * k;
  return v;
}

/** In-place damp of a THREE.Quaternion toward another. Allocation-free. */
export function dampQ(q, target, halfLife, dt) {
  const k = halfLife <= 0 ? 1 : 1 - Math.pow(2, -dt / halfLife);
  q.slerp(target, k);
  return q;
}

/* ---------------------------------------------------------------------------
   Critically damped spring — second order, carries velocity.

   This is the one that matters. A damped chase (above) always restarts from
   zero speed when the target moves, which is why a scroll reversal on the old
   helix felt like the camera stopped and set off again. A spring keeps its
   velocity through the reversal, so the turn is continuous.

   Integrated ANALYTICALLY rather than with Euler steps: for the critically
   damped case the closed form is

       x(t) = target + (A + B·t)·e^(−ω·t)
       v(t) = (B − ω·(A + B·t))·e^(−ω·t)      with A = x₀ − target, B = v₀ + ω·A

   which is exact and unconditionally stable — a 500ms stall (tab hidden,
   a long GC pause) settles the spring instead of exploding it, so no dt
   clamping is needed to keep it safe.
   --------------------------------------------------------------------------- */

/**
 * @param {{x:number, v:number}} s  mutated in place
 * @param {number} target
 * @param {number} omega  angular frequency; higher = stiffer. See omegaFor().
 * @param {number} dt     seconds
 * @returns {number} the new position, for convenience
 */
export function spring(s, target, omega, dt) {
  const A = s.x - target;
  const B = s.v + omega * A;
  const e = Math.exp(-omega * dt);
  const t = A + B * dt;
  s.x = target + t * e;
  s.v = (B - omega * t) * e;
  return s.x;
}

/**
 * Stiffness expressed as an approximate half-life in seconds, which is a far
 * easier thing to reason about than an angular frequency. The `(A + B·t)` term
 * means the true half-life is a little longer than this for a spring that is
 * moving; treat it as a tuning dial, not a guarantee.
 */
export const omegaFor = (halfLifeSeconds) => Math.LN2 / Math.max(1e-4, halfLifeSeconds);

/** A spring per axis, sharing one omega. Mutates `out` (a THREE.Vector3). */
export function springVec3(state, out, tx, ty, tz, omega, dt) {
  out.x = spring(state.x, tx, omega, dt);
  out.y = spring(state.y, ty, omega, dt);
  out.z = spring(state.z, tz, omega, dt);
  return out;
}

/** Factory for the state springVec3 expects. */
export const makeVec3Spring = (x = 0, y = 0, z = 0) => ({
  x: { x, v: 0 },
  y: { x: y, v: 0 },
  z: { x: z, v: 0 },
});

/* ---------------------------------------------------------------------------
   Magnetic detent.

   Returns a target that has been pulled toward the nearest whole index — but
   only once the input has gone quiet. `strength` ramps from 0 while you are
   actively scrolling to 1 when you stop, so the pull is invisible during the
   gesture and only shows up as cards landing square at the end of it.
   --------------------------------------------------------------------------- */
export function detent(value, speed, { quiet = 0.35, loud = 1.6, max = 1 } = {}) {
  // 1 when |speed| <= quiet, 0 when |speed| >= loud
  const strength = (1 - smoothstep(quiet, loud, Math.abs(speed))) * max;
  if (strength <= 0) return value;
  return lerp(value, Math.round(value), strength);
}

/* ---------------------------------------------------------------------------
   Choreography helper.

   Every per-card animation on the helix is a pure function of the card's
   signed distance from the camera's focus. Pure means: reversible, identical
   on every pass, and impossible to leave in a wrong state by scrolling fast —
   which is exactly what an IntersectionObserver cannot promise.
   --------------------------------------------------------------------------- */
export function influence(distance, radius = 1) {
  const d = clamp01(Math.abs(distance) / radius);
  // cosine bell: 1 at the focus, 0 at the radius, flat derivative at both ends
  return 0.5 + 0.5 * Math.cos(d * Math.PI);
}

/** Shortest signed difference between two angles, in radians. */
export function angleDelta(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** True when the visitor has asked for less motion. Safe during SSR. */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
