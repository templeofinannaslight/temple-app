import { FC } from "react"
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const bannerSource = require("@assets/images/temple-banner.png")

const BANNER_HEIGHT = 110
const BANNER_WIDTH = 360

/**
 * Mirrors the temple-www <Header>: translucent accent fill backed by a
 * gaussian backdrop blur (matching `bg-accent/40 backdrop-blur-md`), neon
 * bottom border, pink glow drop shadow, banner image centered. Respects
 * the top safe area inset so the banner doesn't render under the notch.
 */
export const TempleHeader: FC = function TempleHeader() {
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[themed($container), { paddingTop: insets.top + 4 }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={themed($accentTint)} />
      <Image source={bannerSource} style={$banner} resizeMode="contain" />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 0,
  paddingBottom: 4,
  overflow: "hidden",
  borderBottomWidth: 2,
  borderBottomColor: theme.colors.palette.templeNeon,
  shadowColor: theme.colors.palette.templeNeon,
  shadowOpacity: 0.45,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 2 },
  elevation: 8,
})

// Accent tint layered on top of the blur — matches `bg-accent/40` opacity
// from temple-www. The blur softens the brick beneath; this washes it in
// the temple's signature blue.
const $accentTint: ThemedStyle<ViewStyle> = (theme) => ({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: `${theme.colors.palette.templeAccent}66`,
})

const $banner: ImageStyle = {
  height: BANNER_HEIGHT,
  width: BANNER_WIDTH,
}
