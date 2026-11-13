/**
 * Small text helpers shared by the data scripts.
 *
 * The site's house rule bans four long dash characters (see check-dashes.mjs).
 * Titles that arrive from Spotify or from the hand file can carry them, so they
 * are folded to the plain hyphen before they reach the data the site renders.
 * Declared by code point so this file passes its own check.
 */

const BANNED = [0x2012, 0x2013, 0x2014, 0x2015].map((c) => String.fromCharCode(c)).join('')
const BANNED_RE = new RegExp(`[${BANNED}]`, 'g')

export function normalizeDashes(value) {
  if (typeof value === 'string') return value.replace(BANNED_RE, '-')
  if (Array.isArray(value)) return value.map(normalizeDashes)
  return value
}

export function isEmpty(value) {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}
