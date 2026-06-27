// Global test setup. jsdom does not implement the CSS namespace, but shared
// helpers (e.g. src/shared/utils/css.js) call CSS.supports during color
// normalization. Provide a minimal stub so importing those modules — and the
// stores that use them — doesn't throw under jsdom.
if (typeof globalThis.CSS === 'undefined') {
  globalThis.CSS = {}
}

if (typeof globalThis.CSS.supports !== 'function') {
  globalThis.CSS.supports = () => false
}
