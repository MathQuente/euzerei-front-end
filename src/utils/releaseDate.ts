const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const MINUTE_MS = 60_000
const COUNTDOWN_MAX_DAYS = 30
/** O contador conta até 00:00 de Brasília (UTC−3 fixo) do dia do lançamento. */
const BRASILIA_OFFSET_MS = 3 * HOUR_MS

/** Quão exata é a data de lançamento (campo `releaseDatePrecision` da API). */
export type ReleasePrecision =
  | 'day'
  | 'month'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'year'
  | 'tbd'

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

const pad = (n: number) => String(n).padStart(2, '0')

function toDate(ts: number) {
  return new Date(ts * 1000)
}

export function formatReleaseDate(ts: number) {
  const d = toDate(ts)
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

export function formatReleaseDayMonth(ts: number) {
  const d = toDate(ts)
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`
}

export function releaseYear(ts: number) {
  return toDate(ts).getUTCFullYear()
}

export function daysUntilRelease(ts: number, now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((ts * 1000 - today) / DAY_MS)
}

/** Sem precisão informada (cópias antigas) a data é tratada como exata. */
export function isExactDate(precision?: ReleasePrecision | null) {
  return precision === undefined || precision === null || precision === 'day'
}

/** Data por extenso conforme a precisão: 19/11/2026, dez/2026, T4 2026, 2026. */
export function formatReleaseLabel(
  ts: number,
  precision?: ReleasePrecision | null
) {
  if (isExactDate(precision)) return formatReleaseDate(ts)
  const d = toDate(ts)
  if (precision === 'month') {
    return `${MONTHS[d.getUTCMonth()]}/${d.getUTCFullYear()}`
  }
  if (precision === 'year') return String(d.getUTCFullYear())
  if (precision === 'tbd') return 'A confirmar'
  return `${String(precision).toUpperCase().replace('Q', 'T')} ${d.getUTCFullYear()}`
}

/** Versão curta para colunas estreitas: dez, T4, 2026, ?. */
export function shortReleaseLabel(
  ts: number,
  precision?: ReleasePrecision | null
) {
  if (isExactDate(precision)) return formatReleaseDayMonth(ts)
  const d = toDate(ts)
  if (precision === 'month') return MONTHS[d.getUTCMonth()]
  if (precision === 'year') return String(d.getUTCFullYear())
  if (precision === 'tbd') return '?'
  return String(precision).toUpperCase().replace('Q', 'T')
}

/** Instante (ms) em que o dia do lançamento começa em Brasília. */
export function releaseMoment(ts: number) {
  return ts * 1000 + BRASILIA_OFFSET_MS
}

export type CountdownKind =
  | 'later'
  | 'last-day'
  | 'today'
  | 'released'
  | 'uncertain'

/**
 * `later`: faltam mais de 24 h (`days` inteiros, arredondado para cima).
 * `last-day`: faltam 24 h ou menos (`ms`). `today`: o dia do lançamento
 * começou há menos de 24 h. `released`: já passou. `uncertain`: data não exata.
 */
export function countdownKind(
  ts: number,
  precision: ReleasePrecision | null | undefined,
  nowMs: number
): { kind: CountdownKind; ms: number; days: number } {
  if (!isExactDate(precision)) return { kind: 'uncertain', ms: 0, days: 0 }
  const remaining = releaseMoment(ts) - nowMs
  if (remaining > DAY_MS) {
    return { kind: 'later', ms: remaining, days: Math.ceil(remaining / DAY_MS) }
  }
  if (remaining > 0) return { kind: 'last-day', ms: remaining, days: 1 }
  if (remaining > -DAY_MS) return { kind: 'today', ms: 0, days: 0 }
  return { kind: 'released', ms: 0, days: 0 }
}

/** Mais de 30 dias a lista mostra a data em vez de "N dias". */
export function isFarAway(days: number) {
  return days > COUNTDOWN_MAX_DAYS
}

/** HH:MM:SS, arredondando os segundos para cima (24:00:00 no limite). */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  return `${pad(hours)}:${pad(minutes)}:${pad(total % 60)}`
}

/**
 * Versão curta para colunas estreitas, arredondando para baixo como um
 * relógio: 12h46 vira "12 horas", 46 min vira "46 min", menos de 1 min vira "<1 min".
 */
export function shortCountdown(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / MINUTE_MS))
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return { value: String(hours), unit: hours === 1 ? 'hora' : 'horas' }
  }
  if (minutes >= 1) return { value: String(minutes), unit: 'min' }
  return { value: '<1', unit: 'min' }
}

/** "11 horas e 42 minutos", para leitor de tela; "menos de 1 minuto" no último minuto. */
export function countdownSpoken(ms: number) {
  if (ms <= 0) return 'menos de 1 minuto'
  const totalMinutes = Math.max(0, Math.ceil(ms / MINUTE_MS))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const h = `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const m = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  if (hours > 0 && minutes > 0) return `${h} e ${m}`
  return hours > 0 ? h : m
}

/** Dia do lançamento (AAAA-MM-DD, UTC) a partir do timestamp em segundos da API. */
export function releaseDay(
  seconds: number | null | undefined
): string | undefined {
  if (!seconds) return undefined
  return new Date(seconds * 1000).toISOString().slice(0, 10)
}
