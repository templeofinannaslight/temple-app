declare module "@jenova-marie/sumerian-date" {
  interface SumerianObservance {
    name: string
    description: string
    day?: number
  }

  interface SumerianMonthData {
    number: number
    name: string
    cuneiform: string
    meaning: string
    season: string
    description: string
    festivals: Array<{ day: number | null; name: string; description: string }>
    startDate: Date
    endDate: Date
    lengthDays: number
    newMoonJDE: number
    intercalary?: boolean
  }

  interface SumerianYear {
    springGregorianYear: number
    cyclePosition: number
    isLongYear: boolean
    yearStart: Date
    yearEnd: Date
    nextYearStart: Date
    vernalEquinoxDate: Date
    months: SumerianMonthData[]
  }

  interface SumerianDate {
    gregorianDate: Date
    springGregorianYear: number
    cyclePosition: number
    monthNumber: number
    monthName: string
    monthCuneiform: string
    monthMeaning: string
    monthDescription: string
    dayOfMonth: number
    monthLengthDays: number
    monthStartDate: Date
    monthEndDate: Date
    isIntercalaryYear: boolean
    isIntercalaryMonth: boolean
    observances: SumerianObservance[]
    sumerianYear: SumerianYear
    toString(): string
  }

  export function sumerianDate(
    date?: Date,
    opts?: { latitude?: number; longitude?: number },
  ): SumerianDate

  export function sumerianYear(
    gregorianYear?: number,
    opts?: { latitude?: number; longitude?: number },
  ): SumerianYear

  export function cyclePosition(springGregorianYear: number): number
  export function vernalEquinox(year: number): Date
  export function nextNewMoon(afterDate: Date): Date

  export const months: Array<{
    number: number
    name: string
    cuneiform: string
    meaning: string
    season: string
    description: string
    festivals: Array<{ day: number | null; name: string; description: string }>
  }>

  export const intercalaryMonth: {
    number: number
    name: string
    cuneiform: string | null
    meaning: string
    season: string
    intercalary: boolean
    description: string
    festivals: Array<{ day: number; name: string; description: string }>
  }

  export const intercalaryMonthYear17: {
    number: number
    name: string
    cuneiform: string | null
    meaning: string
    season: string
    intercalary: boolean
    description: string
    festivals: Array<{ day: number; name: string; description: string }>
  }
}
