import { type Crossing, SOUND, tickShape } from './rouletteSound'

const STORAGE_KEY = 'rouletteSound'
const MASTER_GAIN = 0.32
/** Avanço do áudio sobre o relógio, para dar tempo de agendar antes da primeira passagem. */
const LEAD_SECONDS = 0.1
/** Teto do atraso de saída que somamos ao giro visual. */
const MAX_OUTPUT_LATENCY_SECONDS = 0.12
const MIN_GAIN = 0.0001

type Listener = () => void

let context: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let spinGain: GainNode | null = null
const listeners = new Set<Listener>()

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

let enabled = readEnabled()

export function isSoundEnabled() {
  return enabled
}

export function subscribeSound(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function ensureContext(): AudioContext | null {
  if (context) return context
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  try {
    context = new Ctor()
    const compressor = context.createDynamicsCompressor()
    master = context.createGain()
    master.gain.value = MASTER_GAIN
    master.connect(compressor)
    compressor.connect(context.destination)
    return context
  } catch {
    context = null
    return null
  }
}

/** Cria ou retoma o áudio. Precisa rodar dentro de um clique, antes de qualquer `await`. */
export function unlock() {
  if (!enabled) return
  const audio = ensureContext()
  if (audio?.state === 'suspended') audio.resume().catch(() => undefined)
}

export function setSoundEnabled(next: boolean) {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {}
  if (next) unlock()
  else cancelSpinSound()
  for (const listener of listeners) listener()
}

function noiseBuffer(audio: AudioContext) {
  if (noise) return noise
  const length = Math.round(audio.sampleRate * 0.1)
  noise = audio.createBuffer(1, length, audio.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

function shapeEnvelope(
  gain: GainNode,
  when: number,
  peak: number,
  attack: number,
  decay: number
) {
  gain.gain.setValueAtTime(MIN_GAIN, when)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(peak, MIN_GAIN * 2),
    when + attack
  )
  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, when + attack + decay)
}

function vary(amount: number) {
  return 1 + amount * (Math.random() * 2 - 1)
}

function scheduleTick(
  audio: AudioContext,
  destination: AudioNode,
  when: number,
  speed: number
) {
  const shape = tickShape(speed)
  const pitch = vary(SOUND.pitchVariation)
  const level = vary(SOUND.gainVariation)

  const click = audio.createBufferSource()
  click.buffer = noiseBuffer(audio)
  const band = audio.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = shape.clickFreq * pitch
  band.Q.value = SOUND.clickQ
  const clickGain = audio.createGain()
  shapeEnvelope(
    clickGain,
    when,
    shape.clickGain * level * 0.9,
    0.001,
    SOUND.clickSeconds
  )
  click.connect(band)
  band.connect(clickGain)
  clickGain.connect(destination)
  click.start(when, Math.random() * 0.05)
  click.stop(when + SOUND.clickSeconds + 0.02)

  if (shape.bodyGain <= 0) return
  const body = audio.createOscillator()
  body.type = SOUND.bodyType
  body.frequency.value = shape.bodyFreq * pitch
  const low = audio.createBiquadFilter()
  low.type = 'lowpass'
  low.frequency.value = SOUND.bodyLowpass
  const bodyGain = audio.createGain()
  shapeEnvelope(
    bodyGain,
    when,
    shape.bodyGain * level,
    0.002,
    SOUND.bodySeconds
  )
  body.connect(bodyGain)
  bodyGain.connect(low)
  low.connect(destination)
  body.start(when)
  body.stop(when + SOUND.bodySeconds + 0.04)
}

/**
 * Agenda todos os estalos do giro no relógio de áudio. Devolve o instante
 * (`performance.now()`) em que o giro visual deve começar, para som e palheta
 * baterem, ou `null` quando não há som. Os dois relógios são lidos juntos,
 * antes do laço que cria os nós, para o tempo gasto agendando não atrasar o giro.
 */
export function scheduleSpin(crossings: Crossing[]) {
  if (!enabled || crossings.length === 0) return null
  const audio = ensureContext()
  if (!audio || !master || audio.state === 'closed') return null
  if (audio.state === 'suspended') audio.resume().catch(() => undefined)
  cancelSpinSound()
  const clockNow = performance.now()
  const start = audio.currentTime + LEAD_SECONDS
  const gain = audio.createGain()
  gain.connect(master)
  spinGain = gain
  for (const { t, speed } of crossings) {
    scheduleTick(audio, gain, start + t, speed)
  }
  const latency = Math.min(
    MAX_OUTPUT_LATENCY_SECONDS,
    audio.outputLatency || audio.baseLatency || 0
  )
  return clockNow + (LEAD_SECONDS + latency) * 1000
}

export function cancelSpinSound() {
  const gain = spinGain
  const audio = context
  if (!gain || !audio) return
  spinGain = null
  gain.gain.cancelScheduledValues(audio.currentTime)
  gain.gain.setTargetAtTime(0, audio.currentTime, 0.01)
  setTimeout(() => gain.disconnect(), 200)
}

/** Acorde curto de resultado, quando a roda já parou. */
export function playResult() {
  if (!enabled) return
  const audio = ensureContext()
  if (!audio || !master || audio.state === 'closed') return
  if (audio.state === 'suspended') audio.resume().catch(() => undefined)
  const when = audio.currentTime + 0.02
  for (const frequency of SOUND.resultNotes) {
    const osc = audio.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency
    const gain = audio.createGain()
    shapeEnvelope(
      gain,
      when,
      SOUND.resultGain,
      SOUND.resultAttack,
      SOUND.resultDecay
    )
    osc.connect(gain)
    gain.connect(master)
    osc.start(when)
    osc.stop(when + SOUND.resultAttack + SOUND.resultDecay + 0.05)
  }
}
