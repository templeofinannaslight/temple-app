import { CSSProperties, FC } from "react"
import { StyleProp, TextStyle, ViewStyle } from "react-native"

import { translate } from "@/i18n/translate"

import { Text, TextProps } from "./Text"

// Mirrors the temple-www homepage hero title gradient:
// linear-gradient(to right, #c30a68, #f472b6, #7dd3fc, #26619c)
export const GRADIENT_TITLE_COLORS = ["#c30a68", "#f472b6", "#7dd3fc", "#26619c"] as const

const GRADIENT_CSS = `linear-gradient(to right, ${GRADIENT_TITLE_COLORS.join(", ")})`

export interface GradientTextProps extends Pick<TextProps, "tx" | "text" | "txOptions"> {
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * Web variant — uses CSS `background-clip: text` to paint the gradient onto
 * the glyphs (matching the homepage's `bg-clip-text text-transparent` Tailwind
 * pattern). The native variant uses MaskedView + LinearGradient.
 */
export const GradientText: FC<GradientTextProps> = function GradientText({
  tx,
  text,
  txOptions,
  style,
}) {
  const resolved = tx ? translate(tx, txOptions) : (text ?? "")
  const gradientStyle = { ...$gradientFill } as CSSProperties

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Text style={[style, gradientStyle as TextStyle]}>{resolved}</Text>
  )
}

const $gradientFill: CSSProperties = {
  backgroundImage: GRADIENT_CSS,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
}
