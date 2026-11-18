import { easeOutSpin } from './roulette'

/**
 * Som da roleta (conjunto "Suave"): a cada divisória que passa sob a palheta,
 * um estalo curto de ruído filtrado; em baixa velocidade ganha um corpo tonal
 * pequeno. O instante de cada passagem sai da curva do giro, que é conhecida
 * de antemão, então tudo pode ser agendado de uma vez no relógio de áudio.
 */

export interface Crossing {
  /** Segundos desde o início do giro. */
  t: number
  /** Fatias por segundo nesse instante. */
  speed: number
}

const TIME_STEP_SECONDS = 0.0005
const SPEED_PROBE_SECONDS = 0.01

/** Quando cada divisória passa sob a palheta, usando a mesma regra de `indexUnderPointer`. */
export function crossingTimes(
  from: number,
  to: number,
  durationMs: number,
  count: number
): Crossing[] {
  if (durationMs <= 0 || count < 2) return []
  const seconds = durationMs / 1000
  const slice = 360 / count
  const angle = (t: number) => from + (to - from) * easeOutSpin(t / seconds)

  const crossings: Crossing[] = []
  let previous = Math.floor(-angle(0) / slice)
  for (let i = 1; i * TIME_STEP_SECONDS <= seconds; i++) {
    const t = i * TIME_STEP_SECONDS
    const current = Math.floor(-angle(t) / slice)
    if (current < previous) {
      const speed =
        Math.abs(angle(t + SPEED_PROBE_SECONDS) - angle(t)) /
        SPEED_PROBE_SECONDS /
        slice
      for (let k = previous - 1; k >= current; k--) crossings.push({ t, speed })
      previous = current
    }
  }
  return crossings
}

export const SOUND = {
  /** Velocidade (fatias/s) a partir da qual o corpo tonal já não soa. */
  fastSpeed: 80,
  clickSeconds: 0.012,
  clickQ: 2.2,
  clickGain: 0.5,
  clickFreq: 2800,
  clickFreqRise: 1400,
  bodyType: 'sine' as OscillatorType,
  bodyFreq: 300,
  bodyFreqRise: 0.25,
  bodySeconds: 0.03,
  bodyLowpass: 1400,
  bodyGain: 0.55 * 1.6,
  bodyAmount: 0.6,
  /** Abaixo disso o corpo é inaudível e nem é criado. */
  bodyFloor: 0.02,
  pitchVariation: 0.05,
  gainVariation: 0.08,
  resultNotes: [523, 659, 784],
  resultGain: 0.2,
  resultAttack: 0.06,
  resultDecay: 1.4,
}

export interface TickShape {
  /** 0 (devagar) a 1 (rápido). */
  speedRatio: number
  clickGain: number
  clickFreq: number
  /** 0 quando o corpo não deve soar. */
  bodyGain: number
  bodyFreq: number
}

export function tickShape(speed: number): TickShape {
  const v = Math.min(1, Math.max(0, speed / SOUND.fastSpeed))
  const clickGain = SOUND.clickGain * (1 - 0.3 * v)
  const weight = SOUND.bodyAmount * (1 - v) ** 2
  return {
    speedRatio: v,
    clickGain,
    clickFreq: SOUND.clickFreq + SOUND.clickFreqRise * v,
    bodyGain:
      weight > SOUND.bodyFloor ? clickGain * SOUND.bodyGain * weight : 0,
    bodyFreq: SOUND.bodyFreq * (1 + SOUND.bodyFreqRise * v),
  }
}
