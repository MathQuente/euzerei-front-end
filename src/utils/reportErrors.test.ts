import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { classifyReportError, retryWaitText } from './reportErrors'

function apiError(status: number, headers: Record<string, string> = {}) {
  return new AxiosError('falhou', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: {},
    statusText: '',
    headers,
    config: {} as never,
  })
}

describe('retryWaitText', () => {
  it('rounds up to whole minutes and pluralizes', () => {
    expect(retryWaitText(60)).toBe('em 1 minuto')
    expect(retryWaitText(61)).toBe('em 2 minutos')
    expect(retryWaitText(3600)).toBe('em 60 minutos')
    expect(retryWaitText(3541)).toBe('em 60 minutos')
  })

  it('says "em instantes" under a minute', () => {
    expect(retryWaitText(1)).toBe('em instantes')
    expect(retryWaitText(59)).toBe('em instantes')
  })

  it('gives up on a missing or nonsensical header', () => {
    expect(retryWaitText(Number.NaN)).toBeNull()
    expect(retryWaitText(0)).toBeNull()
    expect(retryWaitText(-5)).toBeNull()
  })
})

describe('classifyReportError', () => {
  it('treats 409 as already reported', () => {
    expect(classifyReportError(apiError(409))).toEqual({
      outcome: 'already',
      message: 'Você já denunciou esta análise.',
    })
  })

  it('treats 404 as gone', () => {
    expect(classifyReportError(apiError(404))).toEqual({
      outcome: 'gone',
      message: 'Esta análise não está mais disponível.',
    })
  })

  it('treats 403 as the own review', () => {
    expect(classifyReportError(apiError(403))).toMatchObject({
      outcome: 'own',
    })
  })

  it('leaves 401 to the global session handler', () => {
    expect(classifyReportError(apiError(401))).toEqual({
      outcome: 'session',
      message: null,
    })
  })

  it('tells how long to wait on 429 using Retry-After', () => {
    expect(
      classifyReportError(apiError(429, { 'retry-after': '1800' }))
    ).toEqual({
      outcome: 'retry',
      message: 'Você já enviou muitas denúncias. Tente de novo em 30 minutos.',
    })
  })

  it('falls back to "mais tarde" on 429 without Retry-After', () => {
    expect(classifyReportError(apiError(429))).toEqual({
      outcome: 'retry',
      message: 'Você já enviou muitas denúncias. Tente de novo mais tarde.',
    })
  })

  it.each([
    ['a 500', apiError(500)],
    ['a 502', apiError(502)],
    ['a network failure', new AxiosError('Network Error', 'ERR_NETWORK')],
    ['a plain error', new Error('boom')],
  ])('keeps the dialog open to retry on %s', (_name, error) => {
    expect(classifyReportError(error)).toEqual({
      outcome: 'retry',
      message: 'Não foi possível enviar a denúncia. Tente de novo.',
    })
  })
})
