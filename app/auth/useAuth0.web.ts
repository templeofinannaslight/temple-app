import { useAuth0 as useAuth0React } from "@auth0/auth0-react"

interface AuthorizeParameters {
  scope?: string
  audience?: string
  additionalParameters?: { screen_hint?: string } & Record<string, string>
}

/**
 * Web shim that exposes the same surface area as `react-native-auth0`'s
 * `useAuth0` hook (the bits we actually use: `user`, `isLoading`, `error`,
 * `authorize`, `clearSession`) but is backed by `@auth0/auth0-react` with
 * localStorage persistence.
 */
export function useAuth0() {
  const { user, isLoading, error, loginWithRedirect, logout } = useAuth0React()

  const authorize = async (parameters: AuthorizeParameters = {}) => {
    const { scope, audience, additionalParameters } = parameters
    await loginWithRedirect({
      authorizationParams: {
        ...(scope ? { scope } : {}),
        ...(audience ? { audience } : {}),
        ...(additionalParameters ?? {}),
      },
    })
  }

  const clearSession = async () => {
    await logout({
      logoutParams: {
        returnTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    })
  }

  return {
    user: user ?? null,
    isLoading,
    error: error ?? null,
    authorize,
    clearSession,
  }
}
