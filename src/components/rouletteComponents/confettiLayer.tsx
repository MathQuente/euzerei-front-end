import { useEffect, useRef } from 'react'
import {
  confettiOpacity,
  spawnConfetti,
  stepConfetti,
} from '../../utils/confetti'
import { ROULETTE_COLORS } from '../../utils/roulette'

const COLORS = [...ROULETTE_COLORS.map(color => color.background), '#ffffff']
const FRAME_MS = 16.67

export function ConfettiLayer({ burst }: { burst: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || burst === 0) return

    const ratio = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    let pieces = spawnConfetti(width, height, COLORS)
    let last = performance.now()
    let raf = 0

    const draw = (now: number) => {
      const frames = Math.min(40, now - last) / FRAME_MS
      last = now
      context.clearRect(0, 0, width, height)
      pieces = pieces.filter(piece => stepConfetti(piece, frames, height))
      for (const piece of pieces) {
        context.save()
        context.globalAlpha = confettiOpacity(piece)
        context.translate(piece.x, piece.y)
        context.rotate(piece.rotation)
        context.scale(1, Math.abs(Math.cos(piece.rotation * 1.7)) * 0.8 + 0.2)
        context.fillStyle = piece.color
        context.fillRect(
          -piece.width / 2,
          -piece.height / 2,
          piece.width,
          piece.height
        )
        context.restore()
      }
      if (pieces.length > 0) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      context.clearRect(0, 0, width, height)
    }
  }, [burst])

  if (burst === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-confetti"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}
