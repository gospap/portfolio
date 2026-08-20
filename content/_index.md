+++
title = "Giorgos Papanikolaou"
insert_anchor_links = "left"
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
<img class="portrait" src="/media/portrait.webp" alt="Giorgos Papanikolaou" width="422" height="486" />
<div class="hero-text">
<span class="kicker">Software &amp; R&amp;D Engineer</span>
<h1>Giorgos Papanikolaou</h1>
<p class="lead">I build products that ship: interfaces, the services behind them, and the hardware underneath.</p>
</div>
</div>

I take on the whole path: from designing the interface through to the product running in production, used by real people around the world. Web interfaces, the services that support them, and the databases and authentication systems they depend on.

I have worked at Overpass Connect since August 2025. Projects include LivelyVend, a live-selling platform for merchants; BeasyPro, a recruitment system running from job advert through to hire; and corporate sites for clients in Greece. I take on the full cycle: architecture, implementation, deployment and ongoing maintenance.

A product in production is as much an infrastructure and security question as a code one. I configure web servers and reverse proxies, apply rate limiting and attack prevention, and work across firewalls and computer networks: addressing, routing, DNS and TLS termination.

On the hardware side I am a student of Information Technology & Electronic Systems Engineering, with practical experience in PCB design, multi-stage transistor amplifiers for signal amplification, and laboratory instrumentation: oscilloscopes and spectrum analysers for wireless communications.

## Education

Fourth year of a five-year degree in Information Technology & Electronic Systems Engineering.

## Open source

[mcp-krb-server](https://github.com/overpassconnect/mcp-krb-server), contributor. Kerberos/SPNEGO single sign-on for MCP servers in FreeIPA environments. Provisioning framework for Windows (via WSL), Linux and macOS development environments. Licensed Apache-2.0.
