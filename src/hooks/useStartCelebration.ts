import { useEffect, useRef, useState } from 'react'
import type { GameCardData } from '../types/games'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const CELEBRATE_MS = 1300
const CELEBRATE_REDUCED_MS = 600

/**
 * Estado da celebração de "Começar a jogar". Vive acima da seção da home de
 * propósito: ao adicionar o primeiro jogo, a home troca de ramo e a seção é
 * remontada, e o estado local se perderia no meio da animação.
 */
export function useStartCelebration() {
  const [celebrate, setCelebrate] = useState<GameCardData | null>(null)
  const [finished, setFinished] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => () => clearTimeout(timer.current), [])

  function start(game: GameCardData) {
    clearTimeout(timer.current)
    setFinished(false)
    setCelebrate(game)
    timer.current = setTimeout(
      () => {
        setCelebrate(null)
        setFinished(true)
      },
      reducedMotion ? CELEBRATE_REDUCED_MS : CELEBRATE_MS
    )
  }

  return { celebrate, finished, start }
}
