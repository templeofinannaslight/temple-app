# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

React Native / Expo SDK 55 mobile app for the **Temple of Inanna's Light**, a queer-affirming Mesopotamian polytheist sanctuary. Built on the Ignite 11.5.0 template. The app authenticates via Auth0 universal login, then drops the user onto a WebView pointing at the sister site `../temple-www` (a React/Vite project). Native iOS + Android, plus a web target that uses the same components.

Bundle ID / Android package: `org.templeofinannaslight`. Display name (home-screen label): `𒀭Inanna`. EAS project ID is in `app.json:71-73`.

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
pnpm test:maestro           # E2E Maestro flows in .maestro/flows/

pnpm depcruise              # dep-cruiser ruleset check
```

EAS cloud builds use scripts like `pnpm run build:android:prod` (= `eas build --profile production --platform android --local`). For non-local cloud builds: `eas build --platform <ios|android> --profile <production|preview|development>`.

## Native config is generated, not hand-edited

`ios/` and `android/` are gitignored — this project uses **Continuous Native Generation**. All native config flows through `app.json` + `app.config.ts` + Expo plugins. Whenever you change icons, splash, bundle ID, plugins, permissions, or anything that affects native output, run `pnpm prebuild:clean` so the regenerated dirs reflect your config. `pnpm ios` / `pnpm android` will *also* prebuild but won't `--clean`, so stale assets (storyboards, drawables) hang around — use `prebuild:clean` explicitly when in doubt.

## Architecture: platform-specific files

Metro resolves `.web.tsx` for web targets and `.tsx` for native. The codebase uses this in two important places:

- **`app/auth/`** — `Auth0Provider.tsx` + `useAuth0.ts` re-export `react-native-auth0` directly on native. `Auth0Provider.web.tsx` + `useAuth0.web.ts` wrap `@auth0/auth0-react` with `cacheLocation="localstorage"` + `useRefreshTokens` and expose the same hook surface (`user`, `isLoading`, `authorize({ scope, audience, additionalParameters: { screen_hint } })`, `clearSession`). Screens import from `@/auth/useAuth0` and never branch on platform.
- **`app/screens/WelcomeScreen.tsx` vs `WelcomeScreen.web.tsx`** — WebView on native, iframe on web. Both implement the same temple-background splash-overlay fade (500ms hold, 1s fade) on top of the embedded `EXPO_PUBLIC_TEMPLE_WWW_URL`.
- **`app/components/GradientText.tsx` vs `GradientText.web.tsx`** — MaskedView + LinearGradient on native; CSS `background-clip: text` on web.

When you add a screen or component that has different native and web implementations, follow this same pattern (don't `Platform.OS` branch inside one file).

## Auth gate

`AppNavigator.tsx` shows `LoginScreen` when there's no `user` from `useAuth0()`, otherwise `WelcomeScreen`. There's a dev escape hatch: setting `EXPO_PUBLIC_DISABLE_AUTH=true` in `.env` (or per-profile in `eas.json`) skips the LoginScreen and drops straight onto `WelcomeScreen` — useful for iterating on the WebView without Auth0 round-trips. `app/config/auth0.ts` reads this flag and also exports a tolerant `requireEnv` that returns `""` when `disableAuth` is true so the app doesn't crash on missing Auth0 vars in that mode.

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

Key vars: `EXPO_PUBLIC_AUTH0_DOMAIN`, `EXPO_PUBLIC_AUTH0_CLIENT_ID`, `EXPO_PUBLIC_AUTH0_AUDIENCE`, `EXPO_PUBLIC_AUTH0_SCOPE`, `EXPO_PUBLIC_TEMPLE_WWW_URL`, `EXPO_PUBLIC_DISABLE_AUTH`. Production values are duplicated in `eas.json` per-profile `env` blocks since EAS cloud builds don't read your local `.env`.

## Versioning

`eas.json` uses `"appVersionSource": "remote"` — Android `versionCode` and iOS `buildNumber` live on EAS servers, not in `app.json`. The production profile has `"autoIncrement": true`, so each `eas build --profile production` bumps the counter server-side. The user-facing `version` in `app.json` (e.g. `1.0.3`) is independent and is what you bump manually for releases.

## Brand assets

All app icons (`assets/images/app-icon-*.png`) and `assets/images/logo*.png` are generated from `temple-logo.png` (1254×1254, transparent eight-pointed star). When regenerating, the Android **adaptive foreground** needs a ~20% safe-zone for launcher masks; the iOS / Android-legacy / web-favicon icons sit on white with ~10% margin; the Android adaptive **background** is a solid color. `temple-logo.png` itself is the source of truth — don't edit the derivatives by hand.

## Sibling repo

`../temple-www` is the React/Vite site this app embeds. When you change shared visual elements (colors, gradients, header layout), check both repos. The temple-www repo also has `bg-fixed` quirks on iOS WebView — that fix is `md:bg-fixed` instead of `bg-fixed` so the attachment-fixed style only applies at desktop breakpoints.
