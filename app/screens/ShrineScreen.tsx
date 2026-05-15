import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, LayoutRectangle, Platform, Pressable, StyleSheet, View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"

import { Text } from "@/components/Text"
import { typography, typeScale } from "@/theme/typography"
import { load, save } from "@/utils/storage"

import { loadSkiaForWeb } from "./shrine/loadSkiaWeb"
import {
  CANDLE_POSITIONS,
  TOTAL_CANDLES,
  getCandleBurnDuration,
  getCandleType,
} from "./shrine/shrineBloomShader"
import { IMAGE_ASPECT, ShrineSkiaCanvas } from "./shrine/ShrineSkiaCanvas"

/** Persisted as { [candleId]: litAtTimestamp } */
type CandleLedger = Record<number, number>

const STORAGE_KEY = "shrine:candleLedger"

/** Remove expired candles from ledger, return cleaned copy */
function pruneExpired(ledger: CandleLedger, now: number): CandleLedger {
  const pruned: CandleLedger = {}
  for (const [idStr, litAt] of Object.entries(ledger)) {
    const id = Number(idStr)
    const type = getCandleType(id)
    if (!type) continue
    if (now - litAt < getCandleBurnDuration(type)) {
      pruned[id] = litAt
    }
  }
  return pruned
}

/** Find the soonest expiration time from active candles */
function nextExpiry(ledger: CandleLedger, now: number): number | null {
  let soonest: number | null = null
  for (const [idStr, litAt] of Object.entries(ledger)) {
    const type = getCandleType(Number(idStr))
    if (!type) continue
    const expiresAt = litAt + getCandleBurnDuration(type)
    if (expiresAt > now && (soonest === null || expiresAt < soonest)) {
      soonest = expiresAt
    }
  }
  return soonest
}

