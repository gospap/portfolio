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
<span class="kicker">Αρχιτέκτονας Λογισμικού &amp; Σχεδιαστής Προϊόντος</span>
<h1>Giorgos Papanikolaou</h1>
<img class="portrait" src="/media/portrait.webp" alt="Giorgos Papanikolaou" width="422" height="486" />
</div>

Είμαι ο Γιώργος Παπανικολάου, 21 ετών, φοιτητής Μηχανικών Πληροφορικής &amp; Ηλεκτρονικών Συστημάτων στη Θεσσαλονίκη. Από το 2020 με τράβηξε ο κόσμος της τεχνολογίας και η δουλειά της επίλυσης προβλημάτων, και αυτό με έφερε στον δρόμο που ακολουθώ σήμερα. Είμαι αρχιτέκτονας λογισμικού και σχεδιαστής προϊόντος, και μαθαίνω καινούριες τεχνολογίες όποτε βρίσκω την ευκαιρία.

Ένα προϊόν σε παραγωγή θέλει και υποδομή και ασφάλεια, όχι μόνο κώδικα. Το ζήτημα δεν είναι απλώς να γράψεις μια υπηρεσία Node στο backend και ένα Vue.js frontend, αλλά να διαχειριστείς και τα θέματα που προκύπτουν σε κάθε έργο, με τους δικούς του όρους. Με έμπνευση από τον [Vassilios Syrakis](https://vsyrakis.dev), προσθέτω συνέχεια νέες τεχνολογίες στο βιογραφικό μου — και τώρα πρέπει να τις μάθω κιόλας.

Στα ηλεκτρονικά, ως φοιτητής Μηχανικών Πληροφορικής &amp; Ηλεκτρονικών Συστημάτων, έχω πρακτική γνώση σε σχεδίαση PCB, σε ενισχυτές πολλαπλών βαθμίδων με τρανζίστορ για ενίσχυση σήματος, και στη χρήση παλμογράφου και φασματογράφου για ασύρματες επικοινωνίες. Η εμπειρία μου εδώ είναι ακόμη μικρή, αλλά περιμένω πάντα με ενδιαφέρον το επόμενο έργο — ένα που **σύντομα** θα βρίσκεται στη σελίδα των έργων.

## Τι κάνω

- **Σχεδιασμός προϊόντος.** Σχεδιασμός διεπαφής και αλληλεπίδρασης: από τη ροή που ακολουθεί ο χρήστης μέχρι τη διάταξη, την τυπογραφία και τις καταστάσεις της οθόνης όπου γίνεται.
- **Αρχιτεκτονική συστημάτων.** Όρια υπηρεσιών, μοντέλα δεδομένων, ταυτοποίηση και εξουσιοδότηση, και η συμπεριφορά σε σφάλμα που κρίνει αν ένα σύστημα είναι όντως χρησιμοποιήσιμο στις τρεις τα ξημερώματα.
- **Front end.** React, React Native και Vue.js. Διεπαφές πραγματικού χρόνου: βίντεο, συνομιλία, παρουσία, και κατάσταση που παραμένει σωστή ενώ την αλλάζουν πολλοί ταυτόχρονα.
- **Back end.** Node.js, PostgreSQL, WebRTC. API φτιαγμένα για να τα διαβάζει ο επόμενος, όχι μόνο για να τα καλεί ο client.
- **Υποδομή.** Web servers και reverse proxies, rate limiting και προστασία από επιθέσεις, firewalls, DNS, TLS και deployment.
- **Ενσωματωμένα συστήματα.** Firmware για PIC18F4550 σε C με τον CCS compiler, το κύκλωμα σε προσομοίωση στο Proteus πριν κατασκευαστεί, και η τελική πλακέτα να προγραμματίζεται μέσω USB με το bootloader εργαλείο της Microchip.
- **Υλικό.** Σχεδίαση PCB, σχεδίαση περιβλήματος σε λεπτομέρεια κατασκευής, αναλογικές αλυσίδες σήματος, και δουλειά στον πάγκο με παλμογράφο και φασματογράφο.

## Ανοιχτός κώδικας

Είμαι ευγνώμων που μου δόθηκε η ευκαιρία να δουλέψω με το Kerberos σε Linux, να καταλάβω πώς πραγματικά δένει, και να διορθώσω κάποιες συμπεριφορές του WSL για χρήστες Windows. Ο MCP Kerberos server της Overpass Connect, σε ανοιχτό κώδικα:

<div class="oss">
<div class="oss-head">
<span class="kicker">github.com/overpassconnect</span>
<h3><a href="https://github.com/overpassconnect/mcp-krb-server" rel="noopener noreferrer">mcp-krb-server</a></h3>
<p>Kerberos/SPNEGO single sign-on για MCP servers σε περιβάλλοντα FreeIPA. Ο MCP server ταυτοποιεί τον χρήστη απέναντι στο realm στο οποίο ήδη ανήκει, οπότε δεν χρειάζεται να υπάρχει δεύτερο σύνολο διαπιστευτηρίων. Περιλαμβάνει framework εγκατάστασης που στήνει περιβάλλον ανάπτυξης σε Windows (μέσω WSL), Linux και macOS.</p>
</div>
<ul class="oss-facts">
<li><strong>Ρόλος</strong>Συνεισφέρων</li>
<li><strong>Άδεια</strong>Apache-2.0</li>
<li><strong>Αντικείμενο</strong>Kerberos · SPNEGO · FreeIPA · MCP</li>
</ul>
<p class="oss-cta"><a class="btn" href="https://github.com/overpassconnect/mcp-krb-server" rel="noopener noreferrer">Δείτε το στο GitHub</a></p>
</div>

## Επιλεγμένα έργα

Από τον Αύγουστο του 2025 δουλεύω στην Overpass Connect, σε όλον τον κύκλο: αρχιτεκτονική, υλοποίηση, ανέβασμα και συντήρηση.

- [LivelyVend](@/work/livelyvend/index.el.md) — πλατφόρμα live shopping. React, Node.js, WebRTC.
- [Vibeway](@/work/vibeway/index.el.md) — κοινωνική εφαρμογή για έξοδο. React Native.
- [BeasyPro](@/work/beasypro/index.el.md) — προσλήψεις, από την αγγελία μέχρι την πρόταση. React, Node.js, PostgreSQL.
- [Broadcast Monitoring Box](@/work/broadcast-box/index.el.md) — περίβλημα και ηλεκτρονικά για συσκευή μετάδοσης.

[Όλα τα έργα &rarr;](@/work/_index.el.md)

## Σπουδές

Τέταρτο έτος, από τα πέντε, στους Μηχανικούς Πληροφορικής &amp; Ηλεκτρονικών Συστημάτων — πρόγραμμα με ενσωματωμένο μεταπτυχιακό.

## Επικοινωνία

Το email είναι ο γρηγορότερος δρόμος.

Όλα τα άλλα είναι άλλο ένα επίπεδο αφαίρεσης

[επικοινωνήστε μαζί μου](@/contact/index.el.md).
