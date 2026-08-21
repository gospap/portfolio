+++
title = "Giorgos Papanikolaou"
insert_anchor_links = "left"

[extra]
# Only this page has a CRT block, so the typing script loads only here.
scripts = ["crt-type.js"]
+++

{% crt() %}

```
#include <18F4550.h>
#device ADC=10
#fuses HSPLL, PLL5, CPUDIV1, NOWDT, NOLVP, NOMCLR
#use delay(clock=48000000)
#use rs232(baud=9600, xmit=PIN_C6, rcv=PIN_C7)
#include "gateway.h"

/* noise gate: sample, decide, report. the audio never leaves the room. */
void main(void)
{
   int8 over = 0;

   setup_adc_ports(AN0);
   setup_adc(ADC_CLOCK_INTERNAL);
   set_adc_channel(0);

   while (TRUE) {
      delay_us(20);

      if (read_adc() < NOISE_LIMIT)
         over = 0;
      else if (++over >= HOLD_TICKS) {
         uplink(EVT_NOISE, over);
         over = 0;
      }

      delay_ms(250);
   }
}
```

{% end %}

<div class="hero">
<span class="kicker">Software Architect &amp; Product Designer</span>
<h1>Giorgos Papanikolaou</h1>
<img class="portrait no-hover" src="/media/portrait.webp" alt="Giorgos Papanikolaou" width="720" height="960" />

</div>

I am Giorgos Papanikolaou, a 21-year-old IT &amp; Electronics Engineering student based in Thessaloniki, Greece. Since 2020 I have been pulled in by the tech world and by problem-solving work, and that is what led me to the path I walk today. I am a software architect and product designer, learning new technologies whenever I get the chance.

A product in production is as much an infrastructure and security question as a code one. The matter is not only coding a Node backend service and a Vue.js frontend, but also handling the issues that turn up in each project on its own terms. Inspired by [Vassilios Syrakis](https://vsyrakis.dev), I keep adding new technologies to my CV and now I have to learn them.

On the hardware side, as a student of Information Technology &amp; Electronic Systems Engineering, I have practical experience in PCB design, multi-stage transistor amplifiers for signal amplification, and laboratory instrumentation: oscilloscopes and spectrum analysers for wireless communications. My expertise here is still small, but I am always looking forward to starting the next project — one that will **soon** be on the work page.

<figure class="photo">
<img class="no-hover" src="/media/bench.webp" alt="A transistor stage on a breadboard, wired to a bench supply and a function generator, with the output on an oscilloscope" loading="lazy" width="720" height="960" />
<figcaption>Bench work: a transistor stage on the breadboard, driven from the function generator and read on the oscilloscope.</figcaption>
</figure>

## What I do

- **Product design.** Interface and interaction design, from the flow a person walks through to the layout, type and states of the screen it happens on.
- **System architecture.** Service boundaries, data models, authentication and authorisation, and the failure behaviour that decides whether a system is actually usable at three in the morning.
- **Front end.** React, React Native and Vue.js. Real-time interfaces: video, chat, presence, and state that stays honest while several people change it at once.
- **Back end.** Node.js, PostgreSQL, WebRTC. APIs built to be read by the next person as much as by the client calling them.
- **Infrastructure.** Web servers and reverse proxies, rate limiting and attack prevention, firewalls, DNS, TLS and deployment.
- **Embedded.** PIC18F4550 firmware written in C with the CCS compiler, the circuit simulated in Proteus before anything is etched, and the finished board flashed over USB with Microchip's bootloader tool.
- **Hardware.** PCB design, enclosure design to manufacturing detail, analogue signal chains, and bench work with oscilloscopes and spectrum analysers.

## Open source

I am grateful to have been given the chance to work on Kerberos on Linux, to understand how it actually fits together, and to patch a few WSL behaviours for Windows users. Overpass Connect's open source MCP Kerberos server:

<div class="oss">
<div class="oss-head">
<span class="kicker">github.com/overpassconnect</span>
<h3><a href="https://github.com/overpassconnect/mcp-krb-server" rel="noopener noreferrer">mcp-krb-server</a></h3>
<p>Kerberos/SPNEGO single sign-on for MCP servers in FreeIPA environments. An MCP server authenticates the user against the realm they already belong to, so no second set of credentials has to exist for it. Ships with a provisioning framework that stands up a working development environment on Windows (via WSL), Linux and macOS.</p>
</div>
<ul class="oss-facts">
<li><strong>Role</strong>Contributor</li>
<li><strong>Licence</strong>Apache-2.0</li>
<li><strong>Focus</strong>Kerberos · SPNEGO · FreeIPA · MCP</li>
</ul>
<p class="oss-cta"><a class="btn" href="https://github.com/overpassconnect/mcp-krb-server" rel="noopener noreferrer">View on GitHub</a></p>
</div>

## Selected work

I have worked at Overpass Connect since August 2025, on the full cycle: architecture, implementation, deployment and ongoing maintenance.

- [LivelyVend](@/work/livelyvend/index.md) — live shopping platform. React, Node.js, WebRTC.
- [Vibeway](@/work/vibeway/index.md) — social app for going out. React Native.
- [BeasyPro](@/work/beasypro/index.md) — hiring pipeline, advert to offer. React, Node.js, PostgreSQL.
- [Broadcast Monitoring Box](@/work/broadcast-box/index.md) — enclosure and electronics for a broadcast appliance.

[All work &rarr;](@/work/_index.md)

## Education

Fourth year of a five-year degree including an integrated master in Information Technology &amp; Electronic Systems Engineering.

## Get in touch

Email is the fastest route to me.

Everything else is another layer of abstraction

[get in touch](@/contact/index.md).
