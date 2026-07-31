/* ===========================================================================
   projects.js — the single source of truth for every piece of work.

   /work, /apps and /hardware are the same 3D component fed different slices of
   this array, and the hero carousel indexes into it too. Add a project here
   and it appears in all three places.

   SHAPE (there is no compiler to enforce it, so it is written down, and
   checkProjects() below warns in dev when a record drifts):

     slug      string    url fragment; unique
     kind      'web' | 'app' | 'hardware'
     status    'live' | 'wip' | 'soon' | 'archived'
     year      string    displayed as-is
     url       string    live site, '' if none
     tint      string    #rrggbb — the glass tint of this project's helix card.
                         Keep every tint inside the green→petrol→brass range or
                         the page stops reading as one palette.
     cover     string    path under /public, or '' to fall back to a
                         generated plate
     images    string[]  detail-panel gallery; cover is prepended automatically
     stack     string[]  optional — short tech labels. Only the three projects
                         whose build is worth itemising carry one; everywhere
                         else the detail panel drops the section rather than
                         showing an empty heading.
     en/el     { title, kicker, summary, role, highlights: string[] }

   `title` is intentionally NOT localised for product names — LivelyVend is
   LivelyVend in both languages — but the field exists per locale so that
   descriptive titles (the CAD set, the coming-soon hub) can differ.
   =========================================================================== */

