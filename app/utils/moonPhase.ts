// Lunar phase moment calculations — Meeus, Astronomical Algorithms 2nd ed,
// Chapter 49 (mean phase eq 49.1; periodic corrections eq 49.4/49.5/49.6;
// planetary perturbations eq 49.7). Verified ±1 min against Espenak phase
// catalog entries for Jan 2000, May 2024, May/Jun 2026.
//
// JDE = Julian Ephemeris Date (Terrestrial Time). To convert to UT we subtract
// ΔT (~72 s in 2026).

const DEG = Math.PI / 180
const DELTA_T_DAYS = 72 / 86400 // ΔT for early-21st-century era

function meanPhaseJDE(k: number): number {
  const T = k / 1236.85
  return (
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T * T -
    0.00000015 * T * T * T +
    0.00000000073 * T ** 4
  )
}

function commonArgs(k: number) {
  const T = k / 1236.85
  const E = 1 - 0.002516 * T - 0.0000074 * T * T
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T) * DEG
  const Mp =
    (201.5643 +
      385.81693528 * k +
      0.0107582 * T * T +
      0.00001238 * T * T * T -
      0.000000058 * T ** 4) *
    DEG
  const F =
    (160.7108 +
      390.67050284 * k -
      0.0016118 * T * T -
      0.00000227 * T * T * T +
      0.000000011 * T ** 4) *
    DEG
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T) * DEG
  return { T, E, M, Mp, F, Om }
}

function planetaryCorr(k: number): number {
  const T = k / 1236.85
  const D = DEG
  const A1 = D * (299.77 + 0.107408 * k - 0.009173 * T * T)
  const A2 = D * (251.88 + 0.016321 * k)
  const A3 = D * (251.83 + 26.651886 * k)
  const A4 = D * (349.42 + 36.412478 * k)
  const A5 = D * (84.66 + 18.206239 * k)
  const A6 = D * (141.74 + 53.303771 * k)
  const A7 = D * (207.14 + 2.453732 * k)
  const A8 = D * (154.84 + 7.30686 * k)
  const A9 = D * (34.52 + 27.261239 * k)
  const A10 = D * (207.19 + 0.121824 * k)
  const A11 = D * (291.34 + 1.844379 * k)
  const A12 = D * (161.72 + 24.198154 * k)
  const A13 = D * (239.56 + 25.513099 * k)
  const A14 = D * (331.55 + 3.592518 * k)
  return (
    0.000325 * Math.sin(A1) +
    0.000165 * Math.sin(A2) +
    0.000164 * Math.sin(A3) +
    0.000126 * Math.sin(A4) +
    0.00011 * Math.sin(A5) +
    0.000062 * Math.sin(A6) +
    0.00006 * Math.sin(A7) +
    0.000056 * Math.sin(A8) +
    0.000047 * Math.sin(A9) +
    0.000042 * Math.sin(A10) +
    0.00004 * Math.sin(A11) +
    0.000037 * Math.sin(A12) +
    0.000035 * Math.sin(A13) +
    0.000023 * Math.sin(A14)
  )
}

export function newMoonJDE(k: number): number {
  const { E, M, Mp, F, Om } = commonArgs(k)
  let jde = meanPhaseJDE(k)
  jde +=
    -0.4072 * Math.sin(Mp) +
    0.17241 * E * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * E * Math.sin(Mp - M) -
    0.00514 * E * Math.sin(Mp + M) +
    0.00208 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Om) -
    0.00007 * Math.sin(Mp + 2 * M) +
    0.00004 * Math.sin(2 * Mp - 2 * F) +
    0.00004 * Math.sin(3 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(2 * Mp + 2 * F) -
    0.00003 * Math.sin(Mp + M + 2 * F) +
    0.00003 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(Mp - M - 2 * F) -
    0.00002 * Math.sin(3 * Mp + M) +
    0.00002 * Math.sin(4 * Mp)
  return jde + planetaryCorr(k)
}