const ShrineScreenImpl: FC = function ShrineScreenImpl() {
  // Load persisted candle ledger (id → litAt timestamp)
  const [ledger, setLedger] = useState<CandleLedger>(() => {
    // Migrate from old format (number[]) if present
    const oldSaved = load<number[]>("shrine:litCandles")
    if (oldSaved && Array.isArray(oldSaved)) {
      // Old data had no timestamps — treat as "just lit"
      const migrated: CandleLedger = {}
      const now = Date.now()
      for (const id of oldSaved) migrated[id] = now
      save(STORAGE_KEY, migrated)
      save("shrine:litCandles", null) // clear old key
      return migrated
    }
    const saved = load<CandleLedger>(STORAGE_KEY)
    if (!saved) return {}
    return pruneExpired(saved, Date.now())
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive the Set<number> of currently-lit candle IDs for the canvas
  const litCandles = useMemo(() => new Set(Object.keys(ledger).map(Number)), [ledger])
  const litCount = litCandles.size

  // Schedule a timer to prune the next candle that burns out
  const scheduleNextPrune = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const now = Date.now()
    const expiry = nextExpiry(ledger, now)
    if (expiry === null) return
    const delay = Math.max(expiry - now + 100, 100) // +100ms buffer
    timerRef.current = setTimeout(() => {
      const pruned = pruneExpired(ledger, Date.now())
      setLedger(pruned)
      save(STORAGE_KEY, pruned)
    }, delay)
  }, [ledger])

  useEffect(() => {
    scheduleNextPrune()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [scheduleNextPrune])

  // Image layout measurement
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)

  const imageLayout = useMemo(() => {
    if (!containerSize) return null
    const { width, height } = containerSize
    const containerAspect = width / height
    const imgW = containerAspect > IMAGE_ASPECT ? height * IMAGE_ASPECT : width
    const imgH = containerAspect > IMAGE_ASPECT ? height : width / IMAGE_ASPECT
    const imgLeft = (width - imgW) / 2
    const imgTop = (height - imgH) / 2
    return { left: imgLeft, top: imgTop, width: imgW, height: imgH }
  }, [containerSize])

  const handleLayout = (event: { nativeEvent: { layout: LayoutRectangle } }) => {
    const { width, height } = event.nativeEvent.layout
    setContainerSize({ width, height })
  }

  const lightCandle = (id: number) => {
    if (ledger[id] !== undefined) return
    const next = { ...ledger, [id]: Date.now() }
    setLedger(next)
    save(STORAGE_KEY, next)
  }

  const doReset = () => {
    setLedger({})
    save(STORAGE_KEY, {})
  }

  const handleReset = () => {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Return the shrine to darkness?")) doReset()
    } else {
      Alert.alert("Extinguish All", "Return the shrine to darkness?", [
        { text: "Cancel", style: "cancel" },
        { text: "Extinguish", style: "destructive", onPress: doReset },
      ])
    }
  }

  const skiaImageRect = imageLayout
    ? {
        x: imageLayout.left,
        y: imageLayout.top,
        width: imageLayout.width,
        height: imageLayout.height,
      }
    : null

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.title} text="The Shrine" />
        </View>

        {litCount > 0 && (
          <Pressable
            onPress={handleReset}
            hitSlop={16}
            style={({ pressed }) => [styles.headerResetBtn, pressed && styles.headerBtnPressed]}
          >
            <Text style={styles.resetText} text="Extinguish" />
          </Pressable>
        )}
      </View>

      {/* Image container */}
      <View style={styles.imageContainer} onLayout={handleLayout}>
        {/* Skia Canvas — dark base + radial bloom revealing lit image */}
        {containerSize && (
          <ShrineSkiaCanvas
            litCandles={litCandles}
            imageRect={skiaImageRect}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        )}

        {/* Candle tap targets */}
        {imageLayout &&
          CANDLE_POSITIONS.map((candle) =>
            litCandles.has(candle.id) ? null : (
              <Pressable
                key={candle.id}
                onPress={() => lightCandle(candle.id)}
                hitSlop={8}
                style={[
                  styles.candleTap,
                  {
                    left: imageLayout.left + (candle.x / 100) * imageLayout.width - 16,
                    top: imageLayout.top + (candle.y / 100) * imageLayout.height - 16,
                  },
                ]}
              />
            ),
          )}

        {/* Completion overlay */}
        {litCount === TOTAL_CANDLES && (
          <Animated.View entering={FadeIn.duration(2000)} style={styles.completionOverlay}>
            <Text style={styles.completionText} text={"✦ The Shrine is Ablaze ✦"} />
          </Animated.View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text
          style={styles.footerText}
          text={
            litCount === 0
              ? "Tap a candle to light it"
              : litCount === TOTAL_CANDLES
                ? "All candles burn for \u{1202D}Inanna"
                : `${litCount} of ${TOTAL_CANDLES} candles lit`
          }
        />
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {CANDLE_POSITIONS.map((c) => (
            <View
              key={c.id}
              style={[styles.progressDot, litCandles.has(c.id) && styles.progressDotLit]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  candleTap: {
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    position: "absolute",
    width: 32,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  completionText: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderColor: "#C9A84C44",
    borderRadius: 20,
    borderWidth: 1,
    color: "#C9A84C",
    fontFamily: typography.primary.light,
    fontSize: typeScale.title,
    letterSpacing: 3,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 12,
  },
  footerText: {
    color: "#F5E6C877",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerBtnPressed: {
    opacity: 0.6,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerResetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: "absolute",
    right: 16,
    top: 16,
  },
  imageContainer: {
    flex: 1,
    overflow: "hidden",
  },
  progressDot: {
    backgroundColor: "#F5E6C822",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  progressDotLit: {
    backgroundColor: "#C9A84C",
  },
  progressRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },
  resetText: {
    color: "#F5E6C855",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 1,
  },
  root: {
    backgroundColor: "#0a0a0a",
    flex: 1,
  },
  title: {
    color: "#C9A84C",
    fontFamily: typography.primary.light,
    fontSize: typeScale.subtitle,
    letterSpacing: 4,
  },
})

// On web, CanvasKit (Skia's WASM build) must be loaded explicitly before any
// useImage / Canvas hook will work — otherwise everything silently returns null.
// Native gets Skia via linked native module so no bootstrap needed. The web
// loader lives in loadSkiaWeb.web.ts; the native shim is a no-op. Splitting
// across platform-specific files keeps canvaskit-wasm (which require("fs"))
// out of the native bundle graph that Metro analyzes statically.
export const ShrineScreen: FC = function ShrineScreen() {
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== "web")

  useEffect(() => {
    if (Platform.OS !== "web") return
    let cancelled = false
    loadSkiaForWeb().then(() => {
      if (!cancelled) setSkiaReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!skiaReady) return null
  return <ShrineScreenImpl />
}
