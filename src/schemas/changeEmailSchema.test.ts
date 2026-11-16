import { describe, expect, it } from 'vitest'
import { makeChangeEmailSchema } from './changeEmailSchema'

describe('makeChangeEmailSchema', () => {
  it('aceita um e-mail válido e tira os espaços das pontas', () => {
    const result = makeChangeEmailSchema(true).safeParse({
      newEmail: '  novo@exemplo.com ',
      currentPassword: 'senha-atual-1',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.newEmail).toBe('novo@exemplo.com')
  })

  it('recusa um e-mail inválido', () => {
    const result = makeChangeEmailSchema(true).safeParse({
      newEmail: 'sem-arroba',
      currentPassword: 'x',
    })
    expect(result.success).toBe(false)
  })

  it('exige a senha atual quando a conta tem senha', () => {
    const result = makeChangeEmailSchema(true).safeParse({
      newEmail: 'novo@exemplo.com',
      currentPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('dispensa a senha quando a conta não tem senha', () => {
    const result = makeChangeEmailSchema(false).safeParse({
      newEmail: 'novo@exemplo.com',
    })
    expect(result.success).toBe(true)
  })
})
