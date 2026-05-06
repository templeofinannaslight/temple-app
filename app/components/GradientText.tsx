import { FC } from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import MaskedView from "@react-native-masked-view/masked-view"

import { translate } from "@/i18n/translate"

import { Text, TextProps } from "./Text"

// Mirrors the temple-www homepage hero title gradient:
// linear-gradient(to right, #c30a68, #f472b6, #7dd3fc, #26619c)
export const GRADIENT_TITLE_COLORS: readonly [string, string, string, string] = [
  "#c30a68",
  "#f472b6",
  "#7dd3fc",
  "#26619c",
]

export interface GradientTextProps extends Pick<TextProps, "tx" | "text" | "txOptions"> {
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * Native variant — uses MaskedView + LinearGradient to apply the homepage's
 * pink → blue gradient across the glyphs of a text run. The web variant
 * (`GradientText.web.tsx`) achieves the same effect via CSS `background-clip`.
 */
export const GradientText: FC<GradientTextProps> = function GradientText({
  tx,
  text,
  txOptions,
  style,
  containerStyle,
}) {
  const resolved = tx ? translate(tx, txOptions) : (text ?? "")

  return (
    <MaskedView
      style={containerStyle}
      maskElement={
        <View style={$maskWrap}>
          <Text style={style}>{resolved}</Text>
        </View>
      }
    >
      <LinearGradient colors={GRADIENT_TITLE_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[style, $invisible]}>{resolved}</Text>
      </LinearGradient>
    </MaskedView>
  )
}

const $maskWrap: ViewStyle = {
  backgroundColor: "transparent",
}

const $invisible: TextStyle = {
  opacity: 0,
}
