// Three readings of the Babylonian "Nibiru / Crossing" tradition.
// Built on Don Cross's astronomy-engine — pure JS, no ephemeris files,
// arc-second accuracy for the inner solar system.
//
//   Reading A (Jupiter meridian transit): location-dependent. The moment
//     Jupiter crosses the observer's local meridian (hour angle = 0).
//     Daily event. Marduk = Jupiter in late Babylonian astronomy.
//
//   Reading B (Jupiter opposition): global. Sun–Earth–Jupiter alignment;
//     occurs ~every 399 days. Jupiter rises at sunset, brightest of the
//     year. The "highest crossing" reading scholars favour.
//
//   Reading C (Mercury solar transit): global. Mercury passes across the
//     Sun's disk — visually the most literal "crossing." Roughly 14 per
//     century, clustered in May and November.

import * as Astronomy from "astronomy-engine"

/** Historical Sumerian observation point at Nippur. Matches the default in
 *  the `@jenova-marie/sumerian-date` package so the calendar-wide default
 *  agrees with what scholarly editions assume. */
export const NIPPUR_OBSERVER = new Astronomy.Observer(32.13, 45.23, 0)

export interface NibiruEvent {
  /** Wall-clock instant of the event, UTC. */
  time: Date
  /** Short label for the row, e.g. "Upper transit" or "Opposition". */
  label: string
  /** Optional per-reading metadata, e.g. Mercury separation in arcminutes. */
  meta?: Record<string, string>
}

const SIDEREAL_DAY_MS = (23 * 3600 + 56 * 60 + 4.0905) * 1000

/** Reading A: next N upper meridian transits of Jupiter for the given
 *  observer. Iterates a sidereal day past each result so we don't bracket
 *  the same culmination twice. */
export function nextJupiterMeridianTransits(
  observer: Astronomy.Observer,
  from: Date,
  count: number,
): NibiruEvent[] {
  const out: NibiruEvent[] = []
  let cursor = from
  for (let i = 0; i < count; i++) {
    const hit = Astronomy.SearchHourAngle(Astronomy.Body.Jupiter, observer, 0, cursor, +1)
    if (!hit) break
    const t = hit.time.date
    out.push({
      time: t,
      label: "Upper meridian transit",
      meta: {
        altitude: `${hit.hor.altitude.toFixed(1)}°`,
        azimuth: `${hit.hor.azimuth.toFixed(0)}°`,
      },
    })
    cursor = new Date(t.getTime() + SIDEREAL_DAY_MS * 0.5)
  }
  return out
}

/** Reading B: next N Jupiter oppositions (Sun–Earth–Jupiter at 180°
 *  heliocentric ecliptic longitude). astronomy-engine returns one event per
 *  call, so we advance one day past each hit to find the next. */
export function nextJupiterOppositions(from: Date, count: number): NibiruEvent[] {
  const out: NibiruEvent[] = []
  let cursor = from
  for (let i = 0; i < count; i++) {
    const hitTime = Astronomy.SearchRelativeLongitude(Astronomy.Body.Jupiter, 180, cursor)
    if (!hitTime) break
    const t = hitTime.date
    if (out.length > 0 && t <= out[out.length - 1].time) break
    out.push({
      time: t,
      label: "Opposition",
      meta: {
        note: "Sun–Earth–Jupiter aligned · brightest of the year",
      },
    })
    cursor = new Date(t.getTime() + 86400000) // +1 day
  }
  return out
}

/** Reading C: next N Mercury solar transits. SearchTransit / NextTransit
 *  already filter to actual disk crossings (separation < Sun radius); the
 *  `separation` value tells us central vs grazing. */
export function nextMercurySolarTransits(from: Date, count: number): NibiruEvent[] {
  const out: NibiruEvent[] = []
  let info: Astronomy.TransitInfo | null = null
  for (let i = 0; i < count; i++) {
    info = info
      ? Astronomy.NextTransit(Astronomy.Body.Mercury, info.finish)
      : Astronomy.SearchTransit(Astronomy.Body.Mercury, from)
    if (!info) break
    const sep = info.separation
    out.push({
      time: info.peak.date,
      label: "Solar transit",
      meta: {
        separation: `${sep.toFixed(1)}'`,
        kind: sep < 6 ? "central transit" : sep < 12 ? "near-central" : "grazing transit",
        duration: `${Math.round((info.finish.date.getTime() - info.start.date.getTime()) / 60000)} min`,
      },
    })
  }
  return out
}
