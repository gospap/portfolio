/* Flat config, deliberately small and dependency-free.
 *
 * The point of this file is `no-undef`. Without TypeScript, and with Turbopack
 * happily building JSX that references a variable which no longer exists, a
 * deleted binding survives the build and fails at runtime in the browser. That
 * has already happened here once. This is the only tool in the project that
 * catches it. */
const BROWSER_GLOBALS = [
  "window",
  "document",
  "navigator",
  "console",
  "performance",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
  "getComputedStyle",
  "matchMedia",
  "fetch",
  "URL",
  "URLSearchParams",
  "Image",
  "CSS",
  "Blob",
  "FileReader",
  "HTMLElement",
  "HTMLVideoElement",
  "HTMLImageElement",
  "HTMLCanvasElement",
  "Element",
  "Node",
  "Event",
  "CustomEvent",
  "AbortController",
  "process",
  "structuredClone",
  "queueMicrotask",
];

export default [
  {
    files: ["src/**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: Object.fromEntries(BROWSER_GLOBALS.map((g) => [g, "readonly"])),
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      "no-undef": "error",
      /* no-unused-vars is deliberately OFF. Base ESLint does not know that a
         capitalised identifier inside JSX is a use, so it reports every
         component in the project as unused — 35 false positives and nothing
         true. Turning it on needs eslint-plugin-react's jsx-uses-vars, which
         means wiring up eslint-config-next's flat config. Worth doing; not
         worth blocking on. */
      "no-unused-vars": "off",
      "no-const-assign": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-unreachable": "error",
      "no-self-assign": "error",
    },
  },
  { ignores: ["node_modules/**", ".next/**"] },
];
