import { useEffect, useRef } from 'react'
import {
  type CountdownKind,
  type ReleasePrecision,
  countdownKind,
} from '../utils/releaseDate'
import { useNowSelector } from './useNow'

export interface ReleaseCountdown {
  kind: CountdownKind | 'none'
  /** Tempo que falta no último dia, arredondado para a granularidade pedida. */
  ms: number
  /** Dias que faltam quando `kind` é `later`. */
  days: number
}

const NONE: ReleaseCountdown = { kind: 'none', ms: 0, days: 0 }

interface Options {
  /** `second` re-renderiza a cada segundo no último dia; `minute`, a cada minuto. */
  granularity?: 'second' | 'minute'
  /** Chamado uma vez quando o contador chega a zero com a página aberta. */
  onRelease?: () => void
}

/**
 * Estado do contador de lançamento. Antes das últimas 24 h o componente só
 * re-renderiza quando o número de dias muda; no último dia, a cada segundo ou
 * minuto conforme `granularity`.
 */
export function useReleaseCountdown(
  releaseDate: number | null | undefined,
  precision: ReleasePrecision | null | undefined,
  { granularity = 'minute', onRelease }: Options = {}
): ReleaseCountdown {
  const unit = granularity === 'second' ? 1000 : 60_000

  const key = useNowSelector(now => {
    if (!releaseDate) return 'none'
    const state = countdownKind(releaseDate, precision, now)
    if (state.kind === 'last-day') {
      // Por segundo arredonda para cima (como o HH:MM:SS); por minuto, para
      // baixo (como um relógio: 12h46 fica 12 h, não 13).
      const rounded = granularity === 'second' ? Math.ceil : Math.floor
      return `last-day:${rounded(state.ms / unit)}`
    }
    return state.kind === 'later' ? `later:${state.days}` : `${state.kind}:0`
  })

  const [kind, value] = key.split(':')
  const previous = useRef(kind)
  const release = useRef(onRelease)
  release.current = onRelease

  useEffect(() => {
    if (previous.current === 'last-day' && kind === 'today') release.current?.()
    previous.current = kind
  }, [kind])

  if (kind === 'none') return NONE
  const amount = Number(value)
  return {
    kind: kind as CountdownKind,
    ms: kind === 'last-day' ? amount * unit : 0,
    days: kind === 'later' ? amount : 0,
  }
}
