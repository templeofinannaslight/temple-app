/**
 * Auth0 configuration sourced from EXPO_PUBLIC_AUTH0_* env vars.
 * Native Auth0 apps use PKCE — these values are embedded in the app
 * binary and are not secrets. See `.env.example` for the full schema.
 */

// When true, the AppNavigator skips the LoginScreen gate and drops the user
// straight onto the WebView. Useful for previewing the post-login UX without
// running through Auth0 universal login on every reload.
export const disableAuth = process.env.EXPO_PUBLIC_DISABLE_AUTH === "true"

const requireEnv = (name: string, value: string | undefined): string => {
  if (disableAuth) return value ?? ""
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env (see .env.example) and rebuild the dev client.`,
    )
  }
  return value
}

export const auth0Config = {
  domain: requireEnv("EXPO_PUBLIC_AUTH0_DOMAIN", process.env.EXPO_PUBLIC_AUTH0_DOMAIN),
  clientId: requireEnv("EXPO_PUBLIC_AUTH0_CLIENT_ID", process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID),
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || undefined,
  scope: process.env.EXPO_PUBLIC_AUTH0_SCOPE || "openid profile email offline_access",
} as const
