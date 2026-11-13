/**
 * The light.
 *
 * There is one light source on this site and it travels the whole document.
 * In the hero it is the key light on the portrait and the visitor moves it.
 * Below the hero it detaches from the pointer and is carried by scroll,
 * changing position, spread, warmth and strength as it passes through each
 * section. Nothing else on the page is allowed to introduce a light of its own.
 *
 * Written as a module-level store rather than React state on purpose: the
 * values change every frame and must never cause a render.
 */

export type LightMood = {
  /** Viewport-relative position, 0..1. */
  x: number
  y: number
  /** Radius as a fraction of the viewport's larger side. */
  spread: number
  /** Overall strength, 0..1. */
  power: number
  /** Colour of the air, as an "r g b" triple. */
  tint: readonly [number, number, number]
  /** How tightly the room closes in. 0 open, 1 enclosed. */
  depth: number
}

const LAMP: readonly [number, number, number] = [255, 226, 186]
const NEUTRAL: readonly [number, number, number] = [196, 204, 224]
// Deep red room light, sampled from the live photographs. Documentary, not a
// venue reference.
const ROOM_RED: readonly [number, number, number] = [150, 14, 44]
const BLOOD: readonly [number, number, number] = [122, 10, 26]

/**
 * One entry per section of the homepage, plus the catalogue route.
 *
 * `depth` drives how hard the room closes in around the content: 0 is open
 * air, 1 is a tight vignette with the walls close. Varying it is what stops
 * the page reading as one flat plane scrolled past.
 */
export const MOODS: Record<string, LightMood & { depth: number }> = {
  presence: { x: 0.42, y: 0.42, spread: 0.66, power: 1, tint: LAMP, depth: 0.88 },
  before: { x: 0.24, y: 0.4, spread: 0.86, power: 0.34, tint: LAMP, depth: 0.62 },
  begins: { x: 0.76, y: 0.44, spread: 0.72, power: 0.58, tint: LAMP, depth: 0.7 },
  sound: { x: 0.8, y: 0.38, spread: 0.82, power: 0.44, tint: LAMP, depth: 0.44 },
  works: { x: 0.4, y: 0.5, spread: 0.74, power: 0.62, tint: LAMP, depth: 0.76 },
  catalogue: { x: 0.5, y: 0.76, spread: 1.2, power: 0.24, tint: NEUTRAL, depth: 0.16 },
  transmission: { x: 0.32, y: 0.44, spread: 0.7, power: 0.7, tint: ROOM_RED, depth: 0.95 },
  learning: { x: 0.5, y: 0.46, spread: 0.62, power: 0.3, tint: BLOOD, depth: 0.9 },
  people: { x: 0.28, y: 0.46, spread: 0.92, power: 0.5, tint: LAMP, depth: 0.5 },
  unseen: { x: 0.68, y: 0.5, spread: 1.05, power: 0.26, tint: NEUTRAL, depth: 0.28 },
  archive: { x: 0.5, y: 0.44, spread: 0.86, power: 0.56, tint: LAMP, depth: 0.66 },
  building: { x: 0.62, y: 0.5, spread: 1.1, power: 0.2, tint: NEUTRAL, depth: 0.3 },
  booking: { x: 0.5, y: 0.46, spread: 0.5, power: 0.9, tint: LAMP, depth: 0.92 },
  /* The last room takes the light with it. */
  machines: { x: 0.5, y: 0.52, spread: 0.42, power: 0.16, tint: BLOOD, depth: 1 },
  catalogueRoute: { x: 0.5, y: 0.16, spread: 1.3, power: 0.2, tint: NEUTRAL, depth: 0.1 },
}

const DEFAULT_MOOD = MOODS.presence

export type LightState = {
  /** Where the light is heading. */
  target: LightMood
  /** Pointer position in the hero, 0..1 of the viewport. */
  pointerX: number
  pointerY: number
  /** How much the pointer still owns the light. Falls to 0 past the hero. */
  pointerWeight: number
  /** Set once the visitor has actually moved a pointer or touched the hero. */
  pointerEngaged: boolean
  /**
   * Where the light actually is this frame, after damping. LightField owns
   * these two; everything that needs to line up with the light reads them.
   */
  currentX: number
  currentY: number
}

export const light: LightState = {
  target: { ...DEFAULT_MOOD },
  pointerX: DEFAULT_MOOD.x,
  pointerY: DEFAULT_MOOD.y,
  pointerWeight: 1,
  pointerEngaged: false,
  currentX: DEFAULT_MOOD.x,
  currentY: DEFAULT_MOOD.y,
}

export function setMood(name: string) {
  const mood = MOODS[name] ?? DEFAULT_MOOD
  light.target = mood
}

export function setPointer(x: number, y: number) {
  light.pointerX = x
  light.pointerY = y
  light.pointerEngaged = true
}

export function setPointerWeight(w: number) {
  light.pointerWeight = w
}

/** Where the light actually wants to be this frame, pointer influence folded in. */
export function resolveTarget(): LightMood {
  const t = light.target
  const w = light.pointerWeight
  if (w <= 0.001) return t
  return {
    x: t.x + (light.pointerX - t.x) * w,
    y: t.y + (light.pointerY - t.y) * w,
    spread: t.spread,
    power: t.power,
    tint: t.tint,
    depth: t.depth,
  }
}
