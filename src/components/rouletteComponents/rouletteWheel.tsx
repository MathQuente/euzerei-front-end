import {
  type Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { UserGameEntry } from '../../types/games'
import {
  MIN_LABEL_FONT,
  ROULETTE_COLORS,
  baseLabelFont,
  easeOutSpin,
  finalRotation,
  fitLabelFont,
  indexUnderPointer,
  paletteIndex,
  randomInt,
} from '../../utils/roulette'

const RIM_COLOR = '#f3f0ff'
const HOVER_COLOR = '#f7b71d'
const DROP_COLOR = '#14151d'
const MARK_COLOR = '#ffffff'
const SKELETON_COLORS = ['#2a2c38', '#323443']
const SKELETON_SLICES = 24
const FLICK_SLICES_PER_SECOND = 24

export interface RouletteWheelHandle {
  spinTo: (index: number, durationMs: number, turns: number) => Promise<void>
}

interface RouletteWheelProps {
  games: UserGameEntry[]
  winnerIndex: number | null
  loading: boolean
  disabled: boolean
  onSpin: () => void
  onReadout: (name: string) => void
  hubRef: Ref<HTMLButtonElement>
}

function geometry(size: number) {
  const rim = Math.max(5, size * 0.014)
  return { rim, radius: size / 2 - rim, center: size / 2 }
}

function prepareCanvas(canvas: HTMLCanvasElement, size: number) {
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(size * ratio)
  canvas.height = Math.round(size * ratio)
  const context = canvas.getContext('2d')
  if (!context) return null
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, size, size)
  return context
}

function fitToWidth(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  if (context.measureText(text).width <= maxWidth) return text
  let chars = Array.from(text)
  while (
    chars.length > 3 &&
    context.measureText(`${chars.join('')}…`).width > maxWidth
  ) {
    chars = chars.slice(0, -1)
  }
  return `${chars.join('').trimEnd()}…`
}

function drawWheel(
  canvas: HTMLCanvasElement,
  size: number,
  games: UserGameEntry[],
  skeleton: boolean
) {
  const context = prepareCanvas(canvas, size)
  if (!context) return
  const { rim, radius, center } = geometry(size)
  const count = skeleton ? SKELETON_SLICES : games.length
  if (count < 1) return
  const slice = (Math.PI * 2) / count

  for (let i = 0; i < count; i++) {
    context.beginPath()
    context.moveTo(center, center)
    context.arc(
      center,
      center,
      radius,
      -Math.PI / 2 + i * slice,
      -Math.PI / 2 + (i + 1) * slice
    )
    context.closePath()
    const color = skeleton
      ? SKELETON_COLORS[i % 2]
      : ROULETTE_COLORS[paletteIndex(i, count)].background
    context.fillStyle = color
    context.fill()
    context.lineWidth = 0.75
    context.strokeStyle = color
    context.stroke()
  }

  const base = baseLabelFont(size, radius, count)
  if (!skeleton && base >= MIN_LABEL_FONT) {
    const family = getComputedStyle(document.body).fontFamily
    const edge = radius - size * 0.035
    const available = radius - size * 0.15 - size * 0.035
    context.font = `700 ${base}px ${family}`
    const longest = Math.max(
      ...games.map(game => context.measureText(game.name).width)
    )
    context.font = `700 ${fitLabelFont(base, longest, available)}px ${family}`
    context.textAlign = 'right'
    context.textBaseline = 'middle'
    games.forEach((game, i) => {
      context.save()
      context.translate(center, center)
      context.rotate(-Math.PI / 2 + (i + 0.5) * slice)
      context.fillStyle = ROULETTE_COLORS[paletteIndex(i, count)].text
      context.fillText(fitToWidth(context, game.name, available), edge, 0)
      context.restore()
    })
  }

  context.beginPath()
  context.arc(center, center, size / 2 - rim / 2, 0, Math.PI * 2)
  context.lineWidth = rim
  context.strokeStyle = RIM_COLOR
  context.stroke()
}

function drawMark(
  canvas: HTMLCanvasElement,
  size: number,
  count: number,
  index: number | null
) {
  const context = prepareCanvas(canvas, size)
  if (!context || index === null || count < 1) return
  const { radius, center } = geometry(size)
  const slice = (Math.PI * 2) / count
  context.beginPath()
  context.moveTo(center, center)
  context.arc(
    center,
    center,
    radius - 2,
    -Math.PI / 2 + index * slice,
    -Math.PI / 2 + (index + 1) * slice
  )
  context.closePath()
  context.lineJoin = 'round'
  context.lineWidth = Math.max(3, size * 0.008)
  context.strokeStyle = MARK_COLOR
  context.stroke()
}

export const RouletteWheel = forwardRef<
  RouletteWheelHandle,
  RouletteWheelProps
