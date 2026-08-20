+++
title = "Space Canvas Designer"
description = "CAD module · metre-accurate"
weight = 20

[extra]
status = "archived"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>Archived</li>
<li><strong>Role</strong>Architecture and implementation</li>
</ul>

A free-placement floor-plan editor for event spaces. Geometry is stored in metres, not pixels, so a plan drawn on a laptop is still dimensionally true when it is used to lay out a real hall.

{{ video(url="/media/vids/space-canvas.mp4", full=true, autoplay=true, loop=true, muted=true, playsinline=true, alt="Space Canvas Designer") }}

## What made it interesting

- Calibration tool: click two points of known real distance, type the metres, and the editor derives its own pixels-per-metre scale.
- Stage zoom and pan are a purely visual transform that never mutates stored coordinates — the plan cannot drift by being looked at.
- Stands, doors, arrows and fixtures all share one move/resize/rotate system, including L- and U-shaped stands.
