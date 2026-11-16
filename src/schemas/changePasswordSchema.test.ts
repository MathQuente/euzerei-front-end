import { describe, expect, it } from 'vitest'
import { makeChangePasswordSchema } from './changePasswordSchema'

const strong = 'uma-senha-nova-forte'

describe('makeChangePasswordSchema', () => {
  it('exige a senha atual quando a conta tem senha', () => {
    const result = makeChangePasswordSchema(true).safeParse({
      currentPassword: '',
      newPassword: strong,
      confirmPassword: strong,
    })
    expect(result.success).toBe(false)
  })

  it('dispensa a senha atual quando a conta não tem senha', () => {
    const result = makeChangePasswordSchema(false).safeParse({
      newPassword: strong,
      confirmPassword: strong,
    })
    expect(result.success).toBe(true)
  })

  it('recusa confirmação diferente', () => {
    const result = makeChangePasswordSchema(false).safeParse({
      newPassword: strong,
      confirmPassword: `${strong}x`,
    })
    expect(result.success).toBe(false)
  })

  it('recusa nova senha igual à atual', () => {
    const result = makeChangePasswordSchema(true).safeParse({
      currentPassword: strong,
      newPassword: strong,
      confirmPassword: strong,
    })
    expect(result.success).toBe(false)
  })

  it('recusa senha com menos de 8 caracteres', () => {
    const result = makeChangePasswordSchema(false).safeParse({
      newPassword: 'curta',
      confirmPassword: 'curta',
    })
    expect(result.success).toBe(false)
  })
})
