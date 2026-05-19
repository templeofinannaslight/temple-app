import { FC, useMemo, useRef, useState } from "react"
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native"
import type { KeyboardAwareScrollViewRef } from "react-native-keyboard-controller"
import { LinearGradient } from "expo-linear-gradient"
import { sumerianDate } from "@jenova-marie/sumerian-date"
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Polygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg"

import { Screen } from "@/components/Screen"
import { StarField } from "@/components/StarField"
import { Text } from "@/components/Text"
import {
  CalendarMonth,
  LONG_YEAR_POSITIONS,
  LunarPhase,
  LUNAR_PHASES,
  MONTH_NAME_TO_INDEX,
  MONTHS,
} from "@/data/calendar"
import { typeScale, typography } from "@/theme/typography"
import {
  dayOfMonthFor,
  firstQuarterJDE,
  fullMoonJDE,
  jdeToDate,
  kFromNewMoonJDE,
  lastQuarterJDE,
  newMoonJDE,
} from "@/utils/moonPhase"

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const MONTH_ABBRS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) => `${d.getUTCDate()} ${MONTH_ABBRS[d.getUTCMonth()]}`
  return `${fmt(start)} \u2013 ${fmt(end)}`
}

function formatDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTH_ABBRS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// ═══════════════════════════════════════════════════════════
// SUMERIAN DATE HOOK
// ═══════════════════════════════════════════════════════════

function useSumerianCalendar() {
  return useMemo(() => {
    try {
      const sd = sumerianDate()
      const sy = sd.sumerianYear
      const currentMonthIndex = MONTH_NAME_TO_INDEX[sd.monthName] ?? -1

      const monthDates = new Map<number, { startDate: Date; endDate: Date; lengthDays: number }>()
      let currentNewMoonJDE: number | null = null
      let currentMonthStartDate: Date | null = null
      for (const m of sy.months) {
        const idx = MONTH_NAME_TO_INDEX[m.name]
        if (idx !== undefined) {
          monthDates.set(idx, {
            startDate: m.startDate,
            endDate: m.endDate,
            lengthDays: m.lengthDays,
          })
        }
        if (m.name === sd.monthName) {
          currentNewMoonJDE = m.newMoonJDE
          currentMonthStartDate = m.startDate
        }
      }

      return {
        today: sd,
        year: sy,
        currentMonthIndex,
        dayOfMonth: sd.dayOfMonth,
        monthLengthDays: sd.monthLengthDays,
        observances: sd.observances,
        cyclePosition: sd.cyclePosition,
        isIntercalaryYear: sd.isIntercalaryYear,
        isIntercalaryMonth: sd.isIntercalaryMonth,
        monthDates,
        currentNewMoonJDE,
        currentMonthStartDate,
        vernalEquinoxDate: sy.vernalEquinoxDate,
        yearStart: sy.yearStart,
        yearEnd: sy.yearEnd,
      }
    } catch {
      return null
    }
  }, [])
}

type CalendarData = NonNullable<ReturnType<typeof useSumerianCalendar>>

// ═══════════════════════════════════════════════════════════
// TODAY BANNER
// ═══════════════════════════════════════════════════════════

