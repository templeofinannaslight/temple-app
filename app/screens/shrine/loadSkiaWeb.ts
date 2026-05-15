// Native bundles never need to bootstrap CanvasKit — Skia ships as a linked
// native module. This file is the resolver target on iOS / Android.
//
// Metro picks loadSkiaWeb.web.ts for web targets, where the real
// LoadSkiaWeb() lives. Keeping the import out of this file is what
// prevents canvaskit-wasm (which `require("fs")` for Node.js compat)
// from being pulled into the native bundle graph.
export async function loadSkiaForWeb(): Promise<void> {
  /* no-op on native */
}
