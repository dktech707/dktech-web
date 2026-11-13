/**
 * prepare-media.mjs
 *
 * Reads the original assets (read-only) and writes web-ready derivatives into
 * public/media. Originals are never opened for writing and never moved.
 *
 * Also emits src/data/media.generated.ts with real intrinsic dimensions and a
 * tiny inline placeholder for each image, so the layout never shifts and the
 * dark frames never flash white.
 *
 *   node scripts/prepare-media.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'media')
const MANIFEST = path.join(ROOT, 'src', 'data', 'media.generated.ts')

/** @typedef {{ left: number, top: number, width: number, height: number }} Crop */
/** @typedef {{ id: string, src: string, widths: number[], group: string, quality?: number, crop?: Crop }} Job */

/** @type {Job[]} */
const JOBS = [
  // Controlled portrait. Kept photographic: no colour grading, no stylisation.
  { id: 'portrait', src: '03_CORE_PORTRAIT/DKTECH_CORE_PORTRAIT_01_2048.png', widths: [640, 960, 1400, 2048], group: 'portrait', quality: 88 },

  // Live documentation. Deliberately left grainy and imperfect.
  { id: 'live-booth-to-floor', src: '04_LIVE_PHOTOS/DKTECH_LIVE_01_BOOTH_TO_FLOOR.jpg', widths: [640, 1200, 1920], group: 'live' },
  { id: 'live-close-performance', src: '04_LIVE_PHOTOS/DKTECH_LIVE_02_CLOSE_PERFORMANCE.jpg', widths: [520, 900, 1440], group: 'live' },
  { id: 'live-red-pressure', src: '04_LIVE_PHOTOS/DKTECH_LIVE_03_RED_PRESSURE.jpg', widths: [520, 900, 1440], group: 'live' },
  { id: 'live-turntable-red', src: '04_LIVE_PHOTOS/DKTECH_LIVE_04_TURNTABLE_RED.jpg', widths: [520, 900, 1440], group: 'live' },
  { id: 'live-monochrome-booth', src: '04_LIVE_PHOTOS/DKTECH_LIVE_05_MONOCHROME_BOOTH.jpg', widths: [520, 900, 1440], group: 'live' },
  { id: 'live-monochrome-wide', src: '04_LIVE_PHOTOS/DKTECH_LIVE_06_MONOCHROME_WIDE.jpg', widths: [520, 900, 1440], group: 'live' },
  { id: 'live-open-air', src: '04_LIVE_PHOTOS/DKTECH_LIVE_07_OPEN_AIR_BLUE_GREEN.jpg', widths: [520, 900, 1440], group: 'live' },

  // Documented proof.
  { id: 'proof-naked-lunch-373', src: '05_PROOF/PROOF_NAKED_LUNCH_PODCAST_373_DKTECH.jpg', widths: [420, 760, 1100], group: 'proof' },
  { id: 'proof-controlled-aggression', src: '05_PROOF/PROOF_CONTROLLED_AGGRESSION_CHART_47.jpg', widths: [420, 760], group: 'proof' },
  { id: 'proof-mixmag-adria', src: '05_PROOF/PROOF_MIXMAG_ADRIA_HARDGROOVE_HARD_TECHNO_RADAR_02.png', widths: [420, 760, 1100], group: 'proof' },
  // The DEPO Clubhouse photographs (05_PROOF/PROOF_DEPO_LIVE_*) are kept in the
  // private source archive and are not processed here. The venue was kept off
  // the public site until the artist cleared it on 13 November 2026; since then
  // the hero video loop (scripts/prepare-video.sh) shows the DEPO booth.

  /*
    Machine detail. Real equipment, cropped out of the real live photographs,
    for the room at the end. Nothing here is a render or a stock object: every
    crop is a rectangle taken from a frame already in 04_LIVE_PHOTOS.
  */
  { id: 'machine-mixer', src: '04_LIVE_PHOTOS/DKTECH_LIVE_06_MONOCHROME_WIDE.jpg', widths: [720, 1200], group: 'machine', crop: { left: 0, top: 1560, width: 1440, height: 720 } },
  { id: 'machine-jog', src: '04_LIVE_PHOTOS/DKTECH_LIVE_02_CLOSE_PERFORMANCE.jpg', widths: [640, 1100], group: 'machine', crop: { left: 20, top: 1460, width: 1240, height: 440 } },
  { id: 'machine-deck', src: '04_LIVE_PHOTOS/DKTECH_LIVE_04_TURNTABLE_RED.jpg', widths: [640, 1200], group: 'machine', crop: { left: 0, top: 1760, width: 1440, height: 680 } },
  /*
    Tighter fragments for the last room: individual controls rather than whole
    decks, so the closing descent is built from pieces of equipment at arm's
    length. Same rule as above, every rectangle comes out of a real frame.
  */
  { id: 'machine-knobs', src: '04_LIVE_PHOTOS/DKTECH_LIVE_04_TURNTABLE_RED.jpg', widths: [520, 900], group: 'machine', crop: { left: 470, top: 1660, width: 700, height: 300 } },
  { id: 'machine-platter', src: '04_LIVE_PHOTOS/DKTECH_LIVE_04_TURNTABLE_RED.jpg', widths: [520, 900], group: 'machine', crop: { left: 40, top: 1820, width: 700, height: 430 } },
  { id: 'machine-cables', src: '04_LIVE_PHOTOS/DKTECH_LIVE_04_TURNTABLE_RED.jpg', widths: [440, 820], group: 'machine', crop: { left: 940, top: 1450, width: 500, height: 500 } },
  { id: 'machine-jog-lit', src: '04_LIVE_PHOTOS/DKTECH_LIVE_02_CLOSE_PERFORMANCE.jpg', widths: [520, 900], group: 'machine', crop: { left: 90, top: 1540, width: 720, height: 379 } },
  { id: 'machine-leds', src: '04_LIVE_PHOTOS/DKTECH_LIVE_02_CLOSE_PERFORMANCE.jpg', widths: [440, 780], group: 'machine', crop: { left: 700, top: 1600, width: 560, height: 319 } },

  /*
    Release artwork, exactly as supplied. Nothing is cropped, recoloured or
    redrawn: a cover is a document and it is shown as the document it is. The
    dark padding several of them carry is left alone because it matches the
    page, and the coloured backdrops on the vinyl mockups are part of the
    object.
  */
  { id: 'cover-touriste', src: 'covers/touriste at drugstore.jpg', widths: [400, 554], group: 'cover' },
  { id: 'cover-fresh-king', src: 'covers/fresh king.webp', widths: [400, 500], group: 'cover' },
  { id: 'cover-controlled-aggression', src: 'covers/NLD741.jpg', widths: [400, 800, 1200], group: 'cover' },
  { id: 'cover-oblivion-2', src: 'covers/naked-lunch- va.jpg', widths: [400, 800], group: 'cover' },
  { id: 'cover-sampler-5', src: 'covers/Resilent-Artwork-127.jpg', widths: [400, 800], group: 'cover' },
  { id: 'cover-faster-harder-louder', src: 'covers/faster-harder-louder.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-the-answer', src: 'covers/the-answer.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-mastermind', src: 'covers/mastermind-ep.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-nine-seals', src: 'covers/nine-seals-of-namtar.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-zagreb', src: 'covers/zagreb-ep.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-siege-of-akkad', src: 'covers/siege of akkad.webp', widths: [400, 500], group: 'cover' },
  { id: 'cover-gp-x009', src: 'covers/gp-009.png', widths: [400, 800], group: 'cover' },
  { id: 'cover-illusions', src: 'covers/illusions- ep.png', widths: [400, 800], group: 'cover' },

  // Vinyl mockups. A different kind of object, so they keep their own group.
  { id: 'vinyl-outlast', src: 'covers/vinyl covers/outlast-vinil.png', widths: [520, 1000], group: 'vinyl' },
  { id: 'vinyl-society-collapse', src: 'covers/vinyl covers/rbr-007-vinil.png', widths: [520, 1000], group: 'vinyl' },
  { id: 'vinyl-gatherings-2', src: 'covers/vinyl covers/cdxl-VA2-vinil.png', widths: [520, 1000], group: 'vinyl' },
  { id: 'vinyl-dying-light', src: 'covers/vinyl covers/dying light-vinil.png', widths: [520, 1000], group: 'vinyl' },

  // Ecosystem marks. Rendered small and desaturated by the UI: evidence, not branding.
  { id: 'eco-groove-protocol', src: '06_ECOSYSTEM/GROOVE_PROTOCOL_LOGO.png', widths: [220, 440], group: 'ecosystem' },
  { id: 'eco-rhythmic-beatz', src: '06_ECOSYSTEM/RHYTHMIC_BEATZ_RECORDS_LOGO.png', widths: [220, 440], group: 'ecosystem' },
]

