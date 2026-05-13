import { FC, useEffect, useRef } from "react"
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageStyle,
  Linking,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { WebView, WebViewNavigation } from "react-native-webview"

import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

const TEMPLE_URL = process.env.EXPO_PUBLIC_TEMPLE_WWW_URL ?? "https://www.templeofinannaslight.org"
const TEMPLE_HOST = (() => {
  try {
    return new URL(TEMPLE_URL).host
  } catch {
    return ""
  }
})()
const overlayImage = require("@assets/images/temple-background.png")

const OVERLAY_HOLD_MS = 500
const OVERLAY_FADE_MS = 1000

// Allow in-WebView navigation only for the temple-www origin (and about:blank
// for the WebView's own startup quirk). Everything else — Discord invite, social
// links, etc. — opens in the system browser so users land in the right app.
const shouldOpenInWebView = (request: WebViewNavigation): boolean => {
  const { url } = request
  if (!url || url === "about:blank") return true
  try {
    const host = new URL(url).host
    if (host === TEMPLE_HOST) return true
  } catch {
    return true
  }
  Linking.openURL(url).catch(() => {})
  return false
}

export const WelcomeScreen: FC = function WelcomeScreen() {
  const { themed, theme } = useAppTheme()
  const overlayOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: OVERLAY_FADE_MS,
        useNativeDriver: true,
      }).start()
    }, OVERLAY_HOLD_MS)
    return () => clearTimeout(timer)
  }, [overlayOpacity])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1} safeAreaEdges={["top"]}>
      <WebView
        source={{ uri: TEMPLE_URL }}
        style={themed($webview)}
        startInLoadingState
        onShouldStartLoadWithRequest={shouldOpenInWebView}
        renderLoading={() => (
          <View style={themed($loading)}>
            <ActivityIndicator color={theme.colors.tint} />
          </View>
        )}
      />
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <Animated.View style={[$overlay, { opacity: overlayOpacity }]}>
        <Image source={overlayImage} resizeMode="cover" style={$overlayImage} />
      </Animated.View>
    </Screen>
  )
}

const $webview: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loading: ThemedStyle<ViewStyle> = ({ colors }) => ({
  ...StyleSheet.absoluteFillObject,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
})

const $overlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  pointerEvents: "none",
}

// Mirrors LoginScreen's $bg — bg-cover bg-center, full-bleed.
const $overlayImage: ImageStyle = {
  ...StyleSheet.absoluteFillObject,
  width: "100%",
  height: "100%",
}
