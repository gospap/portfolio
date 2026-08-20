/* Types the CRT block on the home page out the way a terminal would.

   The full listing is already in the HTML, so this is decoration on top of
   something that works without it: with JavaScript off, or with reduced motion
   asked for, the code is simply sitting there, scrollable, and readable.

   Driven by a timer against the clock rather than by requestAnimationFrame,
   and deliberately so. rAF stops entirely in a background tab, which would
   leave the listing frozen half-written for anyone who opens the page in one
   and comes back to it. A timer still fires there, throttled, and because the
   progress is computed from elapsed time rather than from a per-tick counter,
   a throttled tick simply catches up instead of falling behind.

   Loaded only on the home page, via section.extra.scripts in content/_index.md,
   and served from this site's own origin because the CSP is script-src 'self'. */
(function () {
	"use strict";

	var code = document.querySelector(".crt pre code");
	if (!code) {
		return;
	}

	var pre = code.parentNode;
	var full = code.textContent;

	if (
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		return;
	}

	var DURATION_MS = 3500;
	var TICK_MS = 16;
	var started = false;

	function start() {
		if (started) {
			return;
		}
		started = true;

		var begun = Date.now();
		code.textContent = "";

		var timer = setInterval(function () {
			var progress = Math.min(1, (Date.now() - begun) / DURATION_MS);
			code.textContent = full.slice(0, Math.round(progress * full.length));

			/* Keep the newest line in view; the panel is shorter than the listing. */
			pre.scrollTop = pre.scrollHeight;

			if (progress >= 1) {
				clearInterval(timer);
			}
		}, TICK_MS);
	}

	function inViewport(el) {
		var box = el.getBoundingClientRect();
		return box.top < window.innerHeight && box.bottom > 0;
	}

	/* Start when it is on screen, so it is not already over by the time anyone
	   looks at it.

	   The geometry is checked directly first, rather than leaving the decision
	   to IntersectionObserver, because IO does not deliver a single callback
	   while the document is hidden. Opening the site in a background tab would
	   otherwise mean the observer stays silent, and this is the one block on
	   the page whose whole point is that it animates. The observer is still
	   used for the case it is good at: the block being scrolled to later. */
	if (inViewport(pre)) {
		start();
	} else if ("IntersectionObserver" in window) {
		var observer = new IntersectionObserver(
			function (entries) {
				for (var i = 0; i < entries.length; i++) {
					if (entries[i].isIntersecting) {
						observer.disconnect();
						start();
						return;
					}
				}
			},
			{ threshold: 0.25 }
		);
		observer.observe(pre);
	} else {
		start();
	}
})();
