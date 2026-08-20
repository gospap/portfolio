+++
title = "BeasyPro"
description = "Hiring pipeline"
weight = 30

[extra]
status = "live"
banner = "banner.jpg"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>Live</li>
<li><strong>Role</strong>End to end: design, layout, front end, back end, database and deployment</li>
</ul>

A hiring pipeline that picks up where the job board stops: it takes candidates from the advert through screening, asynchronous video interviews and team review, to the hire.

{{ video(url="/media/vids/beasypro.mp4", full=true, autoplay=true, loop=true, muted=true, playsinline=true, alt="BeasyPro") }}

## Stack

- React
- Node.js
- PostgreSQL
- Video pipeline

## What made it interesting

- Deliberately not another job board. Companies already have channels. What they lack is everything after the candidate clicks the advert.
- Asynchronous video interviews remove the scheduling round that burns the most time and reaches the fewest useful candidates.
- Team review keeps every assessment against one candidate in one place, so a decision is a comparison rather than a memory.
- Shipped through a CI/CD pipeline rather than by hand, and I contributed to an in-house Jenkins shared library that the wider set of projects now deploys through, so the release path is one reviewed thing instead of a script per repository.

[Visit the live site](https://beasypro.com)
