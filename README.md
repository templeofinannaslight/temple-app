# 𒀭Inanna — Temple of Inanna's Light

> Mobile sanctuary for the **Temple of Inanna's Light**, a queer-affirming Mesopotamian polytheist temple.

A React Native / Expo SDK 55 app for iOS, Android, and web. Members sign in through Auth0 universal
login and land in a three-tab sanctuary: the temple site itself, a candle-lighting shrine, and a
living Sumerian lunar calendar.

- **Bundle ID / Android package:** `org.templeofinannaslight`
- **Home-screen label:** `𒀭Inanna`
- **Sister site:** [`../temple-www`](../temple-www) — the React/Vite site the Home tab embeds
- Built on the [Ignite](https://github.com/infinitered/ignite) 11.5.0 boilerplate

---

## Table of contents

- [What's inside](#whats-inside)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Builds, channels, and releases](#builds-channels-and-releases)
- [Testing](#testing)
- [Brand assets](#brand-assets)

---

## What's inside

After the auth gate, `MainTabsNavigator` presents three tabs (`app/navigators/MainTabsNavigator.tsx`):

### ⌂ Home

`WelcomeScreen` embeds `EXPO_PUBLIC_TEMPLE_WWW_URL` — a WebView on native, an `<iframe>` on web —
behind a temple-background splash overlay that holds for 500 ms and fades over 1 s.

### ✦ Shrine

`ShrineScreen` renders the shrine as a Skia canvas (`@shopify/react-native-skia`) with a custom bloom
shader. Tap a candle to light it; each of the six candle types burns for its own duration before
guttering out:

| Type | Burn time |
| --- | --- |
| `tall` | 36 h |
| `med` | 24 h |
| `short` | 12 h |
| `small` | 8 h |
| `tiny`, `stick` | 4 h |

Lit candles persist to MMKV as a ledger of `{ candleId: litAtTimestamp }` under `shrine:candleLedger`,
and expired entries are pruned on load. Candle geometry, bloom reach, and burn durations all live in
`app/screens/shrine/shrineBloomShader.ts`.

### ☽ Calendar

`CalendarScreen` draws an SVG wheel of the twelve Sumerian months from `app/data/calendar.ts` — each
carrying its Akkadian and Sumerian names, season, myth cycle, festivals, and practices. On top of the
wheel it computes real sky data:

- **Lunar phases** via `app/utils/moonPhase.ts` (Meeus JDE algorithms — new, first quarter, full, last quarter)
- **Sumerian date** via [`@jenova-marie/sumerian-date`](https://www.npmjs.com/package/@jenova-marie/sumerian-date)
- **"Nibiru" events** via `app/utils/nibiru.ts` and `astronomy-engine` — Jupiter meridian transits,
  Jupiter oppositions, and Mercury solar transits
- **Observer location** from `app/utils/useUserLocation.ts`, defaulting to Nippur (32.13° N, 45.23° E)

The footer stamps the running build as `v{version}-{ota}` — app semver plus the first 8 chars of the
running EAS update ID, or `base` when running the JS baked into the binary. Handy for
cross-referencing a device against `eas update:list`.

---

## Requirements

- **Node** ≥ 20
- **pnpm** (the lockfile is `pnpm-lock.yaml`)
- **EAS CLI** ≥ 18 for builds and OTA updates
- Xcode and/or Android Studio for local native builds

---

## Getting started

```bash
pnpm install
cp .env.example .env      # then fill in your Auth0 values
pnpm start                # Metro with --dev-client
```

This app uses a **dev client**, not Expo Go — `pnpm start` alone won't give you a runnable app the
first time. Build and launch one:

```bash
pnpm ios          # expo run:ios     — prebuild + build + launch
pnpm android      # expo run:android
pnpm web          # web target via Metro
```

Or produce a dev-client build through EAS:

```bash
pnpm build:ios:sim        # simulator build, local
pnpm build:ios:device     # device build, local
pnpm build:android:sim
pnpm build:android:device
```

**Iterating without Auth0:** set `EXPO_PUBLIC_DISABLE_AUTH=true` in `.env` to skip `LoginScreen` and
drop straight into the tabs.

---

## Environment variables

All runtime config uses Expo's `EXPO_PUBLIC_*` prefix. `.env` is gitignored; `.env.example` documents
the schema. The `.envrc` in the project root sources `.env` automatically under direnv.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_AUTH0_DOMAIN` | Auth0 tenant domain, no protocol (e.g. `your-tenant.us.auth0.com`) |
| `EXPO_PUBLIC_AUTH0_CLIENT_ID` | Native application Client ID from the Auth0 dashboard |
| `EXPO_PUBLIC_AUTH0_AUDIENCE` | API identifier for access tokens; blank yields an opaque `/userinfo`-only token |
| `EXPO_PUBLIC_AUTH0_SCOPE` | OAuth scopes — `openid profile email offline_access` |
| `EXPO_PUBLIC_TEMPLE_WWW_URL` | URL the Home tab loads (localhost while developing `temple-www`) |
| `EXPO_PUBLIC_DISABLE_AUTH` | `"true"` skips the login screen entirely — development only |

Native Auth0 apps use PKCE and have no client secret, so these values ship inside the binary. Treat
them as configuration, not secrets.

`EXPO_PUBLIC_AUTH0_DOMAIN` is also read at config time by `app.config.ts`, which injects the
`react-native-auth0` plugin (needed for the native callback URL scheme). **If the domain isn't set
when you prebuild, the plugin is silently omitted and native login will fail.**

EAS cloud builds don't read your local `.env`, so production values are duplicated in per-profile
`env` blocks in `eas.json`. That file is gitignored — `eas.json.example` is the checked-in template.

---

## Scripts

### Development

| Script | Does |
| --- | --- |
| `pnpm start` | Metro bundler with `--dev-client` |
| `pnpm ios` / `pnpm android` | `expo run:*` — prebuild, build, launch |
| `pnpm web` | Web target via Metro |
| `pnpm bundle:web` / `pnpm serve:web` | Static web export → serve `dist/` |
| `pnpm adb` | Reverse Android ports (8081, 9090, 9001, 3000) for Metro + Reactotron |
| `pnpm prebuild:clean` | **Regenerate `ios/` + `android/` from scratch** |

### Quality

| Script | Does |
| --- | --- |
| `pnpm compile` | `tsc --noEmit` typecheck |
| `pnpm lint` / `pnpm lint:check` | ESLint with / without `--fix` |
| `pnpm lint:deps` | dependency-cruiser module-boundary rules |
| `pnpm lint:deps:graph` | Render the dependency graph to SVG + PNG (needs Graphviz `dot`) |
| `pnpm test` / `pnpm test:watch` | Jest |
| `pnpm test:maestro` | Maestro E2E flows |
| `pnpm align-deps` | `expo install --fix` — realign deps to the SDK |

### Build and release

| Script | Does |
| --- | --- |
| `pnpm build:{ios,android}:{sim,device,preview,prod}` | Local EAS builds |
| `pnpm build:cloud:{ios,android}:{preview,prod}` | EAS cloud builds |
| `pnpm build:cloud:all` | Production build, both platforms |
| `pnpm submit:cloud:{ios,android}` | Submit the latest build to the stores |
| `pnpm update:{production,preview,development}` | Publish an OTA update to that branch |

---

## Architecture

### Platform-specific files

Metro resolves `.web.tsx` for web targets and `.tsx` for native. Rather than branching on
`Platform.OS` inside a component, this codebase splits the file:

| Native | Web | Difference |
| --- | --- | --- |
| `app/auth/Auth0Provider.tsx`, `useAuth0.ts` | `.web.tsx`, `.web.ts` | `react-native-auth0` vs `@auth0/auth0-react` (with `cacheLocation="localstorage"` + `useRefreshTokens`) |
| `app/screens/WelcomeScreen.tsx` | `.web.tsx` | WebView vs `<iframe>` |
| `app/components/GradientText.tsx` | `.web.tsx` | MaskedView + LinearGradient vs CSS `background-clip: text` |
| `app/screens/shrine/loadSkiaWeb.ts` | `.web.ts` | No-op vs bootstrapping CanvasKit WASM |
| `app/devtools/ReactotronClient.ts` | `.web.ts` | `reactotron-react-native` vs `reactotron-react-js` |

Both sides of a pair expose the same surface, so screens import from `@/auth/useAuth0` and never know
which platform they're on. **Follow this pattern when adding anything with divergent implementations.**

The Skia split matters beyond tidiness: keeping the `canvaskit-wasm` import out of the native file is
what stops it from being pulled into the native bundle graph (it `require`s Node's `fs`). The web
loader pins a CanvasKit version that must match the one `@shopify/react-native-skia` expects —
currently `0.41.0` for Skia 2.6.x. A mismatch throws a WebAssembly `LinkError` at runtime, so bumping
Skia means updating that URL too.

### Auth gate

`AppNavigator.tsx` renders `LoginScreen` when `useAuth0()` returns no `user`, and `MainTabsNavigator`
otherwise. `app/config/auth0.ts` reads `EXPO_PUBLIC_DISABLE_AUTH` and exports a tolerant `requireEnv`
that returns `""` when auth is disabled, so the app won't crash on missing Auth0 vars in that mode.

### Splash screen

`app/app.tsx` calls `SplashScreen.preventAutoHideAsync()` at module scope so the native splash
survives JS bundle load. Two dismissal paths, first-call-wins:

1. `LoginScreen`'s `useEffect` → `hideAsync()` on first paint (auth on, no session)
2. A 5 s `setTimeout` fallback in `app.tsx` (covers `disableAuth` and existing-session paths where
   `LoginScreen` never mounts)

iOS uses `splash-fullbleed.png` (1284×2778) with Expo's `enableFullScreenImage_legacy: true`, which
swaps the storyboard from centered-icon layout to true full-bleed `cover` cropping. Android can't do
full-bleed — the Android 12+ `SplashScreen` API enforces icon style at the OS level — so the
`android:` override in `app.json` centers `temple-logo.png` at 200 dp on `#000000`.

### OTA updates on launch

`app/app.tsx` checks for an EAS update on every cold launch; if one is available it fetches and
reloads so the user lands on the newest bundle. Skipped in `__DEV__` (Metro serves live), and all
failures are swallowed so a broken update server never blocks boot.

### Native config is generated, not hand-edited

`ios/` and `android/` are gitignored — this project uses **Continuous Native Generation**. Everything
native flows through `app.json` + `app.config.ts` + Expo plugins. After changing icons, splash,
bundle ID, plugins, or permissions, run:

```bash
pnpm prebuild:clean
```

`pnpm ios` / `pnpm android` also prebuild, but *without* `--clean`, so stale storyboards and drawables
linger. Use `prebuild:clean` explicitly when in doubt.

Active plugins: `expo-localization`, `expo-font`, `expo-splash-screen`, `react-native-edge-to-edge`,
`expo-build-properties` (New Architecture + Hermes on both platforms), and `react-native-auth0`
(injected dynamically by `app.config.ts`).

### Path aliases

`tsconfig.json` maps `@/*` → `./app/*` and `@assets/*` → `./assets/*`. Use them in imports — the
Ignite ESLint config and the dependency-cruiser ruleset both enforce module boundaries.

### Typography

Two Google fonts load at boot via `expo-font` (`app/theme/typography.ts`): **Space Grotesk** for UI
text and **Cormorant Garamond** for the calendar wheel and SVG labels, each in five weights.

### Project layout

```tree
app
├── auth/         Auth0 provider + hook (native / web pairs)
├── components/   Ignite primitives + Temple* variants + StarField, GradientText
├── config/       Env-derived config, auth0 config, dev/prod overrides
├── data/         calendar.ts — the twelve Sumerian months
├── devtools/     Reactotron setup
├── i18n/         en / es / fr
├── navigators/   AppNavigator (auth gate) + MainTabsNavigator
├── screens/      Login, Welcome, Shrine, Calendar, ErrorScreen
├── services/     apisauce API client
├── theme/        colors, spacing, typography, timing, theme context
└── utils/        moonPhase, nibiru, useUserLocation, storage (MMKV), formatDate…
assets
├── icons/        Icon component assets
└── images/       App icons, splash, temple-logo
```

---

## Builds, channels, and releases

`eas.json` defines these profiles, each bound to its own update channel:

| Profile | Distribution | Channel | Notes |
| --- | --- | --- | --- |
| `development` | internal | `development` | Debug build, iOS simulator, `assembleDebug` on Android |
| `development:device` | internal | `development-device` | Debug build on a physical device |
| `preview` | internal | `preview` | Release build, iOS simulator, Android APK |
| `preview:device` | internal | `preview-device` | Release build on a physical device |
| `production` | store | `production` | `autoIncrement: true` |

### Versioning

`eas.json` sets `"appVersionSource": "remote"`, so Android `versionCode` and iOS `buildNumber` live on
EAS servers rather than in `app.json`. The `production` profile has `autoIncrement: true` — each
production build bumps the counter server-side.

The user-facing `version` (`1.1.0`) lives in **both** `app.json` and `package.json` and is bumped by
hand for releases. Keep them in sync: `app.json` drives the runtime version policy (`appVersion`) and
the calendar footer stamp.

Because `runtimeVersion.policy` is `"appVersion"`, **bumping `version` starts a new runtime version**
— OTA updates published afterward won't reach clients on the old binary. Bump the version when you
ship a new native build; leave it alone when you're only shipping JS over the air.

### Shipping an OTA update

```bash
pnpm update:preview        # or update:production
```

Clients pick it up on the next cold launch, per the update check in `app/app.tsx`.

---

## Testing

```bash
pnpm test                     # full Jest suite
pnpm test -- path/to/file     # a single file
```

Jest runs on `jest-expo` with `@testing-library/react-native`; setup lives in `test/`. Current unit
coverage: `app/components/Text.test.tsx`, `app/services/api/apiProblem.test.ts`,
`app/utils/storage/storage.test.ts`, and `test/i18n.test.ts`.

E2E runs through [Maestro](https://ignitecookbook.com/docs/recipes/MaestroSetup):

```bash
pnpm test:maestro
```

> **Note:** `.maestro/` currently holds only `shared/_OnFlowStart.yaml`. The script points at
> `.maestro/flows`, which doesn't exist yet — add flow files there before this command will do
> anything.

---

## Brand assets

Every app icon (`assets/images/app-icon-*.png`) and `logo*.png` derives from **`temple-logo.png`**
(1254×1254, transparent eight-pointed star). That file is the source of truth — don't hand-edit the
derivatives. When regenerating:

- **Android adaptive foreground** — leave a ~20% safe zone for launcher masks
- **iOS / Android legacy / web favicon** — on white with ~10% margin
- **Android adaptive background** — a solid color

---

## Working alongside `temple-www`

The Home tab embeds [`../temple-www`](../temple-www), the React/Vite temple site. When you change
shared visual elements — colors, gradients, header layout — check both repos.

One known quirk: `bg-fixed` misbehaves in the iOS WebView. `temple-www` uses `md:bg-fixed` so
fixed attachment only applies at desktop breakpoints.
