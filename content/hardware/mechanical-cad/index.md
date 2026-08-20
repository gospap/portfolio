+++
title = "Mechanical CAD"
description = "Enclosures & parts"
weight = 30

[extra]
status = "wip"
banner = "banner.png"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>In development</li>
<li><strong>Role</strong>Mechanical design</li>
</ul>

Parametric enclosure and part design in Autodesk Inventor, exported to meshes that survive the trip into a browser — the Overpass hero cliff is built from one of these models rather than from a stand-in primitive.

## What made it interesting

- Designed for manufacture first and rendering second, which is the opposite order from most models that end up on the web.
- Export path solved end to end: Inventor to a mesh a WebGL pipeline can actually load, after DWFX and DWG both proved unusable.
