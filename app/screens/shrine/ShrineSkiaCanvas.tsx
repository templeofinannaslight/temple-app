import { FC, useMemo } from "react"
import { StyleSheet } from "react-native"
import {
  Canvas,
  Circle,
  Group,
  Image,
  Mask,
  RadialGradient,
  RoundedRect,
  useImage,
  vec,
} from "@shopify/react-native-skia"

import {
  CANDLE_POSITIONS,
  NAMEPLATE_RECT,
  PORTRAIT_RECT,
  TOTAL_CANDLES,
  getCandleReach,
} from "./shrineBloomShader"

const shrineDark = require("@assets/images/shrine.dark.png")
const shrineLite = require("@assets/images/shrine.lite.png")

const IMAGE_W = 1024
const IMAGE_ASPECT = IMAGE_W / 1536

// Approximate cubic falloff (1-t)³ with gradient color stops
// t=0 center (white), t=1 edge (black)
const BLOOM_COLORS = ["#FFFFFF", "#575757", "#202020", "#070707", "#000000"]
const BLOOM_STOPS = [0, 0.3, 0.5, 0.7, 1.0]

interface ImageRect {
  x: number
  y: number
  width: number
  height: number
}

interface ShrineSkiaCanvasProps {
  litCandles: Set<number>
  imageRect: ImageRect | null
  containerWidth: number
  containerHeight: number
}

export const ShrineSkiaCanvas: FC<ShrineSkiaCanvasProps> = ({
  litCandles,
  imageRect,
  containerWidth,
  containerHeight,
}) => {
  const darkImg = useImage(shrineDark)
  const litImg = useImage(shrineLite)

  const litCount = litCandles.size

  // Compute screen-space positions for lit candles only
  const litCandleData = useMemo(() => {
    if (!imageRect) return []
    const scale = imageRect.width / IMAGE_W
    return CANDLE_POSITIONS.filter((c) => litCandles.has(c.id)).map((c) => ({
      id: c.id,
      cx: imageRect.x + (c.x / 100) * imageRect.width,
      cy: imageRect.y + (c.y / 100) * imageRect.height,
      r: getCandleReach(c.type) * scale,
    }))
  }, [litCandles, imageRect])

  // Portrait and star brightness scales with how many candles are lit (0→43)
  const revealBrightness = litCount / TOTAL_CANDLES
  const brightnessHex = Math.round(revealBrightness * 255)
    .toString(16)
    .padStart(2, "0")
  const revealColor = `#${brightnessHex}${brightnessHex}${brightnessHex}`

  // Portrait rect in screen space
  const portraitScreen = useMemo(() => {
    if (!imageRect) return null
    return {
      x: imageRect.x + (PORTRAIT_RECT.x / 100) * imageRect.width,
      y: imageRect.y + (PORTRAIT_RECT.y / 100) * imageRect.height,
      w: (PORTRAIT_RECT.w / 100) * imageRect.width,
      h: (PORTRAIT_RECT.h / 100) * imageRect.height,
    }
  }, [imageRect])

  // Nameplate rect in screen space
  const nameplateScreen = useMemo(() => {
    if (!imageRect) return null
    return {
      x: imageRect.x + (NAMEPLATE_RECT.x / 100) * imageRect.width,
      y: imageRect.y + (NAMEPLATE_RECT.y / 100) * imageRect.height,
      w: (NAMEPLATE_RECT.w / 100) * imageRect.width,
      h: (NAMEPLATE_RECT.h / 100) * imageRect.height,
    }
  }, [imageRect])

  if (!darkImg || !litImg || !imageRect) return null

  const rect = imageRect

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {/* Dark shrine — always visible as base */}
      <Image image={darkImg} fit="fill" rect={rect} />

      {/* Lit shrine revealed through luminance mask */}
      {litCount > 0 && (
        <Mask
          mode="luminance"
          mask={
            <Group blendMode="plus">
              {/* Candle blooms */}
              {litCandleData.map((candle) => (
                <Circle key={candle.id} cx={candle.cx} cy={candle.cy} r={candle.r}>
                  <RadialGradient
                    c={vec(candle.cx, candle.cy)}
                    r={candle.r}
                    colors={BLOOM_COLORS}
                    positions={BLOOM_STOPS}
                  />
                </Circle>
              ))}

              {/* Portrait — brightness scales with total candles lit */}
              {portraitScreen && (
                <RoundedRect
                  x={portraitScreen.x}
                  y={portraitScreen.y}
                  width={portraitScreen.w}
                  height={portraitScreen.h}
                  r={4}
                  color={revealColor}
                />
              )}

              {/* Nameplate — brightness scales with total candles lit */}
              {nameplateScreen && (
                <RoundedRect
                  x={nameplateScreen.x}
                  y={nameplateScreen.y}
                  width={nameplateScreen.w}
                  height={nameplateScreen.h}
                  r={2}
                  color={revealColor}
                />
              )}
            </Group>
          }
        >
          <Image image={litImg} fit="fill" rect={rect} />
        </Mask>
      )}
    </Canvas>
  )
}

export { IMAGE_ASPECT }

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
})