export const PROJECTS = [
  /* ————————————————————————— WEB ————————————————————————— */
  {
    slug: "async-proctoring",
    kind: "app",
    status: "soon",
    year: "2026",
    url: "",
    tint: "#1e2c38",
    /* No showcase card yet — the generated plate stands in on /work. Drop
       public/media/cards/async-proctoring.jpg in and set this to its path. */
    cover: "",
    /* The landing-page wall has its own capture: the proctoring console. */
    wall: ["/media/wall/proctoring.png"],
    images: [],
    en: {
      title: "Async Exam Proctoring",
      kicker: "Proctoring prototype · 5 surfaces",
      summary:
        "A remote-examination suite whose invigilation runs inside the candidate's own browser rather than on a server: objects, face landmarks and true eye gaze are all computed on-device from one webcam stream, and only the resulting signals ever leave the machine. Five surfaces — writing, listening and speaking for the candidate, a camera wall and a single-candidate console for the supervisor.",
      role: "Architecture, front end and the vision stack",
      highlights: [
        "Three models share one camera: coco-ssd watches for phones, books and second screens, face-api counts faces and reads expressions, and MediaPipe blendshapes give real eye gaze rather than the head direction most implementations settle for.",
        "One getUserMedia stream is fanned out to every video element on the page by a single Camera object, so a console with a main feed, three thumbnails and a self-view pill still asks the browser for the camera exactly once.",
        "An integrity score is derived live from those signals, and every layer degrades on its own terms: models that fail to load drop the page to “AI offline” rather than breaking it, and a blocked camera reports precisely why instead of showing a dead frame.",
      ],
    },
    el: {
      title: "Async Exam Proctoring",
      kicker: "Πρωτότυπο επιτήρησης · 5 οθόνες",
      summary:
        "Σουίτα εξ αποστάσεως εξετάσεων όπου η επιτήρηση τρέχει μέσα στον browser του εξεταζόμενου και όχι σε κάποιον server: αντικείμενα, σημεία προσώπου και πραγματικό βλέμμα υπολογίζονται τοπικά από μία ροή κάμερας, και το μηχάνημα αφήνουν μόνο τα σήματα που προκύπτουν. Πέντε οθόνες — γραπτή, ακουστική και προφορική εξέταση για τον εξεταζόμενο, τοίχος καμερών και κονσόλα ενός εξεταζόμενου για τον επιτηρητή.",
      role: "Αρχιτεκτονική, front end και το vision stack",
      highlights: [
        "Τρία μοντέλα μοιράζονται μία κάμερα: το coco-ssd εντοπίζει κινητά, βιβλία και δεύτερες οθόνες, το face-api μετράει πρόσωπα και διαβάζει εκφράσεις, και τα blendshapes του MediaPipe δίνουν πραγματικό βλέμμα αντί για την κατεύθυνση του κεφαλιού που αρκεί στις περισσότερες υλοποιήσεις.",
        "Μία ροή getUserMedia διανέμεται σε κάθε στοιχείο video της σελίδας από ένα μόνο αντικείμενο Camera, ώστε μια κονσόλα με κύρια εικόνα, τρεις μικρογραφίες και αυτοπροβολή να ζητά την κάμερα από τον browser ακριβώς μία φορά.",
        "Ο δείκτης ακεραιότητας προκύπτει ζωντανά από αυτά τα σήματα, και κάθε επίπεδο υποβαθμίζεται με τους δικούς του όρους: μοντέλα που δεν φορτώνουν ρίχνουν τη σελίδα σε «AI offline» αντί να τη σπάσουν, και μια μπλοκαρισμένη κάμερα αναφέρει ακριβώς τον λόγο αντί να δείχνει νεκρή εικόνα.",
      ],
    },
  },
  {
    slug: "overpass",
    kind: "web",
    status: "live",
    year: "2026",
    url: "https://overpassconnect.com",
    tint: "#232838",
    cover: "/media/cards/overpass.jpg",
    /* The landing-page wall only. Two photos stack inside the one card, so
       Overpass reads as the biggest thing on the wall without needing a
       "featured" flag that nothing else would ever use. */
    wall: ["/media/wall/overpass1.png", "/media/wall/overpass2.png"],
    images: [],
    stack: ["Next.js", "React Three Fiber", "GLSL", "Lenis"],
    en: {
      title: "Overpass Connect",
      kicker: "Corporate site · R3F",
      summary:
        "A corporate site whose hero is a voxel cliff built from the client's own CAD mesh, and whose work page flies a camera down a helix of project cards. Every section is a WebGL surface rather than a rectangle with a photo in it.",
      role: "Design, WebGL and front-end",
      highlights: [
        "The cliff is one instanced mesh with per-instance colour and matrices rewritten each frame — the first pass used ~350 separate meshes and stuttered.",
        "On scroll the world splits into two rigid slabs along a jagged interlocked seam, tips, slides and sinks, revealing the next section standing behind it.",
        "The work page is a scroll-driven helix: click a card and the camera dollies through the glass into a full-screen write-up.",
      ],
    },
    el: {
      title: "Overpass Connect",
      kicker: "Εταιρικός ιστότοπος · R3F",
      summary:
        "Εταιρικός ιστότοπος με hero έναν βράχο από voxels φτιαγμένο από το ίδιο το CAD mesh του πελάτη, και σελίδα έργων όπου η κάμερα πετά κατά μήκος μιας έλικας από κάρτες. Κάθε ενότητα είναι επιφάνεια WebGL, όχι ορθογώνιο με μια φωτογραφία μέσα.",
      role: "Σχεδιασμός, WebGL και front-end",
      highlights: [
        "Ο βράχος είναι ένα instanced mesh με χρώματα και μήτρες ανά instance που ξαναγράφονται κάθε καρέ — η πρώτη εκδοχή με ~350 ξεχωριστά meshes κόλλαγε.",
        "Στην κύλιση ο κόσμος σχίζεται σε δύο συμπαγείς πλάκες κατά μήκος μιας οδοντωτής ραφής, γέρνει, γλιστρά και βυθίζεται, αποκαλύπτοντας την επόμενη ενότητα από πίσω.",
        "Η σελίδα έργων είναι έλικα οδηγούμενη από την κύλιση: κλικ σε μια κάρτα και η κάμερα περνά μέσα από το γυαλί σε πλήρη παρουσίαση.",
      ],
    },
  },

  /* ————————————————————————— APPS ————————————————————————— */
  {
    slug: "livelyvend",
    kind: "app",
    status: "live",
    year: "2026",
    url: "https://livelyvend.com",
    tint: "#34294a",
    cover: "/media/cards/livelyvend.jpg",
    images: [],
    stack: ["React", "Node.js", "WebRTC", "Shopify API", "WooCommerce API"],
    en: {
      title: "LivelyVend",
      kicker: "Live shopping platform",
      summary:
        "A live-selling platform: merchants run shopping broadcasts, viewers chat and react in real time, and products surface and disappear inside the video as the host talks about them.",
      role: "Product engineering",
      highlights: [
        "Real-time layer carries chat, reactions and product state to every viewer at once, and stays consistent when someone joins mid-broadcast.",
        "Two-way catalogue sync with Shopify and WooCommerce, so stock is right during a broadcast rather than right afterwards.",
        "Attribution that can actually answer which sales came from the stream, not just which happened during it.",
      ],
    },
    el: {
      title: "LivelyVend",
      kicker: "Πλατφόρμα live shopping",
      summary:
        "Πλατφόρμα ζωντανών πωλήσεων: οι έμποροι πραγματοποιούν εκπομπές αγορών, οι θεατές συνομιλούν και αντιδρούν σε πραγματικό χρόνο, και τα προϊόντα εμφανίζονται και αποκρύπτονται μέσα στο βίντεο καθώς ο παρουσιαστής τα παρουσιάζει.",
      role: "Product engineering",
      highlights: [
        "Το real-time επίπεδο μεταφέρει chat, αντιδράσεις και κατάσταση προϊόντων σε όλους ταυτόχρονα, και παραμένει συνεπές όταν κάποιος μπει στη μέση της εκπομπής.",
        "Αμφίδρομος συγχρονισμός καταλόγου με Shopify και WooCommerce, ώστε το απόθεμα να είναι σωστό κατά τη διάρκεια της εκπομπής, όχι μετά.",
        "Απόδοση πωλήσεων που απαντά ποιες πωλήσεις προήλθαν πραγματικά από το stream, όχι απλώς ποιες έγιναν όσο έπαιζε.",
      ],
    },
  },
  {
    slug: "beasypro",
    kind: "app",
    status: "live",
    year: "2026",
    url: "https://beasypro.com",
    tint: "#1f2a3a",
    cover: "/media/cards/beasypro.jpg",
    images: [],
    stack: ["React", "Node.js", "PostgreSQL", "Video pipeline"],
    en: {
      title: "BeasyPro",
      kicker: "Hiring pipeline",
      summary:
        "A hiring pipeline that picks up where the job board stops: it takes candidates from the advert through screening, asynchronous video interviews and team review, to the hire.",
      role: "Product engineering",
      highlights: [
        "Deliberately not another job board — companies already have channels. What they lack is everything after the candidate clicks the advert.",
        "Asynchronous video interviews remove the scheduling round that burns the most time and reaches the fewest useful candidates.",
        "Team review keeps every assessment against one candidate in one place, so a decision is a comparison rather than a memory.",
      ],
    },
    el: {
      title: "BeasyPro",
      kicker: "Διαχείριση προσλήψεων",
      summary:
        "Πλατφόρμα προσλήψεων που ξεκινά εκεί που σταματά το job board: μεταφέρει τους υποψηφίους από την αγγελία στην αξιολόγηση, σε ασύγχρονες βιντεοσυνεντεύξεις και σε ομαδική κρίση, μέχρι την πρόσληψη.",
      role: "Product engineering",
      highlights: [
        "Σκόπιμα δεν είναι άλλο ένα job board — οι εταιρείες έχουν ήδη κανάλια. Τους λείπει ό,τι έρχεται αφού ο υποψήφιος κάνει κλικ στην αγγελία.",
        "Οι ασύγχρονες βιντεοσυνεντεύξεις εξαλείφουν τον γύρο προγραμματισμού που καταναλώνει τον περισσότερο χρόνο με το μικρότερο όφελος.",
        "Η ομαδική αξιολόγηση συγκεντρώνει κάθε κρίση για έναν υποψήφιο σε ένα σημείο, ώστε η απόφαση να είναι σύγκριση και όχι ανάμνηση.",
      ],
    },
  },
  {
    slug: "vibely",
    kind: "app",
    status: "soon",
    year: "2026",
    url: "",
    tint: "#3a2d4d",
    cover: "/media/cards/vibely.jpg",
    images: [],
    en: {
      title: "Vibely",
      kicker: "Social app · React Native",
      summary:
        "A mobile social app built around going out: a map of venues, an events feed running from tonight forward, a friends graph with messaging, and a profile that ties the three together.",
      role: "Design and mobile engineering",
      highlights: [
        "Map-first rather than feed-first — venues are pins you open for photos, description, ratings and directions.",
        "Events run from now forward and carry the detail that decides the night: line-up, genre, hours, and the venue's own rating.",
        "Friend requests, approvals and direct messaging with photo sharing, on a graph that only connects people once both sides agree.",
      ],
    },
    el: {
      title: "Vibely",
      kicker: "Κοινωνική εφαρμογή · React Native",
      summary:
        "Εφαρμογή για κινητά γύρω από την έξοδο: χάρτης με μαγαζιά, ροή εκδηλώσεων από απόψε και μετά, γράφος φίλων με μηνύματα, και προφίλ που δένει τα τρία μεταξύ τους.",
      role: "Σχεδιασμός και ανάπτυξη mobile",
      highlights: [
        "Πρώτα ο χάρτης, όχι η ροή — τα μαγαζιά είναι σημεία που ανοίγεις για φωτογραφίες, περιγραφή, βαθμολογίες και πλοήγηση.",
        "Οι εκδηλώσεις ξεκινούν από τώρα και μετά και φέρουν ό,τι κρίνει τη βραδιά: line-up, είδος μουσικής, ώρες και βαθμολογία του χώρου.",
        "Αιτήματα φιλίας, εγκρίσεις και απευθείας μηνύματα με φωτογραφίες, σε γράφο που συνδέει μόνο όταν συμφωνήσουν και οι δύο πλευρές.",
      ],
    },
  },
  {
    slug: "property-hub",
    kind: "app",
    status: "soon",
    year: "2027",
    url: "",
    tint: "#4a3a58",
    cover: "",
    images: [],
    en: {
      title: "Property Hub",
      kicker: "Coming soon · electronics for short-term rentals",
      summary:
        "One gateway for a short-term rental instead of four disconnected gadgets: entry, noise, climate and energy on a single device with a single dashboard, aimed at hosts running more than one property.",
      role: "Hardware and firmware, in progress",
      highlights: [
        "Keyless entry with per-booking codes that expire on checkout, driven by the reservation calendar rather than by hand.",
        "Noise and occupancy sensing that flags a party forming without ever recording audio — a level readout, not a microphone feed.",
        "Climate, energy and leak telemetry between stays, so the property reports its own problems before the next guest finds them.",
      ],
    },
    el: {
      title: "Property Hub",
      kicker: "Σύντομα · ηλεκτρονικά για βραχυχρόνιες μισθώσεις",
      summary:
        "Ένα gateway για το ακίνητο αντί για τέσσερις ασύνδετες συσκευές: είσοδος, θόρυβος, κλίμα και ενέργεια σε μία συσκευή με ένα dashboard, για ιδιοκτήτες με περισσότερα από ένα ακίνητα.",
      role: "Hardware και firmware, σε εξέλιξη",
      highlights: [
        "Είσοδος χωρίς κλειδί με κωδικούς ανά κράτηση που λήγουν στο checkout, οδηγούμενοι από το ημερολόγιο κρατήσεων και όχι χειροκίνητα.",
        "Ανίχνευση θορύβου και πληρότητας που εντοπίζει πάρτι υπό διαμόρφωση χωρίς ποτέ να ηχογραφεί — μέτρηση στάθμης, όχι ροή μικροφώνου.",
        "Τηλεμετρία κλίματος, ενέργειας και διαρροών ανάμεσα στις διαμονές, ώστε το ακίνητο να αναφέρει μόνο του τα προβλήματα πριν τα βρει ο επόμενος επισκέπτης.",
      ],
    },
  },

  /* ——————————————————— HARDWARE & CAD ——————————————————— */
  {
    slug: "broadcast-box",
    kind: "hardware",
    status: "wip",
    year: "2026",
    url: "",
    tint: "#262b33",
    cover: "/media/cards/broadcast-box.png",
    images: [],
    en: {
      title: "Broadcast Monitoring Box",
      kicker: "Hardware product · 3D presentation",
      summary:
        "A monitoring appliance for broadcast chains, presented the way hardware deserves: the unit sits in a realistic studio and the camera arcs around it on an orbit, rather than sitting flat in a product photo.",
      role: "Product page, 3D scene and device concept",
      highlights: [
        "The box is static and the camera moves — an arc orbit around a fixed object reads as inspection, where a spinning object reads as a turntable.",
        "Studio lighting and materials tuned for a matte instrument enclosure, which is far less forgiving than the glossy renders most product pages use.",
        "Every asset in the scene was licence-audited for commercial use before it shipped.",
      ],
    },
    el: {
      title: "Broadcast Monitoring Box",
      kicker: "Προϊόν hardware · τρισδιάστατη παρουσίαση",
      summary:
        "Συσκευή παρακολούθησης για αλυσίδες εκπομπής, παρουσιασμένη όπως αξίζει σε hardware: η μονάδα στέκεται σε ρεαλιστικό στούντιο και η κάμερα διαγράφει τόξο γύρω της, αντί για μια επίπεδη φωτογραφία προϊόντος.",
      role: "Σελίδα προϊόντος, τρισδιάστατη σκηνή και concept συσκευής",
      highlights: [
        "Το κουτί μένει ακίνητο και κινείται η κάμερα — το τόξο γύρω από σταθερό αντικείμενο διαβάζεται ως επιθεώρηση, ενώ το περιστρεφόμενο αντικείμενο ως βιτρίνα.",
        "Φωτισμός και υλικά στούντιο ρυθμισμένα για ματ μεταλλικό περίβλημα, που συγχωρεί πολύ λιγότερα από τα γυαλιστερά renders των περισσότερων σελίδων προϊόντος.",
        "Κάθε asset της σκηνής ελέγχθηκε ως προς την άδεια εμπορικής χρήσης πριν χρησιμοποιηθεί.",
      ],
    },
  },
  {
    slug: "space-canvas",
    kind: "hardware",
    status: "archived",
    year: "2026",
    url: "",
    tint: "#2c3040",
    cover: "/media/cards/space-canvas.jpg",
    images: [],
    en: {
      title: "Space Canvas Designer",
      kicker: "CAD module · metre-accurate",
      summary:
        "A free-placement floor-plan editor for event spaces. Geometry is stored in metres, not pixels, so a plan drawn on a laptop is still dimensionally true when it is used to lay out a real hall.",
      role: "Architecture and implementation",
      highlights: [
        "Calibration tool: click two points of known real distance, type the metres, and the editor derives its own pixels-per-metre scale.",
        "Stage zoom and pan are a purely visual transform that never mutates stored coordinates — the plan cannot drift by being looked at.",
        "Stands, doors, arrows and fixtures all share one move/resize/rotate system, including L- and U-shaped stands.",
      ],
    },
    el: {
      title: "Space Canvas Designer",
      kicker: "Μονάδα CAD · ακρίβεια μέτρου",
      summary:
        "Επεξεργαστής κατόψεων ελεύθερης τοποθέτησης για εκθεσιακούς χώρους. Η γεωμετρία αποθηκεύεται σε μέτρα και όχι σε pixels, ώστε μια κάτοψη που σχεδιάστηκε σε laptop να παραμένει διαστασιολογικά σωστή όταν στήνεται πραγματική αίθουσα.",
      role: "Αρχιτεκτονική και υλοποίηση",
      highlights: [
        "Εργαλείο βαθμονόμησης: κλικ σε δύο σημεία γνωστής απόστασης, πληκτρολόγηση των μέτρων, και ο επεξεργαστής παράγει μόνος του την κλίμακα pixel ανά μέτρο.",
        "Το zoom και το pan είναι καθαρά οπτικός μετασχηματισμός που δεν αλλάζει ποτέ τις αποθηκευμένες συντεταγμένες — η κάτοψη δεν μετατοπίζεται επειδή την κοίταξες.",
        "Περίπτερα, πόρτες, βέλη και σταθερά στοιχεία μοιράζονται ένα σύστημα μετακίνησης, αλλαγής μεγέθους και περιστροφής, μαζί με περίπτερα σχήματος Γ και Π.",
      ],
    },
  },
  {
    slug: "mechanical-cad",
    kind: "hardware",
    status: "wip",
    year: "2026",
    url: "",
    tint: "#30343f",
    /* The enclosure renders. Assembled reads better as the card — an exploded
       view at card size is a grey smear — so the exploded one leads the detail
       gallery instead, where it has the room to be read. */
    cover: "/media/cards/cad1.png",
    images: ["/media/cards/cad2.png"],
    en: {
      title: "Mechanical CAD",
      kicker: "Enclosures & parts",
      summary:
        "Parametric enclosure and part design in Autodesk Inventor, exported to meshes that survive the trip into a browser — the Overpass hero cliff is built from one of these models rather than from a stand-in primitive.",
      role: "Mechanical design",
      highlights: [
        "Designed for manufacture first and rendering second, which is the opposite order from most models that end up on the web.",
        "Export path solved end to end: Inventor to a mesh a WebGL pipeline can actually load, after DWFX and DWG both proved unusable.",
      ],
    },
    el: {
      title: "Μηχανολογικό CAD",
      kicker: "Περιβλήματα & εξαρτήματα",
      summary:
        "Παραμετρικός σχεδιασμός περιβλημάτων και εξαρτημάτων σε Autodesk Inventor, με εξαγωγή σε meshes που αντέχουν το ταξίδι μέχρι τον browser — ο βράχος του Overpass είναι φτιαγμένος από ένα τέτοιο μοντέλο και όχι από πρόχειρο primitive.",
      role: "Μηχανολογικός σχεδιασμός",
      highlights: [
        "Σχεδιασμένα πρώτα για κατασκευή και δεύτερα για rendering, δηλαδή με την αντίστροφη σειρά από τα περισσότερα μοντέλα που καταλήγουν στο web.",
        "Λυμένη διαδρομή εξαγωγής από άκρη σε άκρη: από το Inventor σε mesh που φορτώνει πραγματικά ένα WebGL pipeline, αφού DWFX και DWG αποδείχθηκαν άχρηστα.",
      ],
    },
  },
];

