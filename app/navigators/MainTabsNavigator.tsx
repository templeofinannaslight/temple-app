import { FC } from "react"
import { StyleSheet, Text as RNText } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { CalendarScreen } from "@/screens/CalendarScreen"
import { ShrineScreen } from "@/screens/ShrineScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { typography, typeScale } from "@/theme/typography"

import type { MainTabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<MainTabParamList>()

const ACTIVE = "#C9A84C"
const INACTIVE = "#F5E6C855"
const BG = "#000000"
const BORDER = "#F5E6C822"

const TabGlyph: FC<{ glyph: string; focused: boolean }> = ({ glyph, focused }) => (
  <RNText style={[styles.glyph, { color: focused ? ACTIVE : INACTIVE }]}>{glyph}</RNText>
)

export const MainTabsNavigator: FC = function MainTabsNavigator() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: [
          styles.tabBar,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tab.Screen
        name="Home"
        component={WelcomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabGlyph glyph="⌂" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Shrine"
        component={ShrineScreen}
        options={{
          tabBarLabel: "Shrine",
          tabBarIcon: ({ focused }) => <TabGlyph glyph="✦" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ focused }) => <TabGlyph glyph="☽" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  glyph: {
    fontSize: 20,
    lineHeight: 22,
  },
  item: {
    paddingTop: 6,
  },
  label: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label - 2,
    letterSpacing: 2,
  },
  tabBar: {
    backgroundColor: BG,
    borderTopColor: BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})
