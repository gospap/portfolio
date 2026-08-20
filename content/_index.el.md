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
<span class="kicker">Μηχανικός Λογισμικού &amp; Έρευνας και Ανάπτυξης</span>
<h1>Giorgos Papanikolaou</h1>
<p class="lead">Φτιάχνω προϊόντα που βγαίνουν σε παραγωγή: διεπαφές, τις υπηρεσίες πίσω τους, και το υλικό από κάτω.</p>
</div>
</div>

Αναλαμβάνω όλη τη διαδρομή: από τον σχεδιασμό της διεπαφής μέχρι το προϊόν να τρέχει σε παραγωγή και να το χρησιμοποιούν πραγματικοί χρήστες σε όλο τον κόσμο. Διεπαφές web, τις υπηρεσίες πίσω τους, τις βάσεις δεδομένων και τα συστήματα ταυτοποίησης.

Από τον Αύγουστο του 2025 δουλεύω στην Overpass Connect. Έργα: το LivelyVend, πλατφόρμα ζωντανών πωλήσεων για εμπόρους· το BeasyPro, σύστημα προσλήψεων από την αγγελία μέχρι την επιλογή· και εταιρικοί ιστότοποι για πελάτες στην Ελλάδα. Αναλαμβάνω αρχιτεκτονική, υλοποίηση, ανέβασμα και συντήρηση.

Ένα προϊόν σε παραγωγή θέλει και υποδομή και ασφάλεια. Στήνω web servers και reverse proxies, βάζω rate limiting και προστασία από επιθέσεις, και δουλεύω με firewalls και δίκτυα υπολογιστών: διευθύνσεις, δρομολόγηση, DNS και TLS.

Στα ηλεκτρονικά, είμαι φοιτητής Μηχανικών Πληροφορικής & Ηλεκτρονικών Συστημάτων. Έχω πρακτική γνώση σε σχεδίαση PCB, σε ενισχυτές πολλαπλών βαθμίδων με τρανζίστορ για ενίσχυση σήματος, και στη χρήση παλμογράφου και φασματογράφου για ασύρματες επικοινωνίες.

## Σπουδές

Τέταρτο έτος, από τα πέντε, στους Μηχανικούς Πληροφορικής & Ηλεκτρονικών Συστημάτων.

## Ανοιχτός κώδικας

[mcp-krb-server](https://github.com/overpassconnect/mcp-krb-server), συνεισφέρων. Kerberos/SPNEGO single sign-on για MCP servers σε περιβάλλοντα FreeIPA. Framework εγκατάστασης για περιβάλλοντα ανάπτυξης σε Windows (μέσω WSL), Linux και macOS. Licensed Apache-2.0.