await fs.mkdir(OUT_DIR, { recursive: true })

const results = []

for (const job of JOBS) {
  const abs = path.join(ROOT, job.src)
  const meta = await sharp(abs, { failOn: 'none' }).metadata()
  const fullWidth = meta.width ?? 0
  const fullHeight = meta.height ?? 0
  if (!fullWidth || !fullHeight) throw new Error(`Could not read dimensions for ${job.src}`)

  /*
    A cropped job takes a rectangle out of the original and treats it as the
    whole image from here on. The original file is only ever read.
  */
  if (job.crop) {
    const c = job.crop
    if (c.left + c.width > fullWidth || c.top + c.height > fullHeight) {
      throw new Error(`Crop for ${job.id} falls outside ${job.src} (${fullWidth}x${fullHeight})`)
    }
  }
  const open = () => {
    const s = sharp(abs, { failOn: 'none' })
    return job.crop ? s.extract(job.crop) : s
  }
  const intrinsicWidth = job.crop ? job.crop.width : fullWidth
  const intrinsicHeight = job.crop ? job.crop.height : fullHeight

  // Never upscale. If the original is smaller than a requested step, fall back
  // to the original width so the largest source is still the sharpest available.
  const capped = job.widths.filter((w) => w <= intrinsicWidth)
  const widths = [...new Set([...capped, Math.min(Math.max(...job.widths), intrinsicWidth)])].sort((a, b) => a - b)

  const sources = []
  for (const w of widths) {
    const file = `${job.id}-${w}.webp`
    await open()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: job.quality ?? 82, effort: 5 })
      .toFile(path.join(OUT_DIR, file))
    sources.push({ w, url: `/media/${file}` })
  }

  // 20px placeholder, inlined as a data URI. Enough to hold the frame's darkness.
  const lqipBuf = await open()
    .resize({ width: 20 })
    .webp({ quality: 40 })
    .toBuffer()
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`

  // Average colour, used as the frame's resting background.
  const { dominant } = await open().stats()
  const tone = `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`

  results.push({
    id: job.id,
    group: job.group,
    origin: job.src,
    width: intrinsicWidth,
    height: intrinsicHeight,
    aspect: Number((intrinsicWidth / intrinsicHeight).toFixed(4)),
    srcSet: sources.map((s) => `${s.url} ${s.w}w`).join(', '),
    fallback: sources[sources.length - 1].url,
    smallest: sources[0].url,
    lqip,
    tone,
  })

  console.log(`${job.id.padEnd(28)} ${intrinsicWidth}x${intrinsicHeight}  ->  ${sources.map((s) => s.w).join(', ')}`)
}

/*
  Fonts.

  Only the latin and latin-ext subsets are copied. Latin-ext is needed and not
  optional: the artist's name is Dino Egredžija and labels in the catalogue
  include STØK Recordings. The Greek, Cyrillic and Vietnamese subsets that ship
  with the packages are not copied, so they never reach the build output.
*/
const FONT_DIR = path.join(ROOT, 'public', 'fonts')
await fs.mkdir(FONT_DIR, { recursive: true })

const FONTS = [
  ['@fontsource-variable/inter-tight', 'inter-tight-latin-wght-normal.woff2'],
  ['@fontsource-variable/inter-tight', 'inter-tight-latin-ext-wght-normal.woff2'],
  ['@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2'],
  ['@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-ext-wght-normal.woff2'],
]

for (const [pkg, file] of FONTS) {
  const from = path.join(ROOT, 'node_modules', pkg, 'files', file)
  await fs.copyFile(from, path.join(FONT_DIR, file))
  const { size } = await fs.stat(path.join(FONT_DIR, file))
  console.log(`${file.padEnd(44)} ${Math.round(size / 1024)} kB`)
}

const header = `// GENERATED by scripts/prepare-media.mjs. Do not edit by hand.
// Sources are the untouched originals under 03_CORE_PORTRAIT, 04_LIVE_PHOTOS,
// 05_PROOF and 06_ECOSYSTEM. Re-run: npm run media

export type GeneratedImage = {
  id: string
  group: string
  origin: string
  width: number
  height: number
  aspect: number
  srcSet: string
  fallback: string
  smallest: string
  lqip: string
  tone: string
}

export const generatedImages = ${JSON.stringify(Object.fromEntries(results.map((r) => [r.id, r])), null, 2)} as const satisfies Record<string, GeneratedImage>

export type GeneratedImageId = keyof typeof generatedImages
`

await fs.mkdir(path.dirname(MANIFEST), { recursive: true })
await fs.writeFile(MANIFEST, header, 'utf8')

console.log(`\n${results.length} images prepared into public/media`)
console.log('manifest -> src/data/media.generated.ts')