const TodayBanner: FC<{ cal: CalendarData }> = ({ cal }) => {
  const currentMonth = MONTHS[cal.currentMonthIndex]
  const progressPct = (cal.dayOfMonth / cal.monthLengthDays) * 100
  const nextLongYear =
    LONG_YEAR_POSITIONS.find((p) => p > cal.cyclePosition) ?? LONG_YEAR_POSITIONS[0]
  const yearsUntilLong =
    nextLongYear > cal.cyclePosition
      ? nextLongYear - cal.cyclePosition
      : 19 - cal.cyclePosition + nextLongYear

  return (
    <View style={styles.bannerContainer}>
      {currentMonth && <Text style={styles.bannerCuneiform} text={cal.today.monthCuneiform} />}
      <Text
        style={styles.bannerDayTitle}
        text={`Day ${cal.dayOfMonth} of ${cal.today.monthName}`}
      />
      <Text style={styles.bannerDateStr} text={cal.today.toString()} />

      <View style={styles.bannerProgressOuter}>
        <LinearGradient
          colors={["#C9A84C88", "#C9A84C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bannerProgressInner, { width: `${progressPct}%` } as ViewStyle]}
        />
      </View>
      <Text
        style={styles.bannerProgressText}
        text={`Day ${cal.dayOfMonth} of ${cal.monthLengthDays} \u00B7 ${cal.monthLengthDays - cal.dayOfMonth} days remain`}
      />

      {cal.observances.length > 0 && (
        <View style={styles.bannerObsRow}>
          {cal.observances.map((obs: { name: string; description: string }, i: number) => (
            <View key={i} style={styles.bannerObsPill}>
              <Text style={styles.bannerObsText} text={`\u2726 ${obs.name}`} />
            </View>
          ))}
        </View>
      )}

      <Text
        style={styles.bannerCycleText}
        text={`Year ${cal.cyclePosition} of 19 in the Metonic Cycle${cal.isIntercalaryYear ? " \u00B7 Long Year (13 months)" : ""}`}
      />
      <Text
        style={styles.bannerYearStart}
        text={`Sacred year began ${formatDate(cal.yearStart)}${!cal.isIntercalaryYear ? ` \u00B7 Next long year in ${yearsUntilLong}` : ""}`}
      />
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// MONTH WHEEL (SVG)
// ═══════════════════════════════════════════════════════════

const MonthWheel: FC<{
  selected: number | null
  onSelect: (i: number | null) => void
  cal: CalendarData | null
  wheelSize: number
}> = ({ selected, onSelect, cal, wheelSize }) => {
  const radius = wheelSize / 2
  const total = MONTHS.length
  const smallWheel = radius < 200

  return (
    <Svg
      width={wheelSize}
      height={wheelSize}
      viewBox={`${-radius} ${-radius} ${wheelSize} ${wheelSize}`}
    >
      <Circle cx={0} cy={0} r={radius * 0.99} fill="none" stroke="#C9A84C22" strokeWidth={1} />
      <Circle cx={0} cy={0} r={radius * 0.37} fill="none" stroke="#C9A84C22" strokeWidth={1} />

      {MONTHS.map((m, i) => {
        const isSelected = selected === i
        const isCurrent = cal ? i === cal.currentMonthIndex : false

        const angle = (i / total) * 360 - 90
        const segAngle = 360 / total
        const midAngle = angle + segAngle / 2
        const midRad = (midAngle * Math.PI) / 180

        const innerR = radius * 0.38
        const outerR = radius * 0.98

        const a1 = (angle * Math.PI) / 180
        const a2 = ((angle + segAngle) * Math.PI) / 180

        const x1o = Math.cos(a1) * outerR
        const y1o = Math.sin(a1) * outerR
        const x2o = Math.cos(a2) * outerR
        const y2o = Math.sin(a2) * outerR
        const x1i = Math.cos(a1) * innerR
        const y1i = Math.sin(a1) * innerR
        const x2i = Math.cos(a2) * innerR
        const y2i = Math.sin(a2) * innerR

        const largeArc = segAngle > 180 ? 1 : 0
        const pathD = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1i} ${y1i}`

        const fillOpacity = isSelected ? "" : isCurrent ? "88" : "55"
        const fillColor = isSelected ? m.color : `${m.color}${fillOpacity}`
        const strokeColor = isSelected ? "#F5E6C8" : isCurrent ? "#F5E6C866" : "#F5E6C833"
        const strokeW = isSelected ? 2 : isCurrent ? 1.5 : 0.5

        const labelR = radius * 0.72
        const lx = Math.cos(midRad) * labelR
        const ly = Math.sin(midRad) * labelR

        const numR = radius * 0.92
        const nx = Math.cos(midRad) * numR
        const ny = Math.sin(midRad) * numR

        const textRotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle

        const labelFill = isSelected ? "#1a1424" : "#F5E6C8"
        const labelFontSize = smallWheel ? 10 : 13
        const labelWeight = isSelected ? "700" : isCurrent ? "600" : "400"

        const approxLabel = m.num <= 12 ? m.approx : "\u2727"

        return (
          <G key={m.num} onPress={() => onSelect(isSelected ? null : i)}>
            <Path d={pathD} fill={fillColor} stroke={strokeColor} strokeWidth={strokeW} />
            <SvgText
              x={lx}
              y={ly}
              textAnchor="middle"
              alignmentBaseline="central"
              fill={labelFill}
              fontSize={labelFontSize}
              fontFamily="cormorantSemiBold"
              fontWeight={labelWeight}
              rotation={textRotation}
              originX={lx}
              originY={ly}
            >
              {m.akkadian}
            </SvgText>
            <SvgText
              x={nx}
              y={ny}
              textAnchor="middle"
              alignmentBaseline="central"
              fill="#F5E6C8"
              fontSize={smallWheel ? 8 : 10}
              fontFamily="cormorantRegular"
              opacity={0.6}
              rotation={textRotation}
              originX={nx}
              originY={ny}
            >
              {approxLabel}
            </SvgText>
          </G>
        )
      })}

      <Circle cx={0} cy={0} r={radius * 0.34} fill="#1c152a" />

      <Defs>
        <RadialGradient id="centerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor="#C9A84C" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={0} cy={0} r={radius * 0.34} fill="url(#centerGlow)" />

      <G x={-radius * 0.12} y={-radius * 0.12}>
        <Polygon points={eightPointedStarPoints(radius * 0.12)} fill="#C9A84C" opacity={0.8} />
      </G>

      {cal && selected === null ? (
        <G>
          <SvgText
            x={0}
            y={radius * 0.18}
            textAnchor="middle"
            alignmentBaseline="central"
            fill="#C9A84C"
            fontSize={smallWheel ? 11 : 14}
            fontFamily="cormorantSemiBold"
            fontWeight="600"
            opacity={0.9}
          >
            {`DAY ${cal.dayOfMonth}`}
          </SvgText>
          <SvgText
            x={0}
            y={radius * 0.18 + (smallWheel ? 14 : 18)}
            textAnchor="middle"
            alignmentBaseline="central"
            fill="#F5E6C8"
            fontSize={smallWheel ? 8 : 10}
            fontFamily="cormorantRegular"
            opacity={0.6}
          >
            {cal.today.monthName.toUpperCase()}
          </SvgText>
        </G>
      ) : (
        <G>
          <SvgText
            x={0}
            y={radius * 0.2}
            textAnchor="middle"
            alignmentBaseline="central"
            fill="#F5E6C8"
            fontSize={smallWheel ? 9 : 12}
            fontFamily="cormorantRegular"
            opacity={0.6}
          >
            INANNA
          </SvgText>
          <SvgText
            x={0}
            y={radius * 0.2 + (smallWheel ? 13 : 17)}
            textAnchor="middle"
            alignmentBaseline="central"
            fill="#F5E6C8"
            fontSize={smallWheel ? 7 : 9}
            fontFamily="cormorantRegular"
            opacity={0.4}
          >
            QUEEN OF HEAVEN
          </SvgText>
        </G>
      )}
    </Svg>
  )
}

/** Generate inline polygon points for the center eight-pointed star. */
function eightPointedStarPoints(r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 - 90) * (Math.PI / 180)
    pts.push(`${r + Math.cos(angle) * r},${r + Math.sin(angle) * r}`)
    const inner = (i * 45 + 22.5 - 90) * (Math.PI / 180)
    pts.push(`${r + Math.cos(inner) * (r * 0.38)},${r + Math.sin(inner) * (r * 0.38)}`)
  }
  return pts.join(" ")
}

// ═══════════════════════════════════════════════════════════
// MONTH DETAIL
// ═══════════════════════════════════════════════════════════

const MonthDetail: FC<{
  month: CalendarMonth
  onClose: () => void
  cal: CalendarData | null
}> = ({ month, onClose, cal }) => {
  const monthIndex = MONTHS.indexOf(month)
  const isCurrent = cal ? monthIndex === cal.currentMonthIndex : false
  const dates = cal?.monthDates.get(monthIndex)
  const dateRange = dates ? formatDateRange(dates.startDate, dates.endDate) : month.approx
  const isIntercalaryNotObserved = month.num === 13 && cal != null && !cal.isIntercalaryYear

  return (
    <View style={styles.detailContainer}>
      <Pressable onPress={onClose} style={styles.detailClose}>
        <Text style={styles.detailCloseText} text={"\u00D7"} />
      </Pressable>

      <View style={styles.detailHeaderRow}>
        <View
          style={[
            styles.detailColorDot,
            { backgroundColor: month.color, shadowColor: month.color },
          ]}
        />
        <Text style={styles.detailHeaderLabel} text={`Month ${month.num} \u00B7 ${dateRange}`} />
        {isCurrent && (
          <View style={styles.detailNowBadge}>
            <Text style={styles.detailNowText} text="NOW" />
          </View>
        )}
      </View>

      <Text style={styles.detailName} text={month.akkadian} />
      <Text style={styles.detailSumerian} text={`${month.sumerian} \u00B7 ${month.season}`} />

      {isCurrent && cal != null && (
        <View style={styles.detailProgressBox}>
          <View style={styles.detailProgressRow}>
            <Text
              style={styles.detailProgressLabel}
              text={`Day ${cal.dayOfMonth} of ${cal.monthLengthDays}`}
            />
            <Text
              style={styles.detailProgressRemain}
              text={`${cal.monthLengthDays - cal.dayOfMonth} days remain`}
            />
          </View>
          <View style={styles.detailProgressBarOuter}>
            <LinearGradient
              colors={["#C9A84C88", "#C9A84C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.detailProgressBarInner,
                { width: `${(cal.dayOfMonth / cal.monthLengthDays) * 100}%` } as ViewStyle,
              ]}
            />
          </View>
          {dates && (
            <View style={styles.detailProgressDatesRow}>
              <Text
                style={styles.detailProgressDate}
                text={`Began ${formatDate(dates.startDate)}`}
              />
              <Text style={styles.detailProgressDate} text={`Ends ${formatDate(dates.endDate)}`} />
            </View>
          )}
          {cal.observances.length > 0 && (
            <View style={styles.detailObsRow}>
              {cal.observances.map((obs: { name: string; description: string }, i: number) => (
                <View key={i} style={styles.detailObsPill}>
                  <Text style={styles.detailObsText} text={`\u2726 ${obs.name}`} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {isIntercalaryNotObserved && (
        <View style={styles.detailIntercalaryNotice}>
          <Text
            style={styles.detailIntercalaryText}
            text={`Not observed this year \u2014 occurs in years ${LONG_YEAR_POSITIONS.join(", ")} of the Metonic cycle.${cal ? ` Current year is position ${cal.cyclePosition}.` : ""}`}
          />
        </View>
      )}

      <View
        style={[
          styles.detailMythBox,
          { backgroundColor: `${month.color}15`, borderLeftColor: `${month.color}88` },
        ]}
      >
        <Text
          style={[styles.detailMythLabel, { color: month.color }]}
          text={`\u2726 ${month.mythCycle}`}
        />
        <Text style={styles.detailMythDesc} text={month.mythDesc} />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle} text="Festivals & Observances" />
        {month.festivals.map((f, i) => (
          <View key={i} style={styles.detailFestivalRow}>
            <Text style={[styles.detailFestivalBullet, { color: month.color }]} text={"\u2726"} />
            <Text style={styles.detailFestivalText} text={f} />
          </View>
        ))}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle} text="Devotional Practice" />
        <Text style={styles.detailPracticeText} text={month.practices} />
      </View>

      <View style={styles.detailLunarBox}>
        <Text style={styles.detailLunarLabel} text={"\u263D Lunar Note"} />
        <Text style={styles.detailLunarText} text={month.lunarNote} />
      </View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// VIEW TOGGLE
// ═══════════════════════════════════════════════════════════

const ViewToggle: FC<{
  viewMode: string
  onChangeMode: (mode: string) => void
}> = ({ viewMode, onChangeMode }) => {
  return (
    <View style={styles.toggleRow}>
      {(["wheel", "list"] as const).map((mode) => {
        const active = viewMode === mode
        return (
          <Pressable
            key={mode}
            onPress={() => onChangeMode(mode)}
            style={active ? styles.toggleButtonActive : styles.toggleButtonInactive}
          >
            <Text
              style={active ? styles.toggleTextActive : styles.toggleTextInactive}
              text={mode === "wheel" ? "\u263D Wheel" : "\u2630 Months"}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// LIST VIEW
// ═══════════════════════════════════════════════════════════

const MonthListView: FC<{
  selected: number | null
  onSelect: (i: number | null) => void
  cal: CalendarData | null
}> = ({ selected, onSelect, cal }) => {
  return (
    <View style={styles.listContainer}>
      {MONTHS.map((m, i) => {
        const isCurrent = cal ? i === cal.currentMonthIndex : false
        const dates = cal?.monthDates.get(i)
        const dateLabel = dates ? formatDateRange(dates.startDate, dates.endDate) : m.approx
        const isExpanded = selected === i

        const cardBg = isExpanded ? `${m.color}15` : isCurrent ? `${m.color}0a` : "transparent"
        const cardBorder = isExpanded ? `${m.color}44` : isCurrent ? "#C9A84C33" : "#F5E6C811"

        return (
          <Pressable
            key={m.num}
            onPress={() => onSelect(isExpanded ? null : i)}
            style={[
              styles.listCard,
              isCurrent && styles.listCardCurrent,
              { backgroundColor: cardBg, borderColor: cardBorder, borderLeftColor: cardBorder },
              isCurrent && styles.listCardCurrentBorder,
            ]}
          >
            <View style={styles.listCardHeader}>
              <View style={styles.listCardLeft}>
                <View
                  style={[
                    styles.listColorDot,
                    { backgroundColor: m.color, shadowColor: `${m.color}66` },
                  ]}
                />
                <View>
                  <View style={styles.listNameRow}>
                    <Text style={styles.listMonthName} text={m.akkadian} />
                    <Text style={styles.listDateLabel} text={dateLabel} />
                    {isCurrent && <Text style={styles.listNowLabel} text={"\u2726 NOW"} />}
                  </View>
                </View>
              </View>
              <Text style={[styles.listMythLabel, { color: m.color }]} text={m.mythCycle} />
            </View>

            {isExpanded && (
              <View style={styles.listExpandedDetail}>
                <MonthDetail month={m} onClose={() => onSelect(null)} cal={cal} />
              </View>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// LUNAR PHASE BAR
// ═══════════════════════════════════════════════════════════

// Full local-time + timezone formatters for the phase detail card. Constructed
// lazily — Hermes' Intl support varies between builds, and a module-scope
// constructor throw here would torpedo the entire CalendarScreen export.
function formatLongDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d)
  } catch {
    return d.toDateString()
  }
}

function formatLongTime(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d)
  } catch {
    return d.toLocaleTimeString()
  }
}

function formatRelative(moment: Date): string {
  const diffMs = moment.getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  try {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    if (absMs >= 86400000) return rtf.format(Math.round(diffMs / 86400000), "day")
    if (absMs >= 3600000) return rtf.format(Math.round(diffMs / 3600000), "hour")
    return rtf.format(Math.round(diffMs / 60000), "minute")
  } catch {
    if (absMs >= 86400000) {
      const days = Math.round(diffMs / 86400000)
      return days >= 0 ? `in ${days} days` : `${-days} days ago`
    }
    const hours = Math.round(diffMs / 3600000)
    return hours >= 0 ? `in ${hours} hours` : `${-hours} hours ago`
  }
}

/** Illumination at the moment of a named phase. By definition these are exact
 *  fractions of the lunation, not derived from the cosine approximation. */
function phaseIllumination(name: string): number | null {
  if (name === "Full Moon (Ešeš)") return 100
  if (name === "First Quarter" || name === "Last Quarter") return 50
  return null
}

// Lunation phases that have an exact astronomical moment we can solve for.
// New Crescent and Dark Moon are anchored to the Sumerian calendar (Day 1 and
// the last day before the next first-crescent sighting) rather than computed.
const KEY_PHASE_NAMES = ["New Crescent", "First Quarter", "Full Moon (E\u0161e\u0161)", "Waning Crescent", "Dark Moon (Kisiga)"]

/** Compute the actual day-of-month each phase falls on for the lunation
 *  anchored by `newMoonJDE`. Returns the same shape as the static
 *  LUNAR_PHASES catalogue but with `day` values true for THIS month. */
function computeLunarPhases(
  currentNewMoonJDE: number,
  monthStartDate: Date,
  monthLengthDays: number,
): LunarPhase[] {
  const k = kFromNewMoonJDE(currentNewMoonJDE)
  const newMoonDate = jdeToDate(currentNewMoonJDE)
  const fqDate = jdeToDate(firstQuarterJDE(k))
  const fmDate = jdeToDate(fullMoonJDE(k))
  const lqDate = jdeToDate(lastQuarterJDE(k))
  const nextNewMoonDate = jdeToDate(newMoonJDE(k + 1))

  const dayOf = (m: Date) => dayOfMonthFor(m, monthStartDate, monthLengthDays)

  const fqDay = dayOf(fqDate)
  const fmDay = dayOf(fmDate)
  const lqDay = dayOf(lqDate)

  // Mid-bucket estimates for the four between-quarter phases. We use the time
  // midpoint of the adjacent exact phases \u2014 accurate to ~\u00B112 hours because
  // the moon doesn't sweep phase angle at perfectly uniform speed (orbital
  // eccentricity makes it slightly faster near perigee), but plenty good for
  // "when does the bucket peak" UX.
  const midpoint = (a: Date, b: Date) => new Date((a.getTime() + b.getTime()) / 2)
  const waxingCrescentEst = midpoint(newMoonDate, fqDate)
  const waxingGibbousEst = midpoint(fqDate, fmDate)
  const waningGibbousEst = midpoint(fmDate, lqDate)
  const waningCrescentEst = midpoint(lqDate, nextNewMoonDate)

  // Day-of-month for the labels in the grid. Clamped to the month so a long
  // 30-day lunation doesn't push Waning Crescent past Day N.
  const clamp = (d: number) => Math.max(1, Math.min(monthLengthDays, d))
  const between = (a: number, b: number) => clamp(Math.round((a + b) / 2))

  return [
    {
      name: "New Crescent",
      icon: "\uD83C\uDF11",
      day: 1,
      desc: "Month begins \u2014 first crescent sighted at sunset",
      momentEstimate: monthStartDate,
      momentNote:
        "Calendar-defined \u00B7 Day 1 begins at sunset when the first thin crescent becomes visible.",
    },
    {
      name: "Waxing Crescent",
      icon: "\uD83C\uDF12",
      day: between(1, fqDay),
      desc: "Growth, intention-setting",
      momentEstimate: waxingCrescentEst,
      momentNote: "Estimated mid-bucket \u00B7 \u00B112 h.",
    },
    {
      name: "First Quarter",
      icon: "\uD83C\uDF13",
      day: fqDay,
      desc: "E\u0161e\u0161 observed in many cities \u2014 lamentation, reflection",
      moment: fqDate,
    },
    {
      name: "Waxing Gibbous",
      icon: "\uD83C\uDF14",
      day: between(fqDay, fmDay),
      desc: "Building toward the e\u0161e\u0161",
      momentEstimate: waxingGibbousEst,
      momentNote: "Estimated mid-bucket \u00B7 \u00B112 h.",
    },
    {
      name: "Full Moon (E\u0161e\u0161)",
      icon: "\uD83C\uDF15",
      day: fmDay,
      desc: "E\u0161e\u0161 \u2014 Great Offering to all gods of the household",
      moment: fmDate,
    },
    {
      name: "Waning Gibbous",
      icon: "\uD83C\uDF16",
      day: between(fmDay, lqDay),
      desc: "Release, gratitude",
      momentEstimate: waningGibbousEst,
      momentNote: "Estimated mid-bucket \u00B7 \u00B112 h.",
    },
    {
      name: "Last Quarter",
      icon: "\uD83C\uDF17",
      day: lqDay,
      desc: "Turning inward",
      moment: lqDate,
    },
    {
      name: "Waning Crescent",
      icon: "\uD83C\uDF18",
      day: between(lqDay, monthLengthDays),
      desc: "Kisiga approaches \u2014 honor your ancestors",
      momentEstimate: waningCrescentEst,
      momentNote: "Estimated mid-bucket \u00B7 \u00B112 h.",
    },
    {
      name: "Dark Moon (Kisiga)",
      icon: "\u26AB",
      day: monthLengthDays,
      desc: "Kisiga \u2014 funerary libations for the beloved dead",
      momentEstimate: nextNewMoonDate,
      momentNote: `Next conjunction (next month's Day 1): ${formatLongDate(nextNewMoonDate)} at ${formatLongTime(nextNewMoonDate)}.`,
    },
  ]
}

// Detail card for one phase. Tapped from the grid. Surfaces everything we
// know about the moment — local datetime, relative tense, moon age, and
// illumination.
const PhaseDetail: FC<{
  phase: LunarPhase
  cal: CalendarData
  onClose: () => void
}> = ({ phase, cal, onClose }) => {
  const currentNewMoon = cal.currentNewMoonJDE

  // Moon age (days since the new-moon conjunction) at the displayed moment.
  // Computed only for phases with an exact astronomical time — estimates would
  // mislead since the "Waxing Crescent" age is a bucket, not a number.
  const moonAgeDays =
    phase.moment && currentNewMoon
      ? (phase.moment.getTime() / 86400000 + 2440587.5 - currentNewMoon).toFixed(1)
      : null
  const illum = phaseIllumination(phase.name)

  // Exact moment wins; otherwise show the mid-bucket estimate.
  const displayMoment = phase.moment ?? phase.momentEstimate
  const isEstimate = !phase.moment && !!phase.momentEstimate
  const precisionLabel = phase.moment
    ? "Astronomical event · accurate to ±1 minute"
    : isEstimate
      ? phase.momentNote ?? "Estimated"
      : null

  return (
    <View style={styles.phaseDetailCard}>
      <View style={styles.phaseDetailHeader}>
        <Text style={styles.phaseDetailIcon} text={phase.icon} />
        <View style={styles.phaseDetailHeaderText}>
          <Text style={styles.phaseDetailName} text={phase.name} />
          <Text
            style={styles.phaseDetailSubtitle}
            text={`Day ${phase.day} of ${cal.today.monthName}`}
          />
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={styles.phaseDetailClose}>
          <Text style={styles.phaseDetailCloseText} text="✕" />
        </Pressable>
      </View>

      {displayMoment && (
        <View style={styles.phaseDetailBlock}>
          <Text style={styles.phaseDetailDate} text={formatLongDate(displayMoment)} />
          <Text
            style={styles.phaseDetailTime}
            text={`${isEstimate ? "~" : ""}${formatLongTime(displayMoment)}`}
          />
          <Text style={styles.phaseDetailRelative} text={formatRelative(displayMoment)} />
          {precisionLabel && (
            <Text style={styles.phaseDetailPrecision} text={precisionLabel} />
          )}
        </View>
      )}

      {(moonAgeDays || illum !== null) && (
        <View style={styles.phaseDetailStatsRow}>
          {moonAgeDays && (
            <Text style={styles.phaseDetailStat} text={`Moon age · ${moonAgeDays} days`} />
          )}
          {illum !== null && (
            <Text style={styles.phaseDetailStat} text={`Illumination · ${illum}%`} />
          )}
        </View>
      )}

      <Text style={styles.phaseDetailDesc} text={phase.desc} />
    </View>
  )
}

const LunarPhaseBar: FC<{
  cal: CalendarData | null
  scrollViewToTop: (viewRef: View | null) => void
}> = ({ cal, scrollViewToTop }) => {
  const phases: LunarPhase[] = useMemo(() => {
    if (!cal?.currentNewMoonJDE || !cal.currentMonthStartDate) return LUNAR_PHASES
    return computeLunarPhases(
      cal.currentNewMoonJDE,
      cal.currentMonthStartDate,
      cal.monthLengthDays,
    )
  }, [cal])

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const phaseRefs = useRef<(View | null)[]>([])

  const handleSelect = (i: number) => {
    if (selectedIndex === i) {
      setSelectedIndex(null)
      return
    }
    setSelectedIndex(i)
    // Wait one frame for layout, then bring the tapped row to the top so the
    // newly revealed detail card is in view.
    requestAnimationFrame(() => scrollViewToTop(phaseRefs.current[i]))
  }

  const monthLabel = cal ? `${cal.today.monthName} this lunation` : "this lunation"

  return (
    <View style={styles.lunarSection}>
      <View style={styles.lunarDivider} />
      <Text style={styles.lunarTitle} text={"☽ Lunar Phases This Month ☾"} />
      <Text style={styles.lunarSubtitle} text={`Astronomically computed for ${monthLabel}`} />
      <Text
        style={styles.lunarHint}
        text="Tap a phase for the exact moment, illumination, and location options"
      />
      <View style={styles.lunarPhaseRow}>
        {phases.map((p, i) => {
          const isSelected = selectedIndex === i
          return (
            <Pressable
              key={i}
              ref={(el) => {
                phaseRefs.current[i] = el as unknown as View | null
              }}
              onPress={() => handleSelect(i)}
              style={[styles.lunarPhaseItem, isSelected && styles.lunarPhaseItemSelected]}
            >
              <Text style={styles.lunarPhaseIcon} text={p.icon} />
              <Text style={styles.lunarPhaseName} text={p.name} />
              <Text style={styles.lunarPhaseDay} text={`Day ${p.day}`} />
            </Pressable>
          )
        })}
      </View>

      {selectedIndex !== null && cal && (
        <PhaseDetail
          phase={phases[selectedIndex]}
          cal={cal}
          onClose={() => setSelectedIndex(null)}
        />
      )}

      <View style={styles.lunarKeyGrid}>
        {phases.filter((p) => KEY_PHASE_NAMES.includes(p.name)).map((p, i) => (
          <View key={i} style={styles.lunarKeyCard}>
            <View style={styles.lunarKeyHeader}>
              <Text style={styles.lunarKeyIcon} text={p.icon} />
              <Text style={styles.lunarKeyName} text={p.name} />
            </View>
            <Text style={styles.lunarKeyDesc} text={p.desc} />
          </View>
        ))}
      </View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// METONIC CYCLE INFO
// ═══════════════════════════════════════════════════════════

const MetonicCycleInfo: FC<{ cal: CalendarData }> = ({ cal }) => {
  const yearInfoText = cal.isIntercalaryYear
    ? `This is a long year \u2014 13 months.${
        cal.cyclePosition === 17
          ? " Diri Kin \u{1202D}Inanna is inserted after month 6."
          : " Diri \u0160ekinku is appended after month 12."
      }`
    : "This is a standard year \u2014 12 months."

  return (
    <View style={styles.metonicContainer}>
      <Text style={styles.metonicTitle} text={"\u2726 The 19-Year Metonic Cycle \u2726"} />
      <View style={styles.metonicDotsRow}>
        {Array.from({ length: 19 }, (_, i) => {
          const pos = i + 1
          const isLong = LONG_YEAR_POSITIONS.includes(pos)
          const isCurrentPos = pos === cal.cyclePosition
          return (
            <View
              key={pos}
              style={[
                styles.metonicDot,
                isCurrentPos
                  ? styles.metonicDotCurrent
                  : isLong
                    ? styles.metonicDotLong
                    : styles.metonicDotNormal,
              ]}
            >
              <Text
                style={[
                  styles.metonicDotText,
                  isCurrentPos
                    ? styles.metonicDotTextCurrent
                    : isLong
                      ? styles.metonicDotTextLong
                      : styles.metonicDotTextNormal,
                ]}
                text={String(pos)}
              />
            </View>
          )
        })}
      </View>
      <Text style={styles.metonicInfo} text={yearInfoText} />
      <Text
        style={styles.metonicDetails}
        text={`Long years (13 months) at positions ${LONG_YEAR_POSITIONS.join(", ")} \u00B7 Vernal equinox: ${formatDate(cal.vernalEquinoxDate)}`}
      />
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// VENUS CYCLE NOTE
// ═══════════════════════════════════════════════════════════

const VenusCycleNote: FC = () => {
  return (
    <View style={styles.venusContainer}>
      <Text
        style={styles.venusTitle}
        text={"\u2726 Kin \u{1202D}Inanna \u00B7 The Sixth Month \u2726"}
      />
      <Text
        style={styles.venusBody}
        text={
          "Month 6 \u2014 Kin \u{1202D}Inanna, \u201CThe Labours of \u{1202D}Inanna\u201D \u2014 is the heart of this calendar for devotees of \u{1202D}Inanna. Her entire sacred life cycle is re-enacted across its thirty days: adornment, procession, the Great E\u0161e\u0161 offering at the full moon, the symbolic Descent in the second half, her return and ceremonial bathing around day 21, and the recitation of the myths of her power through day 26. Watch for this month as the axis of the devotional year. \u{1202D}Inanna is also Venus \u2014 watch the western sky at dusk and the eastern sky at dawn to know where she walks."
        }
      />
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════

export const CalendarScreen: FC = function CalendarScreen() {
  const [viewMode, setViewMode] = useState("wheel")
  const { width } = useWindowDimensions()
  const cal = useSumerianCalendar()
  const [selected, setSelected] = useState<number | null>(
    cal && cal.currentMonthIndex >= 0 ? cal.currentMonthIndex : null,
  )

  const wheelSize = Math.min(width - 40, 560)

  // Imperative scroll bridge so LunarPhaseBar can scroll a tapped row to top.
  // We track currentScrollY via onScroll because measureInWindow() returns a
  // SCREEN-space y while scrollTo() wants a CONTENT-space y; we need their
  // delta to convert.
  const scrollRef = useRef<KeyboardAwareScrollViewRef | null>(null)
  const currentScrollY = useRef(0)
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentScrollY.current = e.nativeEvent.contentOffset.y
  }
  const scrollViewToTop = (viewRef: View | null) => {
    if (!viewRef || !scrollRef.current) return
    viewRef.measureInWindow((_x, screenY) => {
      const TOP_PADDING = 80 // leave room under the status bar
      const target = currentScrollY.current + (screenY - TOP_PADDING)
      scrollRef.current?.scrollTo({ x: 0, y: Math.max(0, target), animated: true })
    })
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top"]}
      backgroundColor="#1c152a"
      scrollRef={scrollRef}
      ScrollViewProps={{ onScroll, scrollEventThrottle: 16 }}
    >
      <LinearGradient
        colors={["#1c152a", "#162438", "#251930"]}
        style={styles.gradientBg}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <StarField count={60} />
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle} text={"\u2726 A Liturgical Calendar of \u2726"} />
            <Text style={styles.headerTitle} text={"The Sacred Year of \u{1202D}Inanna"} />
            <Text
              style={styles.headerTagline}
              text={"Thirteen Lunations \u00B7 From Barazagar to \u0160ekinku"}
            />
          </View>

          {cal && <TodayBanner cal={cal} />}

          <ViewToggle viewMode={viewMode} onChangeMode={setViewMode} />

          {viewMode === "wheel" ? (
            <>
              <View style={styles.wheelCenter}>
                <MonthWheel
                  selected={selected}
                  onSelect={setSelected}
                  cal={cal}
                  wheelSize={wheelSize}
                />
              </View>

              {selected === null && (
                <Text
                  style={styles.wheelHint}
                  text="Select a month on the wheel to explore its mysteries"
                />
              )}

              {selected !== null && (
                <MonthDetail month={MONTHS[selected]} onClose={() => setSelected(null)} cal={cal} />
              )}
            </>
          ) : (
            <MonthListView selected={selected} onSelect={setSelected} cal={cal} />
          )}

          <LunarPhaseBar cal={cal} scrollViewToTop={scrollViewToTop} />

          {cal && <MetonicCycleInfo cal={cal} />}

          <VenusCycleNote />

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text
              style={styles.footerText}
              text={
                "Nippur lunisolar calendar \u00B7 Sourced from Mark E. Cohen, Cultic Calendars of the Ancient Near East (CDL Press, 1993)"
              }
            />
            <Text
              style={styles.footerBlessing}
              text={"\u{1202D}Inanna-zami \u2014 \u201C\u{1202D}Inanna be praised\u201D"}
            />
          </View>
        </View>
      </LinearGradient>
    </Screen>
  )
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#251930ee",
    borderColor: "#C9A84C44",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    maxWidth: 640,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: "100%",
  },
  bannerCuneiform: {
    color: "#F5E6C855",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  bannerCycleText: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 1.5,
  },
  bannerDateStr: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    fontStyle: "italic",
    marginBottom: 14,
  },
  bannerDayTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.light,
    fontSize: typeScale.display - 4,
    letterSpacing: 1.5,
    lineHeight: (typeScale.display - 4) * 1.6,
    marginBottom: 2,
    overflow: "visible",
  },
  bannerObsPill: {
    backgroundColor: "#C9A84C18",
    borderColor: "#C9A84C44",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  bannerObsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 14,
  },
  bannerObsText: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 1,
  },
  bannerProgressInner: {
    borderRadius: 3,
    height: "100%",
  },
  bannerProgressOuter: {
    backgroundColor: "#C9A84C18",
    borderRadius: 3,
    height: 5,
    marginBottom: 6,
    maxWidth: 300,
    overflow: "hidden",
    width: "100%",
  },
  bannerProgressText: {
    color: "#F5E6C855",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    marginBottom: 14,
  },
  bannerYearStart: {
    color: "#F5E6C844",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    marginTop: 2,
  },
  contentWrapper: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 32,
    position: "relative",
    zIndex: 1,
  },
  detailClose: {
    position: "absolute",
    right: 16,
    top: 12,
    zIndex: 1,
  },
  detailCloseText: {
    color: "#F5E6C8",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.title - 2,
    opacity: 0.7,
  },
  detailColorDot: {
    borderRadius: 5,
    height: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    width: 10,
  },
  detailContainer: {
    alignSelf: "center",
    backgroundColor: "#251930ee",
    borderColor: "#C9A84C44",
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 600,
    paddingHorizontal: 32,
    paddingVertical: 28,
    position: "relative",
    width: "100%",
  },
  detailFestivalBullet: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    left: 0,
    position: "absolute",
    top: 7,
  },
  detailFestivalRow: {
    flexDirection: "row",
    paddingLeft: 20,
    paddingVertical: 4,
  },
  detailFestivalText: {
    color: "#F5E6C8cc",
    flex: 1,
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
  },
  detailHeaderLabel: {
    color: "#F5E6C899",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  detailHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  detailIntercalaryNotice: {
    alignItems: "center",
    backgroundColor: "#F5E6C808",
    borderColor: "#F5E6C815",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailIntercalaryText: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    fontStyle: "italic",
    textAlign: "center",
  },
  detailLunarBox: {
    backgroundColor: "#F5E6C808",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLunarLabel: {
    color: "#F5E6C877",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailLunarText: {
    color: "#F5E6C8aa",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
    fontStyle: "italic",
    lineHeight: typeScale.body * 1.6,
  },
  detailMythBox: {
    borderLeftWidth: 3,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  detailMythDesc: {
    color: "#F5E6C8cc",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
    lineHeight: typeScale.body * 1.7,
  },
  detailMythLabel: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  detailName: {
    color: "#F5E6C8",
    fontFamily: typography.primary.light,
    fontSize: typeScale.display - 4,
    letterSpacing: 1.5,
    lineHeight: (typeScale.display - 4) * 1.6,
    marginBottom: 2,
    overflow: "visible",
  },
  detailNowBadge: {
    backgroundColor: "#C9A84C22",
    borderColor: "#C9A84C55",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  detailNowText: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 2,
  },
  detailObsPill: {
    backgroundColor: "#C9A84C18",
    borderColor: "#C9A84C44",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  detailObsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  detailObsText: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
  },
  detailPracticeText: {
    color: "#F5E6C8cc",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
    lineHeight: typeScale.body * 1.7,
  },
  detailProgressBarInner: {
    borderRadius: 3,
    height: "100%",
  },
  detailProgressBarOuter: {
    backgroundColor: "#C9A84C18",
    borderRadius: 3,
    height: 4,
    overflow: "hidden",
  },
  detailProgressBox: {
    backgroundColor: "#C9A84C0a",
    borderColor: "#C9A84C22",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailProgressDate: {
    color: "#F5E6C844",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
  },
  detailProgressDatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  detailProgressLabel: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  detailProgressRemain: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
  },
  detailProgressRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailSection: {
    marginBottom: 18,
  },
  detailSectionTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  detailSumerian: {
    color: "#F5E6C877",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
    fontStyle: "italic",
    marginBottom: 20,
  },
  footerBlessing: {
    color: "#F5E6C833",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    fontStyle: "italic",
    letterSpacing: 2,
    marginTop: 4,
    textAlign: "center",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    color: "#F5E6C833",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    fontStyle: "italic",
    letterSpacing: 2,
    textAlign: "center",
  },
  gradientBg: {
    flex: 1,
    minHeight: "100%",
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 8,
    overflow: "visible",
  },
  headerSubtitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 5,
    marginBottom: 8,
    opacity: 0.7,
    textTransform: "uppercase",
  },
  headerTagline: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    fontStyle: "italic",
    letterSpacing: 2,
  },
  headerTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.light,
    fontSize: typeScale.display + 4,
    letterSpacing: 3,
    lineHeight: (typeScale.display + 4) * 1.6,
    marginBottom: 4,
    overflow: "visible",
    textAlign: "center",
  },
  listCard: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  listCardCurrent: {
    borderLeftWidth: 3,
  },
  listCardCurrentBorder: {
    borderLeftColor: "#C9A84C",
  },
  listCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listCardLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  listColorDot: {
    borderRadius: 4,
    height: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    width: 8,
  },
  listContainer: {
    alignSelf: "center",
    maxWidth: 640,
    width: "100%",
  },
  listDateLabel: {
    color: "#F5E6C877",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    marginLeft: 10,
  },
  listExpandedDetail: {
    marginTop: 16,
  },
  listMonthName: {
    color: "#F5E6C8",
    fontFamily: typography.primary.semiBold,
    fontSize: typeScale.subtitle,
    letterSpacing: 1,
  },
  listMythLabel: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
    opacity: 0.9,
  },
  listNameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listNowLabel: {
    color: "#C9A84C",
    fontFamily: typography.primary.semiBold,
    fontSize: typeScale.label,
    letterSpacing: 2,
    marginLeft: 8,
  },
  lunarDivider: {
    backgroundColor: "#C9A84C22",
    height: 1,
    marginBottom: 20,
  },
  lunarKeyCard: {
    backgroundColor: "#F5E6C808",
    borderRadius: 8,
    flexBasis: "48%",
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lunarKeyDesc: {
    color: "#F5E6C899",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    marginLeft: 22,
    marginTop: 2,
  },
  lunarKeyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  lunarKeyHeader: {
    alignItems: "center",
    flexDirection: "row",
  },
  lunarKeyIcon: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    marginRight: 6,
  },
  lunarKeyName: {
    color: "#C9A84C",
    fontFamily: typography.primary.semiBold,
    fontSize: typeScale.caption,
  },
  lunarPhaseDay: {
    color: "#F5E6C877",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    textAlign: "center",
  },
  lunarHint: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.small,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
    textAlign: "center",
  },
  lunarPhaseIcon: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.subtitle,
  },
  phaseDetailBlock: {
    alignItems: "center",
    gap: 2,
    marginBottom: 12,
  },
  phaseDetailCard: {
    backgroundColor: "#1a1424cc",
    borderColor: "#C9A84C44",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 4,
    padding: 20,
  },
  phaseDetailClose: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  phaseDetailCloseText: {
    color: "#F5E6C888",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.subtitle,
  },
  phaseDetailDate: {
    color: "#F5E6C8",
    fontFamily: typography.primary.semiBold,
    fontSize: typeScale.body,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  phaseDetailDesc: {
    color: "#F5E6C8aa",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 0.3,
    lineHeight: 22,
    textAlign: "center",
  },
  phaseDetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  phaseDetailHeaderText: {
    flex: 1,
  },
  phaseDetailIcon: {
    fontFamily: typography.primary.normal,
    fontSize: typeScale.display,
  },
  phaseDetailName: {
    color: "#C9A84C",
    fontFamily: typography.primary.semiBold,
    fontSize: typeScale.subtitle,
    letterSpacing: 1,
  },
  phaseDetailPrecision: {
    color: "#C9A84C99",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.small,
    fontStyle: "italic",
    letterSpacing: 0.3,
    marginTop: 6,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  phaseDetailRelative: {
    color: "#F5E6C888",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  phaseDetailStat: {
    color: "#F5E6C8cc",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 0.3,
  },
  phaseDetailStatsRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    marginBottom: 12,
  },
  phaseDetailSubtitle: {
    color: "#F5E6C888",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  phaseDetailTime: {
    color: "#F5E6C8",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.body,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  lunarPhaseItem: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  lunarPhaseItemSelected: {
    backgroundColor: "#C9A84C18",
    borderColor: "#C9A84C66",
  },
  lunarPhaseName: {
    color: "#F5E6C8cc",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 1,
    textAlign: "center",
  },
  lunarPhaseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 16,
  },
  lunarSection: {
    alignSelf: "center",
    marginTop: 32,
    maxWidth: 640,
    paddingTop: 20,
    width: "100%",
  },
  lunarSubtitle: {
    color: "#F5E6C844",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    fontStyle: "italic",
    marginBottom: 12,
    textAlign: "center",
  },
  lunarTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    letterSpacing: 4,
    marginBottom: 4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  metonicContainer: {
    alignSelf: "center",
    borderColor: "#C9A84C22",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 28,
    maxWidth: 640,
    paddingHorizontal: 24,
    paddingVertical: 18,
    width: "100%",
  },
  metonicDetails: {
    color: "#F5E6C855",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.label,
    marginTop: 4,
    textAlign: "center",
  },
  metonicDot: {
    alignItems: "center",
    borderRadius: 11,
    justifyContent: "center",
  },
  metonicDotCurrent: {
    backgroundColor: "#C9A84C",
    borderColor: "#F5E6C8",
    borderWidth: 2,
    height: 22,
    shadowColor: "rgba(201,168,76,0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    width: 22,
  },
  metonicDotLong: {
    backgroundColor: "#C9A84C33",
    borderColor: "#C9A84C55",
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  metonicDotNormal: {
    backgroundColor: "#F5E6C815",
    borderColor: "#F5E6C815",
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  metonicDotText: {
    fontFamily: typography.primary.normal,
    fontSize: 8,
  },
  metonicDotTextCurrent: {
    color: "#1a1424",
    fontFamily: typography.primary.bold,
  },
  metonicDotTextLong: {
    color: "#C9A84C",
  },
  metonicDotTextNormal: {
    color: "#F5E6C844",
  },
  metonicDotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 12,
  },
  metonicInfo: {
    color: "#F5E6C8bb",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    lineHeight: typeScale.caption * 1.7,
    textAlign: "center",
  },
  metonicTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
  },
  toggleButtonActive: {
    backgroundColor: "#C9A84C22",
    borderColor: "#C9A84C55",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  toggleButtonInactive: {
    backgroundColor: "transparent",
    borderColor: "#F5E6C822",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 20,
  },
  toggleTextActive: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  toggleTextInactive: {
    color: "#F5E6C866",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  venusBody: {
    color: "#F5E6C8bb",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    lineHeight: typeScale.caption * 1.7,
  },
  venusContainer: {
    alignSelf: "center",
    borderColor: "#C9A84C22",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 28,
    maxWidth: 640,
    paddingHorizontal: 24,
    paddingVertical: 18,
    width: "100%",
  },
  venusTitle: {
    color: "#C9A84C",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    letterSpacing: 4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  wheelCenter: {
    alignItems: "center",
    marginBottom: 16,
  },
  wheelHint: {
    color: "#F5E6C844",
    fontFamily: typography.primary.normal,
    fontSize: typeScale.caption,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
})
