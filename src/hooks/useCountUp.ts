import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const DURATION_MS = 1100

export function useCountUp(value: number, enabled: boolean) {
  const reduced = usePrefersReducedMotion()
  const animated = enabled && !reduced && value > 0
  const [shown, setShown] = useState(animated ? 0 : value)

  useEffect(() => {
    if (!animated) {
      setShown(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      setShown(Math.round(value * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animated, value])

  return animated ? shown : value
}
