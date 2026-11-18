import { describe, expect, it } from 'vitest'
import {
  countdownKind,
  countdownSpoken,
  formatCountdown,
  formatReleaseLabel,
  isExactDate,
  isFarAway,
  releaseMoment,
  shortCountdown,
  shortReleaseLabel,
} from './releaseDate'

// 19/11/2026 00:00 UTC. O lançamento "começa" às 03:00 UTC (00:00 em Brasília).
const GTA = Date.UTC(2026, 10, 19) / 1000
const MOMENT = Date.UTC(2026, 10, 19, 3)
const HOUR = 3_600_000

describe('formatReleaseLabel', () => {
  const NEW_YEAR_EVE = Date.UTC(2026, 11, 31) / 1000
  const DEC_1 = Date.UTC(2026, 11, 1) / 1000

  it('mostra a data completa quando é exata ou desconhecida', () => {
    expect(formatReleaseLabel(GTA, 'day')).toBe('19/11/2026')
    expect(formatReleaseLabel(GTA)).toBe('19/11/2026')
    expect(formatReleaseLabel(GTA, null)).toBe('19/11/2026')
  })

  it('adapta o texto à precisão', () => {
    expect(formatReleaseLabel(DEC_1, 'month')).toBe('dez/2026')
    expect(formatReleaseLabel(NEW_YEAR_EVE, 'year')).toBe('2026')
    expect(formatReleaseLabel(NEW_YEAR_EVE, 'q4')).toBe('T4 2026')
    expect(formatReleaseLabel(NEW_YEAR_EVE, 'q1')).toBe('T1 2026')
    expect(formatReleaseLabel(NEW_YEAR_EVE, 'tbd')).toBe('A confirmar')
  })

  it('tem versão curta para colunas estreitas', () => {
    expect(shortReleaseLabel(GTA, 'day')).toBe('19/11')
    expect(shortReleaseLabel(DEC_1, 'month')).toBe('dez')
    expect(shortReleaseLabel(NEW_YEAR_EVE, 'year')).toBe('2026')
    expect(shortReleaseLabel(NEW_YEAR_EVE, 'q4')).toBe('T4')
    expect(shortReleaseLabel(NEW_YEAR_EVE, 'tbd')).toBe('?')
  })
})

describe('isExactDate', () => {
  it('só considera inexata quando a API informa outra precisão', () => {
    expect(isExactDate(undefined)).toBe(true)
    expect(isExactDate(null)).toBe(true)
    expect(isExactDate('day')).toBe(true)
    expect(isExactDate('month')).toBe(false)
    expect(isExactDate('tbd')).toBe(false)
  })
})

describe('releaseMoment', () => {
  it('é 00:00 de Brasília (03:00 UTC) do dia do lançamento', () => {
    expect(releaseMoment(GTA)).toBe(MOMENT)
  })
})

describe('countdownKind', () => {
  it('é "later" com mais de 24 h, contando dias para cima', () => {
    expect(countdownKind(GTA, 'day', MOMENT - 24 * HOUR - 1000).kind).toBe(
      'later'
    )
    expect(countdownKind(GTA, 'day', MOMENT - 24 * HOUR - 1000).days).toBe(2)
    expect(countdownKind(GTA, 'day', MOMENT - 5 * 24 * HOUR).days).toBe(5)
  })

  it('vira "last-day" em exatas 24 h e guarda o que falta', () => {
    const state = countdownKind(GTA, 'day', MOMENT - 24 * HOUR)
    expect(state.kind).toBe('last-day')
    expect(state.ms).toBe(24 * HOUR)
    expect(countdownKind(GTA, 'day', MOMENT - 1000).ms).toBe(1000)
  })

  it('vira "today" no instante do lançamento e dura 24 h', () => {
    expect(countdownKind(GTA, 'day', MOMENT).kind).toBe('today')
    expect(countdownKind(GTA, 'day', MOMENT + 24 * HOUR - 1).kind).toBe('today')
    expect(countdownKind(GTA, 'day', MOMENT + 24 * HOUR).kind).toBe('released')
  })

  it('não conta quando a data não é exata', () => {
    expect(countdownKind(GTA, 'year', MOMENT - HOUR).kind).toBe('uncertain')
    expect(countdownKind(GTA, 'tbd', MOMENT - HOUR).kind).toBe('uncertain')
  })

  it('funciona na virada de mês e de ano', () => {
    const jan1 = Date.UTC(2027, 0, 1) / 1000
    const state = countdownKind(jan1, 'day', Date.UTC(2026, 11, 31, 12))
    expect(state.kind).toBe('last-day')
    expect(state.ms).toBe(15 * HOUR)
  })
})

describe('formatCountdown', () => {
  it('formata HH:MM:SS com 24:00:00 no limite', () => {
    expect(formatCountdown(24 * HOUR)).toBe('24:00:00')
    expect(formatCountdown(11 * HOUR + 42 * 60_000 + 5000)).toBe('11:42:05')
    expect(formatCountdown(0)).toBe('00:00:00')
  })

  it('arredonda os segundos para cima e nunca fica negativo', () => {
    expect(formatCountdown(1)).toBe('00:00:01')
    expect(formatCountdown(59_001)).toBe('00:01:00')
    expect(formatCountdown(-5000)).toBe('00:00:00')
  })
})

describe('shortCountdown e countdownSpoken', () => {
  it('arredonda para baixo como um relógio', () => {
    expect(shortCountdown(12 * HOUR + 46 * 60_000 + 12_000)).toEqual({
      value: '12',
      unit: 'horas',
    })
    expect(shortCountdown(24 * HOUR)).toEqual({ value: '24', unit: 'horas' })
    expect(shortCountdown(HOUR)).toEqual({ value: '1', unit: 'hora' })
    expect(shortCountdown(59 * 60_000 + 59_000)).toEqual({
      value: '59',
      unit: 'min',
    })
    expect(shortCountdown(30_000)).toEqual({ value: '<1', unit: 'min' })
  })

  it('fala horas e minutos com plural correto', () => {
    expect(countdownSpoken(11 * HOUR + 42 * 60_000)).toBe(
      '11 horas e 42 minutos'
    )
    expect(countdownSpoken(HOUR + 60_000)).toBe('1 hora e 1 minuto')
    expect(countdownSpoken(2 * HOUR)).toBe('2 horas')
    expect(countdownSpoken(30_000)).toBe('1 minuto')
    expect(countdownSpoken(0)).toBe('menos de 1 minuto')
  })
})

describe('isFarAway', () => {
  it('mostra a data em vez de "N dias" depois de 30 dias', () => {
    expect(isFarAway(30)).toBe(false)
    expect(isFarAway(31)).toBe(true)
  })
})
