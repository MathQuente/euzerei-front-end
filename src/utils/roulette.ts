export const WHEEL_MAX = 24
export const MIN_LABEL_FONT = 9

const FULL_TURN = 360
const JITTER = 0.32
const RANGE = 0x100000000

export interface RouletteColor {
  background: string
  text: string
}

// O canvas não usa classes do Tailwind, então estas cores vivem aqui (são as do tema do app).
export const ROULETTE_COLORS: readonly RouletteColor[] = [
  { background: '#7a38ca', text: '#ffffff' },
  { background: '#f7b71d', text: '#1a1c26' },
  { background: '#257a70', text: '#ffffff' },
  { background: '#efe6ff', text: '#1a1c26' },
]

type Next32 = () => number

function secureNext32(): number {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0]
}

export function randomInt(max: number, next32: Next32 = secureNext32): number {
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError('max precisa ser um inteiro positivo')
  }
  const limit = RANGE - (RANGE % max)
  let value = next32()
  while (value >= limit) value = next32()
  return value % max
}

export function pickWinnerIndex(
  games: ReadonlyArray<{ igdbId: number }>,
  lastId: number | null,
  next32?: Next32
): number {
  const others: number[] = []
  games.forEach((game, index) => {
    if (game.igdbId !== lastId) others.push(index)
  })
  const pool = others.length > 0 ? others : games.map((_, index) => index)
  return pool[randomInt(pool.length, next32)]
}

export function finalRotation(
  index: number,
  count: number,
  current: number,
  turns: number,
  jitter: number
): number {
  const slice = FULL_TURN / count
  const aim = -(index + 0.5) * slice + jitter * JITTER * slice
  const base = (((aim - current) % FULL_TURN) + FULL_TURN) % FULL_TURN
  return current + turns * FULL_TURN + base
}

export function indexUnderPointer(rotation: number, count: number): number {
  const phase = ((-rotation % FULL_TURN) + FULL_TURN) % FULL_TURN
  return Math.floor(phase / (FULL_TURN / count)) % count
}

export function easeOutSpin(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - (1 - clamped) ** 3.2
}

export function paletteIndex(
  index: number,
  count: number,
  colors = ROULETTE_COLORS.length
): number {
  const base = index % colors
  if (index === count - 1 && count % colors === 1) return (base + 2) % colors
  return base
}

export function baseLabelFont(
  size: number,
  radius: number,
  count: number
): number {
  const arc = ((Math.PI * 2) / count) * radius * 0.62
  return Math.min(size * 0.05, arc * 0.6)
}

export function fitLabelFont(
  base: number,
  longest: number,
  available: number
): number {
  if (longest <= available) return base
  return Math.max(base * 0.62, (base * available) / longest)
}
