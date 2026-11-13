/**
 * Listening.
 *
 * No audio files were supplied with this project, so right now every track
 * resolves to "no local audio" and the interface says exactly that. Nothing
 * pretends to play, and no waveform is drawn from nothing.
 *
 * The moment real files appear the whole path works without a UI change:
 *
 *   public/audio/manifest.json   { "GBKQU2672241": "check-this-out.mp3", ... }
 *   public/audio/<file>
 *
 * Keys are ISRCs, so a track is matched by its actual identifier rather than
 * by a fuzzy title. Peaks are computed from the decoded file itself, which is
 * the only kind of waveform this site is willing to draw.
 */

export type AudioManifest = Record<string, string>

let manifestPromise: Promise<AudioManifest> | null = null

export function loadManifest(): Promise<AudioManifest> {
  if (manifestPromise) return manifestPromise
  manifestPromise = fetch('/audio/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .then((json) => (json && typeof json === 'object' ? (json as AudioManifest) : {}))
    .catch(() => ({}))
  return manifestPromise
}

export function resolveTrackUrl(manifest: AudioManifest, isrcs: string[]): string | null {
  for (const isrc of isrcs) {
    const file = manifest[isrc]
    if (file) return file.startsWith('/') ? file : `/audio/${file}`
  }
  return null
}

/**
 * Real peaks from a real file. Returns `bins` normalised maxima, one per
 * horizontal step of the waveform. Never called when there is nothing to
 * decode.
 */
export async function computePeaks(url: string, bins = 320): Promise<Float32Array> {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(buf)
    const channel = decoded.getChannelData(0)
    const step = Math.floor(channel.length / bins) || 1
    const peaks = new Float32Array(bins)
    let max = 0
    for (let i = 0; i < bins; i++) {
      let peak = 0
      const start = i * step
      const end = Math.min(start + step, channel.length)
      for (let j = start; j < end; j++) {
        const v = Math.abs(channel[j])
        if (v > peak) peak = v
      }
      peaks[i] = peak
      if (peak > max) max = peak
    }
    if (max > 0) for (let i = 0; i < bins; i++) peaks[i] /= max
    return peaks
  } finally {
    void ctx.close()
  }
}
