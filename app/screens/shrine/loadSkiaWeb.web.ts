import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web"

// CanvasKit WASM version must match the one pinned by @shopify/react-native-skia
// (currently 0.41.0 for skia 2.6.x). A mismatch causes a WebAssembly LinkError
// at runtime; bumping skia means updating this URL too.
const CANVASKIT_VERSION = "0.41.0"

export async function loadSkiaForWeb(): Promise<void> {
  await LoadSkiaWeb({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CANVASKIT_VERSION}/bin/full/${file}`,
  })
}
