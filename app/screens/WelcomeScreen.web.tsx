import { CSSProperties, FC, useEffect, useRef } from "react"
import { Animated, Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

const TEMPLE_URL = process.env.EXPO_PUBLIC_TEMPLE_WWW_URL ?? "https://www.templeofinannaslight.org"
const overlayImage = require("@assets/images/temple-background.png")

const OVERLAY_HOLD_MS = 500
const OVERLAY_FADE_MS = 1000

const $iframe: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
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
      <View style={themed($container)}>
        <iframe
          src={TEMPLE_URL}
          title="Temple of Inanna's Light"
          style={{ ...$iframe, backgroundColor: theme.colors.background }}
        />
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <Animated.View style={[$overlay, { opacity: overlayOpacity }]}>
          <Image source={overlayImage} resizeMode="cover" style={$overlayImage} />
        </Animated.View>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
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
