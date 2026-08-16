import { sumerianDate } from "@jenova-marie/sumerian-date"

import { MONTH_NAME_TO_INDEX } from "./calendar"

// The Calendar screen joins the library's computed months onto the wheel's
// month data by name. A spelling drift between the two vocabularies silently
// drops a month from monthDates (its card falls back to the static "approx"
// range) and, when that month is current, breaks the whole current-month UI.
// Sweep enough years to cover both intercalary variants (Diri Kin Inana
// appears in 2042; Diri Šekinku in most long years).
test("every month name the library can emit maps to a wheel index", () => {
  const missing = new Set<string>()
  for (let year = 2024; year <= 2045; year++) {
    const sd = sumerianDate(new Date(Date.UTC(year, 7, 1)), {
      latitude: 32.13,
      longitude: 45.23,
    })
    for (const m of sd.sumerianYear.months) {
      if (MONTH_NAME_TO_INDEX[m.name] === undefined) missing.add(m.name)
    }
  }
  expect([...missing]).toEqual([])
})
