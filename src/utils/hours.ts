const hoursFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

const NBSP = '\u00a0'

/** Minutos inteiros de uma duração abaixo de 1 h; 0 quando não chega a meio minuto. */
function wholeMinutes(hours: number) {
  return Math.round(hours * 60)
}

/** Dura menos de 1 h (e mais de zero): aparece como minutos. */
export function isUnderOneHour(hours: number) {
  return hours > 0 && wholeMinutes(hours) < 60
}

const hoursCompactFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

/** Campo de horas: sem zeros à esquerda e com no máximo uma casa decimal (5,53 vira 5,5). */
export function sanitizeHoursInput(raw: string) {
  return raw.replace(/^0+(?=\d)/, '').replace(/([.,]\d).*$/, '$1')
}

export const NO_HOURS_LABEL = 'sem horas registradas'

export function formatHours(hours: number) {
  if (isUnderOneHour(hours)) {
    const minutes = wholeMinutes(hours)
    return minutes < 1 ? `<1${NBSP}min` : `${minutes}${NBSP}min`
  }
  return `${hoursFormat.format(hours)}${NBSP}h`
}

export function formatHoursCompact(hours: number) {
  if (isUnderOneHour(hours)) return formatHours(hours)
  return `${hoursCompactFormat.format(hours)} h`
}

export function formatHoursOrNone(hours: number | null) {
  return hours === null ? NO_HOURS_LABEL : formatHours(hours)
}

export function formatHoursSpoken(hours: number) {
  if (isUnderOneHour(hours)) {
    const minutes = wholeMinutes(hours)
    if (minutes < 1) return 'menos de 1 minuto'
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  const value = hoursFormat.format(hours)
  return `${value} ${value === '1' ? 'hora' : 'horas'}`
}

/**
 * "jogados" com minutos ("46 min jogados") e "jogadas" com horas ("4,2 h
 * jogadas"): o particípio concorda com o gênero da palavra, e a abreviatura
 * segue o gênero da palavra inteira (minuto é masculino, hora é feminino).
 */
export function playedWord(hours: number) {
  return isUnderOneHour(hours) ? 'jogados' : 'jogadas'
}

export function formatHoursPlayedSpoken(hours: number) {
  return `${formatHoursSpoken(hours)} ${playedWord(hours)}`
}
