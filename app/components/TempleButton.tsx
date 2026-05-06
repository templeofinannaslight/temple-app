import { FC } from "react"
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Text, TextProps } from "./Text"

type Variant = "primary" | "secondary"

export interface TempleButtonProps extends Omit<PressableProps, "style" | "children"> {
  tx?: TextProps["tx"]
  text?: TextProps["text"]
  txOptions?: TextProps["txOptions"]
  variant?: Variant
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

/**
 * Brand button matching the Temple of Inanna's Light homepage button styling.
 * Primary: brand fill + neon border + pink glow. Secondary: translucent accent
 * fill + dark accent border + blue glow.
 */
export const TempleButton: FC<TempleButtonProps> = function TempleButton({
  tx,
  text,
  txOptions,
  variant = "primary",
  style: $styleOverride,
  textStyle: $textStyleOverride,
  disabled,
  ...rest
}) {
  const { themed } = useAppTheme()
  const baseStyle = variant === "primary" ? $primary : $secondary
  const baseTextStyle = variant === "primary" ? $primaryText : $secondaryText

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        themed(baseStyle),
        pressed && $pressed,
        disabled && $disabled,
        $styleOverride,
      ]}
    >
      <Text
        tx={tx}
        text={text}
        txOptions={txOptions}
        style={[themed(baseTextStyle), $textStyleOverride]}
      />
    </Pressable>
  )
}

const $base: ThemedStyle<ViewStyle> = () => ({
  borderWidth: 2,
  borderRadius: 8,
  paddingVertical: 14,
  paddingHorizontal: 32,
  alignItems: "center",
  justifyContent: "center",
})

const $primary: ThemedStyle<ViewStyle> = (theme) => ({
  ...$base(theme),
  backgroundColor: theme.colors.palette.templeBrand,
  borderColor: theme.colors.palette.templeNeon,
  shadowColor: theme.colors.palette.templeNeon,
  shadowOpacity: 0.45,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
})

const $secondary: ThemedStyle<ViewStyle> = (theme) => ({
  ...$base(theme),
  backgroundColor: `${theme.colors.palette.templeAccent}40`,
  borderColor: theme.colors.palette.templeAccentDark,
  shadowColor: theme.colors.palette.templeAccent,
  shadowOpacity: 0.35,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 0 },
  elevation: 4,
})

const $primaryText: ThemedStyle<TextStyle> = () => ({
  color: "#ffffff",
  fontSize: 17,
  fontWeight: "600",
  letterSpacing: 0.3,
})

const $secondaryText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.templeGray100,
  fontSize: 17,
  fontWeight: "600",
  letterSpacing: 0.3,
})

const $pressed: ViewStyle = {
  opacity: 0.85,
  transform: [{ scale: 0.98 }],
}

const $disabled: ViewStyle = {
  opacity: 0.5,
}