/** Which route shows a given kind. The three pages are one component. */
export const ROUTE_FOR = {
  web: "/work",
  app: "/apps",
  hardware: "/hardware",
};

/** Ordered, so a page's cards always appear in the order written above. */
export const byKind = (kind) => PROJECTS.filter((p) => p.kind === kind);

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) ?? null;

/** The locale block plus the shared fields, flattened for rendering. */
export function localise(project, locale) {
  const t = project[locale] ?? project.en;
  return { ...project, ...t };
}

/* Dev-only shape check. Without TypeScript a typo in a locale key renders an
   empty card in production and nothing tells you; this at least shouts in the
   console the first time the module is imported during development. */
const KINDS = ["web", "app", "hardware"];
const STATUSES = ["live", "wip", "soon", "archived"];

export function checkProjects() {
  if (process.env.NODE_ENV === "production") return;
  const seen = new Set();
  for (const p of PROJECTS) {
    const where = `projects.js[${p.slug ?? "?"}]`;
    if (!p.slug) console.warn(`${where}: missing slug`);
    if (seen.has(p.slug)) console.warn(`${where}: duplicate slug`);
    seen.add(p.slug);
    if (!KINDS.includes(p.kind))
      console.warn(`${where}: kind must be one of ${KINDS}`);
    if (!STATUSES.includes(p.status))
      console.warn(`${where}: status must be one of ${STATUSES}`);
    if (!/^#[0-9a-f]{6}$/i.test(p.tint ?? ""))
      console.warn(`${where}: tint must be #rrggbb`);
    for (const loc of ["en", "el"]) {
      const b = p[loc];
      if (!b) {
        console.warn(`${where}: missing "${loc}" block`);
        continue;
      }
      for (const key of ["title", "kicker", "summary", "role", "highlights"]) {
        if (!b[key]) console.warn(`${where}.${loc}: missing "${key}"`);
      }
    }
  }
}

checkProjects();