export function fullMoonJDE(kInteger: number): number {
  const k = kInteger + 0.5
  const { E, M, Mp, F, Om } = commonArgs(k)
  let jde = meanPhaseJDE(k)
  jde +=
    -0.40614 * Math.sin(Mp) +
    0.17302 * E * Math.sin(M) +
    0.01614 * Math.sin(2 * Mp) +
    0.01043 * Math.sin(2 * F) +
    0.00734 * E * Math.sin(Mp - M) -
    0.00515 * E * Math.sin(Mp + M) +
    0.00209 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Om) -
    0.00007 * Math.sin(Mp + 2 * M) +
    0.00004 * Math.sin(2 * Mp - 2 * F) +
    0.00004 * Math.sin(3 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(2 * Mp + 2 * F) -
    0.00003 * Math.sin(Mp + M + 2 * F) +
    0.00003 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(Mp - M - 2 * F) -
    0.00002 * Math.sin(3 * Mp + M) +
    0.00002 * Math.sin(4 * Mp)
  return jde + planetaryCorr(k)
}

function quarterJDE(kInteger: number, isFirstQuarter: boolean): number {
  const k = kInteger + (isFirstQuarter ? 0.25 : 0.75)
  const { E, M, Mp, F, Om } = commonArgs(k)
  let jde = meanPhaseJDE(k)
  jde +=
    -0.62801 * Math.sin(Mp) +
    0.17172 * E * Math.sin(M) -
    0.01183 * E * Math.sin(Mp + M) +
    0.00862 * Math.sin(2 * Mp) +
    0.00804 * Math.sin(2 * F) +
    0.00454 * E * Math.sin(Mp - M) +
    0.00204 * E * E * Math.sin(2 * M) -
    0.0018 * Math.sin(Mp - 2 * F) -
    0.0007 * Math.sin(Mp + 2 * F) -
    0.0004 * Math.sin(3 * Mp) -
    0.00034 * E * Math.sin(2 * Mp - M) +
    0.00032 * E * Math.sin(M + 2 * F) +
    0.00032 * E * Math.sin(M - 2 * F) -
    0.00028 * E * E * Math.sin(Mp + 2 * M) +
    0.00027 * E * Math.sin(2 * Mp + M) -
    0.00017 * Math.sin(Om) -
    0.00005 * Math.sin(Mp - M - 2 * F) +
    0.00004 * Math.sin(2 * Mp + 2 * F) -
    0.00004 * Math.sin(Mp + M + 2 * F) +
    0.00004 * Math.sin(Mp - 2 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(3 * M) +
    0.00002 * Math.sin(2 * Mp - 2 * F) +
    0.00002 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(3 * Mp + M)
  const W =
    0.00306 -
    0.00038 * E * Math.cos(M) +
    0.00026 * Math.cos(Mp) -
    0.00002 * Math.cos(Mp - M) +
    0.00002 * Math.cos(Mp + M) +
    0.00002 * Math.cos(2 * F)
  jde += isFirstQuarter ? W : -W
  return jde + planetaryCorr(k)
}

export function firstQuarterJDE(kInteger: number): number {
  return quarterJDE(kInteger, true)
}

export function lastQuarterJDE(kInteger: number): number {
  return quarterJDE(kInteger, false)
}

/** Recover the integer k for a new-moon JDE (inverse of mean-phase eq 49.1). */
export function kFromNewMoonJDE(jde: number): number {
  return Math.round((jde - 2451550.09766) / 29.530588861)
}

/** JDE (TT) → JS Date in UTC, applying ΔT. */
export function jdeToDate(jde: number): Date {
  return new Date((jde - DELTA_T_DAYS - 2440587.5) * 86400000)
}

/** Which day-of-month (1..lengthDays) does the moment fall on, given a
 *  UTC-midnight-anchored Sumerian month start? Clamps to [1, lengthDays]. */
export function dayOfMonthFor(
  moment: Date,
  monthStartDate: Date,
  monthLengthDays: number,
): number {
  const elapsedDays = (moment.getTime() - monthStartDate.getTime()) / 86400000
  const day = Math.floor(elapsedDays) + 1
  return Math.max(1, Math.min(monthLengthDays, day))
}
