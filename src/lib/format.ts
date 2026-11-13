const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** ISO date to "07 Aug 2026". Never guesses a missing date. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const mi = Number(m) - 1
  if (!y || Number.isNaN(mi) || !MONTHS_SHORT[mi]) return iso
  return d ? `${d} ${MONTHS_SHORT[mi]} ${y}` : `${MONTHS_SHORT[mi]} ${y}`
}

/** ISO date to "September 2024". */
export function monthYear(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m] = iso.split('-')
  const mi = Number(m) - 1
  if (!y || Number.isNaN(mi) || !MONTHS_LONG[mi]) return iso
  return `${MONTHS_LONG[mi]} ${y}`
}

/** "2025-07" to "Jul 25", for a dense time axis. */
export function axisMonth(key: string): string {
  const [y, m] = key.split('-')
  const mi = Number(m) - 1
  return `${MONTHS_SHORT[mi] ?? m} ${y.slice(2)}`
}

/** Seconds to "6:36". Returns an empty string when no duration was supplied. */
export function duration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Seconds to "3 h 33 min", for a catalogue total. */
export function longDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

/** Thousands separator that does not depend on the visitor's locale. */
export function count(n: number): string {
  return n.toLocaleString('en-GB')
}

/** Two-digit index, for archival row numbering. */
export function pad(n: number, width = 3): string {
  return String(n).padStart(width, '0')
}
