import { useCallback, useState } from "react"

import { load, save } from "./storage"
import { deviceTimezone, tzToCity } from "./timezoneCity"

export interface UserLocation {
  lat: number
  lon: number
  /** Display label e.g. "Nippur (32.13°N, 45.23°E)" or "78701 · Austin, TX". */
  label: string
  /** Provenance so the UI can label the source ("auto from timezone" vs ZIP
   *  vs the Sumerian-default Nippur fallback). */
  source: "nippur" | "zip" | "timezone"
}

type LookupStatus = "idle" | "loading" | "not-found" | "error"

const STORAGE_KEY = "temple:userLocation:v2"

export const NIPPUR: UserLocation = {
  lat: 32.13,
  lon: 45.23,
  label: "Nippur (32.13°N, 45.23°E)",
  source: "nippur",
}

/** Auto-pick a default observation point from the device's IANA timezone.
 *  Falls back to Nippur when the tz is missing or unmapped. The Sumerian
 *  thematic default is therefore preserved for unknown locales while users
 *  in major cities get a sensibly close starting point. */
function autoDefault(): UserLocation {
  const tz = deviceTimezone()
  const city = tzToCity(tz)
  if (!city || !tz) return NIPPUR
  return {
    lat: city.lat,
    lon: city.lon,
    label: `${city.city} · auto from ${tz}`,
    source: "timezone",
  }
}

interface ZippopotamResponse {
  "post code": string
  country: string
  "country abbreviation": string
  places: Array<{
    "place name": string
    state?: string
    "state abbreviation"?: string
    latitude: string
    longitude: string
  }>
}

function formatHemis(lat: number, lon: number): string {
  const latH = lat >= 0 ? "N" : "S"
  const lonH = lon >= 0 ? "E" : "W"
  return `${Math.abs(lat).toFixed(2)}°${latH}, ${Math.abs(lon).toFixed(2)}°${lonH}`
}

/** ZIP-only location hook. Never auto-prompts; lookup only fires when the
 *  consumer calls `setFromZip()`. Cached in MMKV between launches. */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(() => {
    return load<UserLocation>(STORAGE_KEY) ?? autoDefault()
  })
  const [status, setStatus] = useState<LookupStatus>("idle")

  const setFromZip = useCallback(
    async (country: string, zip: string): Promise<UserLocation | null> => {
      const code = zip.trim()
      const cc = country.trim().toLowerCase()
      if (!code) {
        setStatus("not-found")
        return null
      }
      setStatus("loading")
      try {
        const res = await fetch(`https://api.zippopotam.us/${cc}/${encodeURIComponent(code)}`)
        if (!res.ok) {
          setStatus("not-found")
          return null
        }
        const body = (await res.json()) as ZippopotamResponse
        const place = body.places?.[0]
        if (!place) {
          setStatus("not-found")
          return null
        }
        const lat = parseFloat(place.latitude)
        const lon = parseFloat(place.longitude)
        if (Number.isNaN(lat) || Number.isNaN(lon)) {
          setStatus("error")
          return null
        }
        const cityBit = place["state abbreviation"]
          ? `${place["place name"]}, ${place["state abbreviation"]}`
          : place["place name"]
        const fix: UserLocation = {
          lat,
          lon,
          label: `${code} · ${cityBit} (${formatHemis(lat, lon)})`,
          source: "zip",
        }
        save(STORAGE_KEY, fix)
        setLocation(fix)
        setStatus("idle")
        return fix
      } catch {
        setStatus("error")
        return null
      }
    },
    [],
  )

  /** Wipe the persisted choice and recompute the auto default. After this
   *  the user sees their timezone-derived city again (or Nippur if the tz
   *  isn't in our table). */
  const reset = useCallback(() => {
    save(STORAGE_KEY, null)
    setLocation(autoDefault())
    setStatus("idle")
  }, [])

  return { location, status, setFromZip, reset }
}
