import { FC, ReactNode } from "react"
import { Auth0Provider as Auth0ProviderReact } from "@auth0/auth0-react"

import { auth0Config } from "@/config/auth0"

interface Auth0ProviderProps {
  domain: string
  clientId: string
  children?: ReactNode
}

/**
 * Web variant — wraps `@auth0/auth0-react` with localStorage caching and
 * refresh token rotation so sessions survive page refresh in the browser.
 * Native target uses `react-native-auth0` directly via `Auth0Provider.tsx`.
 */
export const Auth0Provider: FC<Auth0ProviderProps> = ({ domain, clientId, children }) => {
  return (
    <Auth0ProviderReact
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
        ...(auth0Config.audience ? { audience: auth0Config.audience } : {}),
        ...(auth0Config.scope ? { scope: auth0Config.scope } : {}),
      }}
    >
      {children}
    </Auth0ProviderReact>
  )
}
