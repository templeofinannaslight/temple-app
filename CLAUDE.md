# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

React Native / Expo SDK 55 mobile app for the **Temple of Inanna's Light**, a queer-affirming Mesopotamian polytheist sanctuary. Built on the Ignite 11.5.0 template. The app authenticates via Auth0 universal login, then presents a three-tab sanctuary. Native iOS + Android, plus a web target that uses the same components.

Bundle ID / Android package: `org.templeofinannaslight`. Display name (home-screen label): `𒀭Inanna`. EAS project ID is in `app.json`, under `extra.eas.projectId`.

`README.md` is the human-facing counterpart to this file — it covers the same ground in more depth for someone opening the repo cold. Keep the two in sync when behavior changes.

## Common commands

```bash
pnpm install                # bootstrap
pnpm start                  # Metro with --dev-client
pnpm ios | pnpm android     # expo run:* (builds + launches local dev client)
pnpm web                    # web target via Metro

pnpm prebuild:clean         # CRITICAL after changing native config — regenerates ios/ and android/
                            # Required when editing app.json icons/splash/plugins/bundle-id

pnpm compile                # tsc --noEmit (typecheck only)
pnpm lint | pnpm lint:check # eslint --fix / check

pnpm test                   # Jest
pnpm test -- path/to/file   # single test file
pnpm test:maestro           # E2E Maestro flows — NOTE: targets .maestro/flows/, which
                            # doesn't exist yet. Only .maestro/shared/ is present.

pnpm lint:deps              # dep-cruiser ruleset check (NOT `pnpm depcruise` — no such script)
pnpm lint:deps:graph        # render dependency graph to SVG + PNG (needs Graphviz `dot`)

pnpm update:production      # publish an OTA update (also :preview, :development)
```

EAS cloud builds use scripts like `pnpm run build:android:prod` (= `eas build --profile production --platform android --local`). The `build:*` scripts are all `--local`; the `build:cloud:*` variants run on EAS servers. `pnpm submit:cloud:{ios,android}` ships the latest build to the stores.

## Native config is generated, not hand-edited

`ios/` and `android/` are gitignored — this project uses **Continuous Native Generation**. All native config flows through `app.json` + `app.config.ts` + Expo plugins. Whenever you change icons, splash, bundle ID, plugins, permissions, or anything that affects native output, run `pnpm prebuild:clean` so the regenerated dirs reflect your config. `pnpm ios` / `pnpm android` will *also* prebuild but won't `--clean`, so stale assets (storyboards, drawables) hang around — use `prebuild:clean` explicitly when in doubt.

## Screens and navigation

`AppNavigator` (auth gate) → `MainTabsNavigator` → three tabs, all `headerShown: false`, tab bar styled inline with gold-on-black constants at the top of `MainTabsNavigator.tsx`:

- **⌂ Home** — `WelcomeScreen`. The embedded `../temple-www` site (WebView native / iframe web) behind a temple-background splash overlay: 500ms hold, 1s fade.
- **✦ Shrine** — `ShrineScreen`. A Skia canvas with a custom bloom shader; tap a candle to light it. Candle geometry, bloom reach, and per-type burn durations (4h–36h) all live in `app/screens/shrine/shrineBloomShader.ts` — that file is the source of truth, `ShrineScreen` just reads it. Lit candles persist to MMKV under `shrine:candleLedger` as `{ candleId: litAtTimestamp }`; expired entries are pruned on load. There's a migration path from an older `shrine:litCandles` `number[]` format — don't drop it without a reason.
- **☽ Calendar** — `CalendarScreen`. An SVG wheel of the twelve Sumerian months (`app/data/calendar.ts` — names, seasons, myth cycles, festivals, practices) layered with computed sky data: lunar phases via `app/utils/moonPhase.ts` (Meeus JDE algorithms), Sumerian dates via `@jenova-marie/sumerian-date`, and Jupiter/Mercury events via `app/utils/nibiru.ts` + `astronomy-engine`. Observer location comes from `useUserLocation`, defaulting to Nippur (32.13°N, 45.23°E) — that default is deliberate, it matches what scholarly editions assume.

The Calendar footer renders `v{version}-{ota}`, where `ota` is the first 8 chars of the running EAS update ID or `base` for the embedded bundle. Useful for cross-referencing a device against `eas update:list`.

