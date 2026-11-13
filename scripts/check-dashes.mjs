/**
 * check-dashes.mjs
 *
 * House rule: no em dash and no en dash anywhere in the site's source or in
 * the data it renders. Only the plain hyphen-minus.
 *
 * Scans src/, scripts/, index.html and the generated catalogue data, reports
 * every offender with file, line and column, and exits non-zero if any are
 * found.
 *
 *   npm run lint:dashes
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ROOTS = ['src', 'scripts', 'public']
const SINGLE_FILES = ['index.html', 'README.md']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vite'])
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.jsx', '.css', '.html', '.json', '.md', '.svg'])

/**
 * Declared by code point so this file does not trip its own check:
 * U+2012 figure dash, U+2013 en dash, U+2014 em dash, U+2015 horizontal bar.
 */
const BANNED = [
  { ch: String.fromCharCode(0x2014), name: 'em dash' },
  { ch: String.fromCharCode(0x2013), name: 'en dash' },
  { ch: String.fromCharCode(0x2012), name: 'figure dash' },
  { ch: String.fromCharCode(0x2015), name: 'horizontal bar' },
]
const RE = new RegExp(`[${BANNED.map((b) => b.ch).join('')}]`, 'g')
const NAMES = new Map(BANNED.map((b) => [b.ch, b.name]))

async function* walk(dir) {
  let items
  try {
    items = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const item of items) {
    if (SKIP_DIRS.has(item.name)) continue
    const full = path.join(dir, item.name)
    if (item.isDirectory()) yield* walk(full)
    else if (EXT.has(path.extname(item.name))) yield full
  }
}

const files = []
for (const r of ROOTS) for await (const f of walk(path.join(ROOT, r))) files.push(f)
for (const f of SINGLE_FILES) {
  const full = path.join(ROOT, f)
  try {
    await fs.access(full)
    files.push(full)
  } catch {
    /* optional */
  }
}

const hits = []
for (const file of files) {
  const text = await fs.readFile(file, 'utf8')
  if (!RE.test(text)) continue
  RE.lastIndex = 0
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    let m
    RE.lastIndex = 0
    while ((m = RE.exec(line))) {
      hits.push({
        file: path.relative(ROOT, file),
        line: i + 1,
        col: m.index + 1,
        name: NAMES.get(m[0]),
        context: line.trim().slice(Math.max(0, m.index - 40), m.index + 40),
      })
    }
  })
}

if (hits.length === 0) {
  console.log(`No em dash or en dash in ${files.length} files.`)
  process.exit(0)
}

console.error(`${hits.length} banned dash character(s) found:\n`)
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}:${h.col}  ${h.name}`)
  console.error(`    ${h.context}`)
}
process.exit(1)
