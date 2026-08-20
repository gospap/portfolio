+++
title = "Overpass Connect"
description = "Corporate site · R3F"
weight = 10

[extra]
status = "live"
banner = "banner.png"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>Live</li>
<li><strong>Role</strong>Design, WebGL and front-end</li>
</ul>

A corporate site whose hero is a voxel cliff built from the client's own CAD mesh, and whose work page flies a camera down a helix of project cards. Every section is a WebGL surface rather than a rectangle with a photo in it.

## Stack

- Next.js
- React Three Fiber
- GLSL
- Lenis

## What made it interesting

- The cliff is one instanced mesh with per-instance colour and matrices rewritten each frame — the first pass used ~350 separate meshes and stuttered.
- On scroll the world splits into two rigid slabs along a jagged interlocked seam, tips, slides and sinks, revealing the next section standing behind it.
- The work page is a scroll-driven helix: click a card and the camera dollies through the glass into a full-screen write-up.

## Screens

<div class="shots">
<img src="overpass2.png" alt="Overpass Connect" loading="lazy" />
</div>

[Visit the live site](https://overpassconnect.vercel.app)
