import { FC, useEffect, useState } from "react"
import { Image, ImageStyle, ScrollView, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import * as SplashScreen from "expo-splash-screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuth0 } from "@/auth/useAuth0"
import { GradientText } from "@/components/GradientText"
import { TempleButton } from "@/components/TempleButton"
import { TempleHeader } from "@/components/TempleHeader"
import { Text } from "@/components/Text"
import { auth0Config } from "@/config/auth0"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const bgImage = require("@assets/images/temple-background.png")
const logoImage = require("@assets/images/temple-logo.png")

export const LoginScreen: FC = function LoginScreen() {
  const { authorize, isLoading } = useAuth0()
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  const startUniversalLogin = async (screenHint?: "signup" | "login") => {
    if (busy) return
    setBusy(true)
    setError(undefined)
    try {
      await authorize({
        scope: auth0Config.scope,
        audience: auth0Config.audience,
        ...(screenHint ? { additionalParameters: { screen_hint: screenHint } } : {}),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("loginScreen:error"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={themed($root)}>
      <Image source={bgImage} resizeMode="cover" style={$bg} />
      {/*
        Suppress the entire LoginScreen UI while the Auth0 SDK is processing
        an inbound callback (isLoading=true on web after redirect-back, or
        briefly on native while stored credentials are restored). This keeps
        users from seeing the login chrome flash before they're navigated
        through to the WebView.
      */}
      {!isLoading && (
        <View style={$ui}>
          <TempleHeader />
          <ScrollView
            contentContainerStyle={[themed($scrollContent), { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={$hero}>
              <Image source={logoImage} style={$logo} resizeMode="contain" />
              <GradientText tx="loginScreen:title" style={themed($title)} />
              <Text tx="loginScreen:subtitle" style={themed($subtitle)} />
            </View>

            <View style={$actions}>
              <TempleButton
                variant="primary"
                tx="loginScreen:login"
                disabled={busy}
                onPress={() => startUniversalLogin("login")}
              />
              <TempleButton
                variant="secondary"
                tx="loginScreen:register"
                disabled={busy}
                onPress={() => startUniversalLogin("signup")}
              />
              {error ? <Text text={error} style={themed($error)} /> : null}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.palette.templeGray950,
})

// Mirrors the homepage's `bg-cover bg-center bg-no-repeat bg-fixed`.
const $bg: ImageStyle = {
  ...StyleSheet.absoluteFillObject,
  width: "100%",
  height: "100%",
}

const $ui: ViewStyle = {
  flex: 1,
}

const $scrollContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
  paddingHorizontal: 24,
  paddingTop: 24,
  justifyContent: "space-between",
})

const $hero: ViewStyle = {
  alignItems: "center",
  paddingTop: 16,
}

const $logo: ImageStyle = {
  height: 144,
  width: 240,
  marginBottom: 32,
}

// Gradient is applied glyph-by-glyph by <GradientText>. Color/text-shadow
// would either be ignored (web) or look noisy through the mask (native), so
// we leave them off and let the gradient do the talking — like the homepage.
const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 28,
  fontWeight: "700",
  textAlign: "center",
  marginBottom: 24,
  letterSpacing: -0.5,
  lineHeight: 36,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.templeGray300,
  fontSize: 18,
  textAlign: "center",
  lineHeight: 28,
  paddingHorizontal: 8,
})

const $actions: ViewStyle = {
  gap: 14,
  marginTop: 40,
  paddingBottom: 16,
}

const $error: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.templeBrandLight,
  fontSize: 14,
  textAlign: "center",
  marginTop: 12,
})
