"use client";

import { Component } from "react";

/**
 * Keeps a WebGL failure local to its canvas.
 *
 * Everything visual on this site is a canvas, and the ways one can fail are
 * not hypothetical: a driver that rejects a shader, a machine that has run out
 * of contexts, a GPU blocklist entry, hardware acceleration switched off. Any
 * of those throws during render, and without a boundary React unmounts the
 * whole route — a blank page for a visitor whose only fault is an old laptop.
 *
 * With one, the scene simply does not appear: the section keeps its background
 * and its DOM content, which on every page here is the same information the
 * scene was showing.
 */
export default class CanvasBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Worth one line in the console — silently dropping the scene would make
    // a real shader bug very hard to find in development.
    console.warn("[canvas] scene disabled after an error:", error?.message ?? error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
