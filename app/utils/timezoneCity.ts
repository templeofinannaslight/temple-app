// IANA timezone → representative city + lat/lon. Used to pick a sensible
// default observation point when the user hasn't entered a postal code. Each
// IANA tz is *defined* as a representative city, so the mapping is natural
// and stable (we just round to two decimals — city-center accuracy).
//
// Coverage: ~120 entries spanning North & South America, Europe, Africa,
// Middle East, Asia, Oceania, plus the more common "ETC/" + offset names
// that some devices emit. Anything not in the table falls back to null and
// the caller uses Nippur.

export interface TimezoneCity {
  /** Display name shown to the user, e.g. "Chicago, US". */
  city: string
  lat: number
  lon: number
}

const TIMEZONE_CITY: Record<string, TimezoneCity> = {
  // North America
  "America/Adak": { city: "Adak, US", lat: 51.88, lon: -176.66 },
  "America/Anchorage": { city: "Anchorage, US", lat: 61.22, lon: -149.9 },
  "America/Boise": { city: "Boise, US", lat: 43.62, lon: -116.21 },
  "America/Chicago": { city: "Chicago, US", lat: 41.88, lon: -87.63 },
  "America/Denver": { city: "Denver, US", lat: 39.74, lon: -104.99 },
  "America/Detroit": { city: "Detroit, US", lat: 42.33, lon: -83.05 },
  "America/Edmonton": { city: "Edmonton, CA", lat: 53.55, lon: -113.49 },
  "America/Halifax": { city: "Halifax, CA", lat: 44.65, lon: -63.58 },
  "America/Indiana/Indianapolis": { city: "Indianapolis, US", lat: 39.77, lon: -86.15 },
  "America/Juneau": { city: "Juneau, US", lat: 58.3, lon: -134.42 },
  "America/Kentucky/Louisville": { city: "Louisville, US", lat: 38.25, lon: -85.76 },
  "America/Los_Angeles": { city: "Los Angeles, US", lat: 34.05, lon: -118.24 },
  "America/Mexico_City": { city: "Mexico City, MX", lat: 19.43, lon: -99.13 },
  "America/Monterrey": { city: "Monterrey, MX", lat: 25.69, lon: -100.32 },
  "America/Montreal": { city: "Montreal, CA", lat: 45.5, lon: -73.57 },
  "America/New_York": { city: "New York, US", lat: 40.71, lon: -74.01 },
  "America/Phoenix": { city: "Phoenix, US", lat: 33.45, lon: -112.07 },
  "America/Regina": { city: "Regina, CA", lat: 50.45, lon: -104.62 },
  "America/St_Johns": { city: "St. John's, CA", lat: 47.56, lon: -52.71 },
  "America/Toronto": { city: "Toronto, CA", lat: 43.65, lon: -79.38 },
  "America/Vancouver": { city: "Vancouver, CA", lat: 49.28, lon: -123.12 },
  "America/Winnipeg": { city: "Winnipeg, CA", lat: 49.9, lon: -97.14 },
  "Pacific/Honolulu": { city: "Honolulu, US", lat: 21.31, lon: -157.86 },
  // Central / South America
  "America/Argentina/Buenos_Aires": { city: "Buenos Aires, AR", lat: -34.6, lon: -58.38 },
  "America/Bogota": { city: "Bogotá, CO", lat: 4.71, lon: -74.07 },
  "America/Caracas": { city: "Caracas, VE", lat: 10.49, lon: -66.88 },
  "America/Costa_Rica": { city: "San José, CR", lat: 9.93, lon: -84.08 },
  "America/Guatemala": { city: "Guatemala City, GT", lat: 14.63, lon: -90.51 },
  "America/Havana": { city: "Havana, CU", lat: 23.13, lon: -82.36 },
  "America/Lima": { city: "Lima, PE", lat: -12.05, lon: -77.04 },
  "America/Managua": { city: "Managua, NI", lat: 12.11, lon: -86.27 },
  "America/Panama": { city: "Panama City, PA", lat: 8.98, lon: -79.52 },
  "America/Santiago": { city: "Santiago, CL", lat: -33.45, lon: -70.67 },
  "America/Sao_Paulo": { city: "São Paulo, BR", lat: -23.55, lon: -46.63 },
  // Europe
  "Atlantic/Reykjavik": { city: "Reykjavík, IS", lat: 64.15, lon: -21.94 },
  "Europe/Amsterdam": { city: "Amsterdam, NL", lat: 52.37, lon: 4.9 },
  "Europe/Athens": { city: "Athens, GR", lat: 37.98, lon: 23.73 },
  "Europe/Belgrade": { city: "Belgrade, RS", lat: 44.79, lon: 20.45 },
  "Europe/Berlin": { city: "Berlin, DE", lat: 52.52, lon: 13.4 },
  "Europe/Brussels": { city: "Brussels, BE", lat: 50.85, lon: 4.35 },
  "Europe/Bucharest": { city: "Bucharest, RO", lat: 44.43, lon: 26.1 },
  "Europe/Budapest": { city: "Budapest, HU", lat: 47.5, lon: 19.04 },
  "Europe/Copenhagen": { city: "Copenhagen, DK", lat: 55.68, lon: 12.57 },
  "Europe/Dublin": { city: "Dublin, IE", lat: 53.35, lon: -6.26 },
  "Europe/Helsinki": { city: "Helsinki, FI", lat: 60.17, lon: 24.94 },
  "Europe/Istanbul": { city: "Istanbul, TR", lat: 41.01, lon: 28.98 },
  "Europe/Kiev": { city: "Kyiv, UA", lat: 50.45, lon: 30.52 },
  "Europe/Kyiv": { city: "Kyiv, UA", lat: 50.45, lon: 30.52 },
  "Europe/Lisbon": { city: "Lisbon, PT", lat: 38.72, lon: -9.14 },
  "Europe/London": { city: "London, GB", lat: 51.51, lon: -0.13 },
  "Europe/Madrid": { city: "Madrid, ES", lat: 40.42, lon: -3.7 },
  "Europe/Moscow": { city: "Moscow, RU", lat: 55.76, lon: 37.62 },
  "Europe/Oslo": { city: "Oslo, NO", lat: 59.91, lon: 10.75 },
  "Europe/Paris": { city: "Paris, FR", lat: 48.86, lon: 2.35 },
  "Europe/Prague": { city: "Prague, CZ", lat: 50.08, lon: 14.44 },
  "Europe/Rome": { city: "Rome, IT", lat: 41.9, lon: 12.5 },
  "Europe/Sofia": { city: "Sofia, BG", lat: 42.7, lon: 23.32 },
  "Europe/Stockholm": { city: "Stockholm, SE", lat: 59.33, lon: 18.07 },
  "Europe/Vienna": { city: "Vienna, AT", lat: 48.21, lon: 16.37 },
  "Europe/Warsaw": { city: "Warsaw, PL", lat: 52.23, lon: 21.01 },
  "Europe/Zurich": { city: "Zürich, CH", lat: 47.38, lon: 8.54 },
  // Africa
  "Africa/Cairo": { city: "Cairo, EG", lat: 30.04, lon: 31.24 },
  "Africa/Casablanca": { city: "Casablanca, MA", lat: 33.57, lon: -7.59 },
  "Africa/Johannesburg": { city: "Johannesburg, ZA", lat: -26.2, lon: 28.05 },
  "Africa/Lagos": { city: "Lagos, NG", lat: 6.52, lon: 3.38 },
  "Africa/Nairobi": { city: "Nairobi, KE", lat: -1.29, lon: 36.82 },
  "Africa/Tunis": { city: "Tunis, TN", lat: 36.81, lon: 10.18 },
  // Middle East / South-West Asia
  "Asia/Baghdad": { city: "Baghdad, IQ", lat: 33.31, lon: 44.36 },
  "Asia/Beirut": { city: "Beirut, LB", lat: 33.89, lon: 35.5 },
  "Asia/Damascus": { city: "Damascus, SY", lat: 33.51, lon: 36.29 },
  "Asia/Dubai": { city: "Dubai, AE", lat: 25.2, lon: 55.27 },
  "Asia/Jerusalem": { city: "Jerusalem, IL", lat: 31.78, lon: 35.22 },
  "Asia/Kuwait": { city: "Kuwait City, KW", lat: 29.38, lon: 47.99 },
  "Asia/Qatar": { city: "Doha, QA", lat: 25.29, lon: 51.53 },
  "Asia/Riyadh": { city: "Riyadh, SA", lat: 24.71, lon: 46.68 },
  "Asia/Tehran": { city: "Tehran, IR", lat: 35.69, lon: 51.39 },
  // South Asia
  "Asia/Karachi": { city: "Karachi, PK", lat: 24.86, lon: 67.0 },
  "Asia/Kolkata": { city: "Kolkata, IN", lat: 22.57, lon: 88.36 },
  "Asia/Colombo": { city: "Colombo, LK", lat: 6.93, lon: 79.85 },
  "Asia/Dhaka": { city: "Dhaka, BD", lat: 23.81, lon: 90.41 },
  "Asia/Kathmandu": { city: "Kathmandu, NP", lat: 27.72, lon: 85.32 },
  // South-East Asia
  "Asia/Bangkok": { city: "Bangkok, TH", lat: 13.76, lon: 100.5 },
  "Asia/Ho_Chi_Minh": { city: "Ho Chi Minh, VN", lat: 10.76, lon: 106.66 },
  "Asia/Jakarta": { city: "Jakarta, ID", lat: -6.21, lon: 106.85 },
  "Asia/Kuala_Lumpur": { city: "Kuala Lumpur, MY", lat: 3.14, lon: 101.69 },
  "Asia/Manila": { city: "Manila, PH", lat: 14.6, lon: 120.98 },
  "Asia/Singapore": { city: "Singapore, SG", lat: 1.35, lon: 103.82 },
  // East Asia
  "Asia/Hong_Kong": { city: "Hong Kong, HK", lat: 22.32, lon: 114.17 },
  "Asia/Seoul": { city: "Seoul, KR", lat: 37.57, lon: 126.98 },
  "Asia/Shanghai": { city: "Shanghai, CN", lat: 31.23, lon: 121.47 },
  "Asia/Taipei": { city: "Taipei, TW", lat: 25.03, lon: 121.57 },
  "Asia/Tokyo": { city: "Tokyo, JP", lat: 35.68, lon: 139.69 },
  // Oceania
  "Australia/Adelaide": { city: "Adelaide, AU", lat: -34.93, lon: 138.6 },
  "Australia/Brisbane": { city: "Brisbane, AU", lat: -27.47, lon: 153.03 },
  "Australia/Darwin": { city: "Darwin, AU", lat: -12.46, lon: 130.84 },
  "Australia/Hobart": { city: "Hobart, AU", lat: -42.88, lon: 147.33 },
  "Australia/Melbourne": { city: "Melbourne, AU", lat: -37.81, lon: 144.96 },
  "Australia/Perth": { city: "Perth, AU", lat: -31.95, lon: 115.86 },
  "Australia/Sydney": { city: "Sydney, AU", lat: -33.87, lon: 151.21 },
  "Pacific/Auckland": { city: "Auckland, NZ", lat: -36.85, lon: 174.76 },
  "Pacific/Fiji": { city: "Suva, FJ", lat: -18.13, lon: 178.44 },
  "Pacific/Guam": { city: "Hagåtña, GU", lat: 13.44, lon: 144.79 },
  "Pacific/Tahiti": { city: "Papeete, PF", lat: -17.54, lon: -149.57 },
}

/** Resolve an IANA timezone to a representative city. Returns null when the
 *  tz isn't in our curated table — the caller should fall back to Nippur. */
export function tzToCity(tz: string | null | undefined): TimezoneCity | null {
  if (!tz) return null
  return TIMEZONE_CITY[tz] ?? null
}

/** Read the device's IANA timezone from the JS engine. Wrapped in try/catch
 *  because some Hermes builds historically threw on Intl edge cases. */
export function deviceTimezone(): string | null {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}