>(function RouletteWheel(
  { games, winnerIndex, loading, disabled, onSpin, onReadout, hubRef },
  ref
) {
  const boxRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<HTMLDivElement>(null)
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null)
  const markCanvasRef = useRef<HTMLCanvasElement>(null)
  const dropRef = useRef<SVGGElement>(null)
  const rotation = useRef(0)
  const frame = useRef(0)
  const settle = useRef<(() => void) | null>(null)
  const readout = useRef(onReadout)
  const sample = useRef(games)
  const [size, setSize] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    readout.current = onReadout
  }, [onReadout])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    setSize(Math.round(box.getBoundingClientRect().width))
    const observer = new ResizeObserver(([entry]) =>
      setSize(Math.round(entry.contentRect.width))
    )
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const cancelSpin = useCallback(() => {
    cancelAnimationFrame(frame.current)
    const done = settle.current
    settle.current = null
    done?.()
  }, [])

  useEffect(() => cancelSpin, [cancelSpin])

  const redraw = useCallback(() => {
    if (!wheelCanvasRef.current || size === 0) return
    drawWheel(wheelCanvasRef.current, size, games, loading)
  }, [games, size, loading])

  useEffect(() => {
    redraw()
    if (document.fonts?.status !== 'loading') return
    let active = true
    document.fonts.ready.then(() => {
      if (active) redraw()
    })
    return () => {
      active = false
    }
  }, [redraw])

  useEffect(() => {
    if (!markCanvasRef.current || size === 0) return
    drawMark(
      markCanvasRef.current,
      size,
      games.length,
      loading ? null : winnerIndex
    )
  }, [games, size, loading, winnerIndex])

  useEffect(() => {
    if (sample.current === games) return
    sample.current = games
    cancelSpin()
    rotation.current = 0
    if (rotorRef.current) rotorRef.current.style.transform = 'rotate(0deg)'
  })

  const flick = useCallback(() => {
    const drop = dropRef.current
    if (!drop || typeof drop.animate !== 'function') return
    drop.animate(
      [{ transform: 'rotate(-14deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 130, easing: 'cubic-bezier(.2,.8,.2,1)' }
    )
  }, [])

  const spinTo = useCallback(
    (index: number, durationMs: number, turns: number) =>
      new Promise<void>(resolve => {
        cancelSpin()
        const finish = () => {
          settle.current = null
          resolve()
        }
        settle.current = finish
        const count = games.length
        const rotor = rotorRef.current
        const from = rotation.current
        const jitter = (randomInt(2001) - 1000) / 1000
        const to = finalRotation(index, count, from, turns, jitter)
        const apply = (angle: number) => {
          if (rotor) rotor.style.transform = `rotate(${angle}deg)`
        }

        if (durationMs <= 0 || !rotor) {
          rotation.current = to
          apply(to)
          finish()
          return
        }

        const sliceAngle = 360 / count
        const startedAt = performance.now()
        let lastIndex = -1
        let lastAt = startedAt
        let lastAngle = from

        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / durationMs)
          const angle = from + (to - from) * easeOutSpin(progress)
          rotation.current = angle
          apply(angle)

          const under = indexUnderPointer(angle, count)
          if (under !== lastIndex) {
            lastIndex = under
            readout.current(games[under].name)
            const slicesPerSecond =
              ((Math.abs(angle - lastAngle) / Math.max(1, now - lastAt)) *
                1000) /
              sliceAngle
            if (slicesPerSecond < FLICK_SLICES_PER_SECOND) flick()
          }
          lastAt = now
          lastAngle = angle

          if (progress < 1) {
            frame.current = requestAnimationFrame(tick)
          } else {
            rotation.current = to
            apply(to)
            finish()
          }
        }
        frame.current = requestAnimationFrame(tick)
      }),
    [games, flick, cancelSpin]
  )

  useImperativeHandle(ref, () => ({ spinTo }), [spinTo])

  return (
    <div
      ref={boxRef}
      className="relative aspect-square w-[min(88vw,560px)] overflow-hidden rounded-full drop-shadow-[0_20px_28px_rgba(0,0,0,0.5)]"
    >
      <div
        ref={rotorRef}
        aria-hidden="true"
        className="absolute inset-0 will-change-transform"
      >
        <canvas ref={wheelCanvasRef} className="absolute inset-0 size-full" />
        <canvas ref={markCanvasRef} className="absolute inset-0 size-full" />
      </div>
      <button
        ref={hubRef}
        type="button"
        aria-label="Sortear"
        disabled={disabled}
        onClick={onSpin}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="absolute left-1/2 top-1/2 z-10 aspect-square w-[17%] min-w-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-white disabled:cursor-default"
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="50"
            fill={hovered && !disabled ? HOVER_COLOR : RIM_COLOR}
            style={{ transition: 'fill 150ms' }}
          />
          <g ref={dropRef} style={{ transformOrigin: '50px 50px' }}>
            <path
              d="M50 -14 C58 4 88 22 88 50 A38 38 0 0 1 12 50 C12 22 42 4 50 -14 Z"
              fill={DROP_COLOR}
            />
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="800"
              style={{ fontFamily: 'inherit', letterSpacing: '0.02em' }}
            >
              SORTEAR
            </text>
          </g>
        </svg>
      </button>
    </div>
  )
})
