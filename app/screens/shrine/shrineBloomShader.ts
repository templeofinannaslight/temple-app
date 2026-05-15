type CandleType = "tiny" | "small" | "short" | "med" | "tall" | "stick"

interface CandlePosition {
  id: number
  x: number // percentage of image width
  y: number // percentage of image height
  px: number // source pixel X (in 1024×1536 image)
  py: number // source pixel Y
  type: CandleType
}

// Candle positions mapped from shrine.dark.png (1024×1536)
// x/y are percentages, px/py are original pixel coordinates
export const CANDLE_POSITIONS: CandlePosition[] = [
  // Bottom shelf — left to right
  { id: 1, x: 10.16, y: 78.39, px: 104, py: 1204, type: "med" },
  { id: 2, x: 19.24, y: 85.16, px: 197, py: 1308, type: "med" },
  { id: 3, x: 26.37, y: 92.45, px: 270, py: 1420, type: "short" },
  { id: 4, x: 29.98, y: 87.17, px: 307, py: 1339, type: "short" },
  { id: 5, x: 38.87, y: 90.1, px: 398, py: 1384, type: "small" },
  { id: 6, x: 50.2, y: 93.36, px: 514, py: 1434, type: "small" },
  { id: 7, x: 56.54, y: 90.43, px: 579, py: 1389, type: "small" },
  { id: 8, x: 67.48, y: 93.36, px: 691, py: 1434, type: "small" },
  { id: 9, x: 64.55, y: 86.33, px: 661, py: 1326, type: "short" },
  { id: 10, x: 79.0, y: 88.74, px: 809, py: 1363, type: "short" },
  { id: 11, x: 87.99, y: 80.27, px: 901, py: 1233, type: "med" },
  // Right side — ascending
  { id: 12, x: 92.48, y: 58.85, px: 947, py: 904, type: "tall" },
  { id: 13, x: 87.4, y: 52.99, px: 895, py: 814, type: "tall" },
  { id: 14, x: 79.39, y: 47.98, px: 813, py: 737, type: "tall" },
  { id: 15, x: 71.48, y: 43.36, px: 732, py: 666, type: "tall" },
  // Right mid cluster
  { id: 16, x: 71.58, y: 53.19, px: 733, py: 817, type: "med" },
  { id: 17, x: 78.32, y: 56.64, px: 802, py: 870, type: "small" },
  { id: 18, x: 83.01, y: 59.9, px: 850, py: 920, type: "med" },
  { id: 19, x: 87.11, y: 64.78, px: 892, py: 995, type: "short" },
  { id: 20, x: 78.91, y: 66.15, px: 808, py: 1016, type: "small" },
  { id: 21, x: 72.95, y: 67.06, px: 747, py: 1030, type: "small" },
  { id: 22, x: 69.92, y: 63.93, px: 716, py: 982, type: "small" },
  // Center cluster
  { id: 23, x: 52.93, y: 63.15, px: 542, py: 970, type: "short" },
  { id: 24, x: 56.35, y: 66.08, px: 577, py: 1015, type: "tiny" },
  { id: 25, x: 50.78, y: 66.67, px: 520, py: 1024, type: "tiny" },
  { id: 26, x: 45.51, y: 66.34, px: 466, py: 1019, type: "tiny" },
  // Left mid cluster
  { id: 27, x: 33.69, y: 60.81, px: 345, py: 934, type: "med" },
  { id: 28, x: 34.67, y: 59.11, px: 355, py: 908, type: "med" },
  { id: 29, x: 25.39, y: 65.04, px: 260, py: 999, type: "small" },
  { id: 30, x: 22.56, y: 66.8, px: 231, py: 1026, type: "small" },
  { id: 31, x: 13.87, y: 67.06, px: 142, py: 1030, type: "small" },
  // Left side — ascending
  { id: 32, x: 7.62, y: 59.83, px: 78, py: 919, type: "tall" },
  { id: 33, x: 12.89, y: 52.34, px: 132, py: 804, type: "tall" },
  { id: 34, x: 19.92, y: 47.79, px: 204, py: 734, type: "tall" },
  { id: 35, x: 28.13, y: 43.23, px: 288, py: 664, type: "tall" },
  // Stick candles — back row
  { id: 36, x: 20.31, y: 19.92, px: 208, py: 306, type: "stick" },
  { id: 37, x: 90.53, y: 16.41, px: 927, py: 252, type: "stick" },
  { id: 38, x: 16.41, y: 13.41, px: 168, py: 206, type: "stick" },
  { id: 39, x: 96.0, y: 19.2, px: 983, py: 295, type: "stick" },
  { id: 40, x: 4.39, y: 19.6, px: 45, py: 301, type: "stick" },
  { id: 41, x: 79.59, y: 20.25, px: 815, py: 311, type: "stick" },
  { id: 42, x: 9.47, y: 16.34, px: 97, py: 251, type: "stick" },
  { id: 43, x: 83.69, y: 13.35, px: 857, py: 205, type: "stick" },
]

export const TOTAL_CANDLES = CANDLE_POSITIONS.length

// Per-type bloom radius (in source image pixels at 1024px width)
// Scaled at runtime by renderedWidth / 1024
const BLOOM_REACH: Record<CandleType, number> = {
  stick: 200,
  tall: 350,
  med: 300,
  short: 250,
  small: 200,
  tiny: 150,
}

export const getCandleReach = (type: CandleType): number => BLOOM_REACH[type]

// Burn duration per candle type (milliseconds)
const HOURS = 60 * 60 * 1000
const BURN_DURATION: Record<CandleType, number> = {
  stick: 4 * HOURS,
  tall: 36 * HOURS,
  med: 24 * HOURS,
  short: 12 * HOURS,
  small: 8 * HOURS,
  tiny: 4 * HOURS,
}

export const getCandleBurnDuration = (type: CandleType): number => BURN_DURATION[type]

/** Look up a candle's type by ID */
const CANDLE_TYPE_BY_ID = new Map(CANDLE_POSITIONS.map((c) => [c.id, c.type]))
export const getCandleType = (id: number): CandleType | undefined => CANDLE_TYPE_BY_ID.get(id)

// Portrait frame position (percentages of image dimensions)
// Inanna's portrait in the center of the shrine
export const PORTRAIT_RECT = { x: 31.93, y: 19.1, w: 36.14, h: 35.04 }

// Nameplate position (percentages of image dimensions)
// "INANNA" plaque below the altar
export const NAMEPLATE_RECT = { x: 38.49, y: 73.72, w: 23.02, h: 4 }
