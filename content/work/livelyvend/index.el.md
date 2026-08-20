+++
title = "LivelyVend"
description = "Πλατφόρμα live shopping"
weight = 10

[extra]
status = "live"
banner = "banner.jpg"
+++

<ul class="facts">
<li><strong>Έτος</strong>2026</li>
<li><strong>Κατάσταση</strong>Σε λειτουργία</li>
<li><strong>Ρόλος</strong>Από άκρη σε άκρη: σχεδιασμός, διάταξη, front end, back end, βάση και deployment</li>
</ul>

Πλατφόρμα ζωντανών πωλήσεων: οι έμποροι πραγματοποιούν εκπομπές αγορών, οι θεατές συνομιλούν και αντιδρούν σε πραγματικό χρόνο, και τα προϊόντα εμφανίζονται και αποκρύπτονται μέσα στο βίντεο καθώς ο παρουσιαστής τα παρουσιάζει.

{{ video(url="/media/vids/livelyvend.mp4", full=true, autoplay=true, loop=true, muted=true, playsinline=true, alt="LivelyVend") }}

## Τεχνολογίες

- React
- Node.js
- WebRTC
- Shopify API
- WooCommerce API

## Τι το έκανε ενδιαφέρον

- Το real-time επίπεδο μεταφέρει chat, αντιδράσεις και κατάσταση προϊόντων σε όλους ταυτόχρονα, και παραμένει συνεπές όταν κάποιος μπει στη μέση της εκπομπής.
- Αμφίδρομος συγχρονισμός καταλόγου με Shopify και WooCommerce, ώστε το απόθεμα να είναι σωστό κατά τη διάρκεια της εκπομπής, όχι μετά.
- Απόδοση πωλήσεων που απαντά ποιες πωλήσεις προήλθαν πραγματικά από το stream, όχι απλώς ποιες έγιναν όσο έπαιζε.
- Η παράδοση γίνεται μέσω CI/CD και όχι με το χέρι, και συνεισέφερα σε εσωτερική shared library του Jenkins από την οποία περνούν πλέον τα deployments και των υπόλοιπων έργων, μία ελεγμένη διαδρομή αντί για ένα script ανά repository.

[Επισκεφθείτε τον ιστότοπο](https://livelyvend.com)
