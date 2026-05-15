import { FC, useEffect, useMemo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

interface StarFieldProps {
  count?: number
  style?: ViewStyle
}

interface StarData {
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

const Star: FC<StarData> = ({ x, y, size, opacity, delay }) => {
  const animatedOpacity = useSharedValue(opacity * 0.5)

  useEffect(() => {
    animatedOpacity.value = withDelay(
      delay * 1000,
      withRepeat(withTiming(opacity, { duration: (2.5 + delay) * 1000 }), -1, true),
    )
  }, [animatedOpacity, opacity, delay])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.star,
        {
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  )
}

export const StarField: FC<StarFieldProps> = ({ count = 50, style }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.15,
        delay: Math.random() * 5,
      })),
    [count],
  )

  return (
    <View style={[StyleSheet.absoluteFill, styles.field, style]}>
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    pointerEvents: "none",
  },
  star: {
    backgroundColor: "#F5E6C8",
    position: "absolute",
  },
})
