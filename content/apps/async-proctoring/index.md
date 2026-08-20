+++
title = "Async Exam Proctoring"
description = "Proctoring prototype · 5 surfaces"
weight = 10

[extra]
status = "soon"
banner = "banner.png"
+++

<ul class="facts">
<li><strong>Year</strong>2026</li>
<li><strong>Status</strong>Coming soon</li>
<li><strong>Role</strong>Architecture, front end and the vision stack</li>
</ul>

A remote-examination suite whose invigilation runs inside the candidate's own browser rather than on a server: objects, face landmarks and true eye gaze are all computed on-device from one webcam stream, and only the resulting signals ever leave the machine. Five surfaces — writing, listening and speaking for the candidate, a camera wall and a single-candidate console for the supervisor.

{{ video(url="/media/vids/async-proctoring.mp4", full=true, autoplay=true, loop=true, muted=true, playsinline=true, alt="Async Exam Proctoring") }}

## What made it interesting

- Three models share one camera: coco-ssd watches for phones, books and second screens, face-api counts faces and reads expressions, and MediaPipe blendshapes give real eye gaze rather than the head direction most implementations settle for.
- One getUserMedia stream is fanned out to every video element on the page by a single Camera object, so a console with a main feed, three thumbnails and a self-view pill still asks the browser for the camera exactly once.
- An integrity score is derived live from those signals, and every layer degrades on its own terms: models that fail to load drop the page to “AI offline” rather than breaking it, and a blocked camera reports precisely why instead of showing a dead frame.
