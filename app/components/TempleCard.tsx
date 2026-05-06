import { FC, ReactNode } from "react"
import { StyleProp, View, ViewProps, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type Variant = "accent" | "neon"

export interface TempleCardProps extends Omit<ViewProps, "style" | "children"> {
  variant?: Variant
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

/**
 * Card matching the Temple of Inanna's Light homepage card pattern:
 * translucent accent fill, themed border, soft glow shadow. The `accent`
 * variant uses a dark accent border and blue glow; `neon` uses a hot-pink
 * border and pink glow.
 */
export const TempleCard: FC<TempleCardProps> = function TempleCard({
  variant = "accent",
  style: $styleOverride,
  children,
  ...rest
}) {
  const { themed } = useAppTheme()
  const $card = variant === "neon" ? $neon : $accent

  return (
    <View {...rest} style={[themed($card), $styleOverride]}>
      {children}
    </View>
  )
}

const $base: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: `${theme.colors.palette.templeAccent}66`,
  borderWidth: 2,
  borderRadius: 16,
  padding: 24,
})

const $accent: ThemedStyle<ViewStyle> = (theme) => ({
  ...$base(theme),
  borderColor: theme.colors.palette.templeAccentDark,
  shadowColor: theme.colors.palette.templeAccent,
  shadowOpacity: 0.45,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 0 },
  elevation: 5,
})

const $neon: ThemedStyle<ViewStyle> = (theme) => ({
  ...$base(theme),
  borderColor: theme.colors.palette.templeNeon,
  shadowColor: theme.colors.palette.templeNeon,
  shadowOpacity: 0.4,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
})
