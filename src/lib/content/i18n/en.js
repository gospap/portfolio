export const en = {
  code: "en",
  htmlLang: "en",
  label: "English",
  short: "EN",

  nav: {
    home: "Home",
    work: "Web Design",
    apps: "Apps",
    hardware: "Electronics",
    about: "About",
    contact: "Contact",
    menu: "Menu",
    close: "Close",
  },

  hero: {
    role: "Software & R&D Engineer",
    tagline: "I build products that ship — interfaces, services, and the hardware underneath.",
    scroll: "Scroll to rotate",
    open: "Open",
    hint: "Drag or scroll · click a card to open it",
  },

  home: {
    introKicker: "What I do",
    introTitle: "Three disciplines, one engineer.",
    introBody:
      "Most portfolios separate design from engineering. Mine does not, because the products I ship do not: the same person draws the interface, writes the service behind it, and increasingly designs the board it runs on.",
    lanes: {
      work: {
        title: "Web Design",
        body: "Sites built as WebGL experiences rather than pages with pictures on them — instanced geometry, custom shaders, scroll-driven camera work.",
        cta: "See the sites",
      },
      apps: {
        title: "Apps",
        body: "Live products with real users behind them: a live-selling platform, a hiring pipeline, and a mobile social app in development.",
        cta: "See the apps",
      },
      hardware: {
        title: "Electronics",
        body: "Where the engineering degree earns its keep — devices, enclosures and CAD, plus a property hub for short-term rentals on the way.",
        cta: "See the hardware",
      },
    },
    statementKicker: "Position",
    statementQuote:
      "A product is one thing. The interface, the service behind it and the board it runs on are not three jobs — they are three views of the same problem, and the interesting parts live exactly where they meet.",
    statementNote:
      "Which is why this site is not a gallery of screenshots. Every project below is here because something in it was hard.",

    featuredKicker: "Selected work",
    featuredTitle: "Five things worth showing.",

    /* Open source, directly under the work. NOT a projects.js record: that
       shape carries status, year, tint, cover and a live-site CTA, all of
       which describe client work, and this is neither client work nor a
       product. Deliberately short — it sits on the landing page to be seen,
       and the case for it is the one paragraph, not a dossier. */
    openSourceKicker: "Open source",
    openSourceTitle: "Built in the open.",
    openSourceCta: "View on GitHub",
    openSource: [
      {
        name: "mcp-krb-server",
        org: "overpassconnect",
        role: "Contributor",
        licence: "Apache-2.0",
        /* The repository's own description, verbatim. It says what the thing
           is in two lines; anything longer here turns a landing-page card
           into documentation, and the documentation is one click away. */
        summary:
          "Kerberos/SPNEGO single sign-on for MCP servers in FreeIPA environments. Provisioning framework for Windows (via WSL), Linux and macOS development environments.",
        url: "https://github.com/overpassconnect/mcp-krb-server",
      },
    ],

    capabilitiesKicker: "Capabilities",
    capabilitiesTitle: "What I actually use.",
    capabilities: [
      {
        title: "Interface",
        items: [
          "React",
          "Next.js",
          "three.js",
          "React Three Fiber",
          "GLSL",
          "Lenis",
          "Plain CSS",
        ],
      },
      {
        title: "Service",
        items: [
          "Node.js",
          "PostgreSQL",
          "REST",
          "WebSockets",
          "Shopify API",
          "WooCommerce API",
          "Video pipelines",
        ],
      },
      {
        title: "Mobile",
        items: ["React Native", "Maps", "Realtime messaging", "Push"],
      },
      {
        title: "Hardware",
        items: [
          "Autodesk Inventor",
          "Enclosure design",
          "Sensors & IoT gateways",
          "Embedded firmware",
        ],
      },
    ],

    processKicker: "How the work goes",
    processTitle: "Four steps, and the third one is the shortest.",
    process: [
      {
        title: "Find the seam",
        body: "Before any code, the question is which layer the problem actually lives in. Most briefs describe a symptom in the interface that is caused somewhere else entirely.",
      },
      {
        title: "Prototype the risk",
        body: "Build the one part that might not work — the shader, the sync, the sensor — before building the ten parts that certainly will. If it fails it fails in week one.",
      },
      {
        title: "Build",
        body: "The shortest phase, because the two before it removed the surprises. This is where scope discipline matters more than speed.",
      },
      {
        title: "Ship, then hold it up",
        body: "Live is the start of the job, not the end. Real traffic finds things no plan does, and the work is judged on what it does after that.",
      },
    ],


    aboutKicker: "About",
    aboutCta: "More about me",
    contactKicker: "Contact",
    contactCta: "Get in touch",
  },

  pages: {
    work: {
      title: "Web Design",
      lead: "Sites where the interface is a rendered surface, not a rectangle with an image inside it.",
    },
    apps: {
      title: "Apps",
      lead: "Products with users, deadlines and consequences — and one that is still on the bench.",
    },
    hardware: {
      title: "Electronics & CAD",
      lead: "Devices, enclosures and the drawings behind them. The half of the degree that ends up in your hands.",
    },
  },

  helix: {
    hint: "Scroll to travel · click a project",
    counter: "Project",
    empty: "Nothing here yet.",
  },

  panel: {
    overview: "Overview",
    role: "Role",
    stack: "Stack",
    highlights: "What made it interesting",
    visit: "Visit the live site",
    close: "Close",
    back: "Back to projects",
    year: "Year",
    releaseHint: "Keep scrolling to close",
    screens: "Screens",
  },

  status: {
    live: "Live",
    wip: "In development",
    soon: "Coming soon",
    archived: "Archived",
  },

  about: {
    title: "About",
    lead: "Software engineer working across interfaces, the services behind them and the hardware underneath. Currently completing a degree in Information Technology & Electronic Systems Engineering.",
    body: [
      "I take on the whole path: from designing the interface through to the product running in production, used by real people around the world. Web interfaces, the services that support them, and the databases and authentication systems they depend on.",
      "I have worked at Overpass Connect since August 2025. Projects include LivelyVend, a live-selling platform for merchants; BeasyPro, a recruitment system running from job advert through to hire; and corporate sites for clients in Greece. I take on the full cycle — architecture, implementation, deployment and ongoing maintenance.",
      "A product in production is as much an infrastructure and security question as a code one. I configure web servers and reverse proxies, apply rate limiting and attack prevention, and work across firewalls and computer networks — addressing, routing, DNS and TLS termination.",
      "On the hardware side I am a student of Information Technology & Electronic Systems Engineering, with practical experience in PCB design, multi-stage transistor amplifiers for signal amplification, and laboratory instrumentation — oscilloscopes and spectrum analysers for wireless communications.",
    ],
    studyKicker: "Education",
    studyBody:
      "Fourth year of a five-year degree in Information Technology & Electronic Systems Engineering.",
    valuesKicker: "How I work",
    values: [
      {
        title: "Delivery",
        body: "Work counts when it is in production and keeps running there. What I ship is what I maintain.",
      },
      {
        title: "Correctness first",
        body: "Accurate values, predictable state and consistent behaviour across devices come before visual refinement. Polish applied over unreliable behaviour does not hold.",
      },
      {
        title: "The full system",
        body: "Interface, service and hardware form one system. I prefer to understand all three rather than work to a specification handed across the boundary between two of them.",
      },
    ],

  },

  contact: {
    title: "Contact",
    lead: "Email is the fastest route. Everything else is a slower version of it.",
    copy: "Copy",
    copied: "Copied",
    copyAria: "Copy to clipboard",
    pending: "Links coming soon.",
  },

  footer: {
    rights: "All rights reserved.",
    top: "Back to top",
  },

  a11y: {
    skip: "Skip to content",
    localeSwitch: "Switch language",
    toggleTheme: "Toggle theme",
    canvasFallback:
      "This section is an interactive 3D scene. The same content is listed below.",
  },
};
