/**
 * add-store-cover.mjs
 *
 * For a release whose sleeve is not in the private covers/ folder: reads the
 * artwork the label delivered to a store, from its public image address, and
 * writes the same responsive WebP set prepare-media.mjs writes. Nothing is
 * cropped, recoloured or redrawn. Prints the manifest entry to add to
 * src/data/media.generated.ts by hand.
 *
 *   node scripts/add-store-cover.mjs <id> <url> [width ...]
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'media')

const [id, url, ...rest] = process.argv.slice(2)
if (!id || !url) throw new Error('Usage: node scripts/add-store-cover.mjs <id> <url> [width ...]')
const wanted = rest.length ? rest.map(Number) : [400, 800]

const res = await fetch(url)
if (!res.ok) throw new Error(`${url} answered ${res.status}`)
const original = Buffer.from(await res.arrayBuffer())

const meta = await sharp(original).metadata()
const width = meta.width ?? 0
const height = meta.height ?? 0
if (!width || !height) throw new Error(`Could not read dimensions for ${url}`)

// Never upscale, same rule as prepare-media.mjs.
const capped = wanted.filter((w) => w <= width)
const widths = [...new Set([...capped, Math.min(Math.max(...wanted), width)])].sort((a, b) => a - b)

await fs.mkdir(OUT_DIR, { recursive: true })
const sources = []
for (const w of widths) {
  const file = `${id}-${w}.webp`
  await sharp(original).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(path.join(OUT_DIR, file))
  sources.push({ w, url: `/media/${file}` })
}

const lqipBuf = await sharp(original).resize({ width: 20 }).webp({ quality: 40 }).toBuffer()
const { dominant } = await sharp(original).stats()

const entry = {
  id,
  group: 'cover',
  origin: url,
  width,
  height,
  aspect: Number((width / height).toFixed(4)),
  srcSet: sources.map((s) => `${s.url} ${s.w}w`).join(', '),
  fallback: sources[sources.length - 1].url,
  smallest: sources[0].url,
  lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
  tone: `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`,
}

console.log(JSON.stringify({ [id]: entry }, null, 2))
