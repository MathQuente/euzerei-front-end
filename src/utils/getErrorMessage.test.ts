import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './getErrorMessage'

function apiError(status: number, data: unknown) {
  return new AxiosError('falhou', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as never,
  })
}

describe('getErrorMessage', () => {
  it('mostra o motivo da senha vindo do servidor, no campo password', () => {
    const error = apiError(400, {
      message: 'Invalid input',
      error: { password: ['Essa senha é muito comum. Escolha outra.'] },
    })
    expect(getErrorMessage(error, 'padrão')).toBe(
      'Essa senha é muito comum. Escolha outra.'
    )
  })

  it('mostra o motivo da senha vindo do servidor, no campo newPassword', () => {
    const error = apiError(400, {
      message: 'Invalid input',
      error: { newPassword: ['Essa senha é muito comum. Escolha outra.'] },
    })
    expect(getErrorMessage(error, 'padrão')).toBe(
      'Essa senha é muito comum. Escolha outra.'
    )
  })

  it('não devolve só a primeira letra quando o erro do campo vem como texto', () => {
    const error = apiError(400, {
      message: 'Invalid input',
      error: { newPassword: 'Essa senha é muito comum' },
    })
    expect(getErrorMessage(error, 'padrão')).toBe('padrão')
  })

  it('usa a mensagem do servidor quando ela não é genérica', () => {
    const error = apiError(400, { message: 'A senha atual está incorreta.' })
    expect(getErrorMessage(error, 'padrão')).toBe(
      'A senha atual está incorreta.'
    )
  })

  it('cai no texto padrão quando a mensagem é genérica', () => {
    const error = apiError(400, { message: 'Invalid input' })
    expect(getErrorMessage(error, 'padrão')).toBe('padrão')
  })

  it('avisa de muitas tentativas no 429', () => {
    expect(getErrorMessage(apiError(429, {}), 'padrão')).toContain(
      'Muitas tentativas'
    )
  })
})
