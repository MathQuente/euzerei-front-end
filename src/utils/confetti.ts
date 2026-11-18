export interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  spin: number
  width: number
  height: number
  color: string
  age: number
  life: number
}

const RAIN_PIECES = 230
const JET_PIECES = 90
const FADE_FROM = 0.8

function makePiece(
  random: () => number,
  color: string,
  x: number,
  y: number,
  vx: number,
  vy: number,
  life: number
): ConfettiPiece {
  return {
    x,
    y,
    vx,
    vy,
    rotation: random() * Math.PI * 2,
    spin: (random() - 0.5) * 0.35,
    width: 7 + random() * 7,
    height: 4 + random() * 5,
    color,
    age: 0,
    life,
  }
}

export function spawnConfetti(
  width: number,
  height: number,
  colors: readonly string[],
  random: () => number = Math.random
): ConfettiPiece[] {
  const color = () => colors[Math.floor(random() * colors.length)]
  const pieces: ConfettiPiece[] = []

  for (let i = 0; i < RAIN_PIECES; i++) {
    pieces.push(
      makePiece(
        random,
        color(),
        random() * width,
        -20 - random() * height * 0.6,
        (random() - 0.5) * 1.6,
        1.6 + random() * 3.2,
        420
      )
    )
  }

  for (let i = 0; i < JET_PIECES; i++) {
    const angle = ((-90 + (random() * 2 - 1) * 65) * Math.PI) / 180
    const speed = 8 + random() * 11
    pieces.push(
      makePiece(
        random,
        color(),
        width / 2,
        height * 0.55,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        190
      )
    )
  }

  return pieces
}

export function stepConfetti(
  piece: ConfettiPiece,
  frames: number,
  height: number
): boolean {
  piece.age += frames
  if (piece.age > piece.life || piece.y > height + 30) return false

  const drag = 0.99 ** frames
  piece.vx *= drag
  piece.vy = Math.min(5.5, piece.vy * drag + 0.09 * frames)
  piece.x +=
    piece.vx * frames + Math.sin(piece.age * 0.09 + piece.rotation) * 0.5
  piece.y += piece.vy * frames
  piece.rotation += piece.spin * frames
  return true
}

export function confettiOpacity(piece: ConfettiPiece): number {
  const fadeStart = piece.life * FADE_FROM
  if (piece.age <= fadeStart) return 1
  return Math.max(0, 1 - (piece.age - fadeStart) / (piece.life - fadeStart))
}
