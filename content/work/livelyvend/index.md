+++
title = "LivelyVend"
description = "Live shopping platform"
weight = 10

[extra]
status = "live"
banner = "banner.jpg"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>Live</li>
<li><strong>Role</strong>End to end: design, layout, front end, back end, database and deployment</li>
</ul>

A live-selling platform: merchants run shopping broadcasts, viewers chat and react in real time, and products surface and disappear inside the video as the host talks about them.

{{ video(url="/media/vids/livelyvend.mp4", full=true, autoplay=true, loop=true, muted=true, playsinline=true, alt="LivelyVend") }}

## Stack

- React
- Node.js
- WebRTC
- Shopify API
- WooCommerce API

## What made it interesting

- Real-time layer carries chat, reactions and product state to every viewer at once, and stays consistent when someone joins mid-broadcast.
- Two-way catalogue sync with Shopify and WooCommerce, so stock is right during a broadcast rather than right afterwards.
- Attribution that can actually answer which sales came from the stream, not just which happened during it.
- Shipped through a CI/CD pipeline rather than by hand, and I contributed to an in-house Jenkins shared library that the wider set of projects now deploys through, so the release path is one reviewed thing instead of a script per repository.

[Visit the live site](https://livelyvend.com)