Deep-link paths are registered in `app.tsx`'s linking `config` (`Main.screens`: `welcome`, `shrine`, `calendar`). **Add a tab → add its path there too**, or web routing silently won't resolve it. That config also still lists dead `Demo` routes from the Ignite template.

## Fonts

Two Google fonts load at boot via `expo-font` (`app/theme/typography.ts`, five weights each): **Space Grotesk** for UI, **Cormorant Garamond** for the Calendar wheel and SVG labels. `app.tsx` renders `null` until `useFonts` resolves — a font added to `customFontsToLoad` but missing from the bundle will hang the app on a blank screen rather than erroring visibly.

## Architecture: platform-specific files

Metro resolves `.web.tsx` for web targets and `.tsx` for native. Rather than branching on `Platform.OS` inside a component, this codebase splits the file. Each pair exposes the same surface:

- **`app/auth/`** — `Auth0Provider.tsx` + `useAuth0.ts` re-export `react-native-auth0` directly on native. `Auth0Provider.web.tsx` + `useAuth0.web.ts` wrap `@auth0/auth0-react` with `cacheLocation="localstorage"` + `useRefreshTokens` and expose the same hook surface (`user`, `isLoading`, `authorize({ scope, audience, additionalParameters: { screen_hint } })`, `clearSession`). Screens import from `@/auth/useAuth0` and never branch on platform.
- **`app/screens/WelcomeScreen.tsx` vs `WelcomeScreen.web.tsx`** — WebView on native, iframe on web. Both implement the same temple-background splash-overlay fade (500ms hold, 1s fade) on top of the embedded `EXPO_PUBLIC_TEMPLE_WWW_URL`.
- **`app/components/GradientText.tsx` vs `GradientText.web.tsx`** — MaskedView + LinearGradient on native; CSS `background-clip: text` on web.
- **`app/screens/shrine/loadSkiaWeb.ts` vs `.web.ts`** — no-op on native (Skia is a linked native module); on web it bootstraps CanvasKit WASM from a CDN. Keeping the import out of the native file is what prevents `canvaskit-wasm` (which `require`s Node's `fs`) from being pulled into the native bundle graph — don't "simplify" this into one file. The web loader pins `CANVASKIT_VERSION` to match what `@shopify/react-native-skia` expects (`0.41.0` for Skia 2.6.x); a mismatch is a runtime WebAssembly `LinkError`, so bumping Skia means bumping that URL.
- **`app/devtools/ReactotronClient.ts` vs `.web.ts`** — `reactotron-react-native` vs `reactotron-react-js`.

When you add a screen or component that has different native and web implementations, follow this same pattern (don't `Platform.OS` branch inside one file).

Note `@shopify/react-native-skia` is excluded from `expo install --fix` (`package.json` → `expo.install.exclude`) and is in `pnpm.onlyBuiltDependencies` — `pnpm align-deps` will leave its version alone by design.

## Auth gate

`AppNavigator.tsx` shows `LoginScreen` when there's no `user` from `useAuth0()`, otherwise `MainTabsNavigator`. There's a dev escape hatch: setting `EXPO_PUBLIC_DISABLE_AUTH=true` in `.env` (or per-profile in `eas.json`) skips the LoginScreen and drops straight into the tabs — useful for iterating on the UI without Auth0 round-trips. `app/config/auth0.ts` reads this flag and also exports a tolerant `requireEnv` that returns `""` when `disableAuth` is true so the app doesn't crash on missing Auth0 vars in that mode.

## Splash screen has explicit dismissal

`app/app.tsx` calls `SplashScreen.preventAutoHideAsync()` at module scope so the native splash stays up past JS bundle load. Three dismissal paths:

1. `LoginScreen` `useEffect` → `hideAsync()` on first paint (auth enabled, no session)
2. 5s `setTimeout` fallback in `app.tsx` (covers `disableAuth` and existing-session paths where `LoginScreen` never mounts)
3. First call wins; subsequent are no-ops

iOS uses `splash-fullbleed.png` (1284×2778) with `enableFullScreenImage_legacy: true` — Expo's flag that swaps the storyboard layout from "centered icon" to actual full-bleed `cover` cropping. Android can't do full-bleed (Android 12+ `SplashScreen` API enforces icon-style at the OS level), so the `android:` override block in `app.json` uses `temple-logo.png` centered at 200dp on `#000000`.

## Path aliases

`tsconfig.json` defines `@/*` → `./app/*` and `@assets/*` → `./assets/*`. Use these in imports (matches the rest of the codebase). The Ignite ESLint config + dep-cruiser ruleset both enforce module boundaries.

## Env vars

All runtime config goes through `EXPO_PUBLIC_*` (Expo's prefix for vars exposed to the JS runtime). `.env` is gitignored; `.env.example` documents the schema. The `.envrc` in the project root sources `.env` automatically if you use direnv.

Key vars: `EXPO_PUBLIC_AUTH0_DOMAIN`, `EXPO_PUBLIC_AUTH0_CLIENT_ID`, `EXPO_PUBLIC_AUTH0_AUDIENCE`, `EXPO_PUBLIC_AUTH0_SCOPE`, `EXPO_PUBLIC_TEMPLE_WWW_URL`, `EXPO_PUBLIC_DISABLE_AUTH`. Production values are duplicated in `eas.json` per-profile `env` blocks since EAS cloud builds don't read your local `.env`. **`eas.json` itself is gitignored** — `eas.json.example` is the checked-in template with the env values blanked.

`EXPO_PUBLIC_AUTH0_DOMAIN` is also read at *config* time by `app.config.ts`, which conditionally injects the `react-native-auth0` plugin (it supplies the native callback URL scheme). If the domain isn't set in the environment when you prebuild, **the plugin is silently omitted and native login fails at runtime with no build-time error**. Worth checking first when native login breaks but web login works.

These are native PKCE apps with no client secret, so the values ship inside the binary — configuration, not secrets.

## Versioning

`eas.json` uses `"appVersionSource": "remote"` — Android `versionCode` and iOS `buildNumber` live on EAS servers, not in `app.json`. The production profile has `"autoIncrement": true`, so each `eas build --profile production` bumps the counter server-side. The user-facing `version` is what you bump manually for releases, and it lives in **both `app.json` and `package.json`** — keep them in sync.

Two consequences of `runtimeVersion.policy: "appVersion"`:

- **Bumping `version` starts a new runtime version.** OTA updates published afterward will not reach clients running the old binary. Bump it when shipping a new native build; leave it alone when shipping JS over the air.
- The Calendar footer stamp reads `app.json`'s `version` via `expo-constants`, so it tracks whatever you set there.

Each EAS profile is bound to its own update channel: `development`, `development-device`, `preview`, `preview-device`, `production`.

## OTA updates on launch

`app.tsx` checks for an EAS update on every cold launch and, if one is available, fetches it and calls `Updates.reloadAsync()` so the user lands on the newest bundle. Skipped when `__DEV__` (Metro serves live) or `!Updates.isEnabled`. All failures are swallowed deliberately — a broken update server must never block boot. If you're debugging "my change didn't appear," check which channel the build is on before assuming the update failed.

## Brand assets

All app icons (`assets/images/app-icon-*.png`) and `assets/images/logo*.png` are generated from `temple-logo.png` (1254×1254, transparent eight-pointed star). When regenerating, the Android **adaptive foreground** needs a ~20% safe-zone for launcher masks; the iOS / Android-legacy / web-favicon icons sit on white with ~10% margin; the Android adaptive **background** is a solid color. `temple-logo.png` itself is the source of truth — don't edit the derivatives by hand.

Not derived from the logo, and not interchangeable: `shrine.dark.png` / `shrine.lite.png` are the unlit and lit shrine plates. `ShrineSkiaCanvas.tsx` always draws the dark plate as a base and reveals the lit one through a luminance mask built from per-candle radial blooms — so the two images must be pixel-aligned renders of the same scene. `CANDLE_POSITIONS`, `PORTRAIT_RECT`, and `NAMEPLATE_RECT` are all percentages mapped from `shrine.dark.png` at 1024×1536; **re-cropping or re-framing that art invalidates every candle hit-box and both reveal rects.** `temple-background.png` is the WelcomeScreen splash overlay.

## Sibling repo

`../temple-www` is the React/Vite site this app embeds. When you change shared visual elements (colors, gradients, header layout), check both repos. The temple-www repo also has `bg-fixed` quirks on iOS WebView — that fix is `md:bg-fixed` instead of `bg-fixed` so the attachment-fixed style only applies at desktop breakpoints.
