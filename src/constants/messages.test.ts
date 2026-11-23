import { describe, expect, it } from 'vitest'
import {
  ERROR_MESSAGES,
  INFO_MESSAGES,
  OAUTH_ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './messages'

function allTexts() {
  const texts: string[] = []
  for (const group of [SUCCESS_MESSAGES, ERROR_MESSAGES, INFO_MESSAGES]) {
    for (const value of Object.values(group)) {
      if (typeof value === 'string') texts.push(value)
      else if (typeof value === 'function') texts.push(value('Exemplo'))
    }
  }
  return texts
}

describe('toast messages', () => {
  it('has no emoji and ends every sentence with a period', () => {
    for (const text of allTexts()) {
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u)
      expect(text.endsWith('.')).toBe(true)
    }
  })

  it('writes every error as "what failed, what to do"', () => {
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      const text = typeof value === 'function' ? value('Steam') : value
      expect(text, key).toMatch(
        /Tente de novo|Confira|Selecione|Algo deu errado/
      )
    }
  })

  it('does not print "undefined" when the verification email is missing', () => {
    expect(SUCCESS_MESSAGES.verificationLinkSent(undefined)).toBe(
      'Enviamos um novo link para o seu email.'
    )
    expect(SUCCESS_MESSAGES.verificationLinkSent('a@b.com')).toBe(
      'Enviamos um novo link para a@b.com.'
    )
  })
})

describe('OAuth error messages', () => {
  it('explains a suspended account with the same text as the password login', () => {
    expect(OAUTH_ERROR_MESSAGES.account_suspended).toBe(
      'Esta conta está suspensa. Fale com o suporte.'
    )
  })

  it('has no emoji and ends every sentence with a period', () => {
    for (const text of Object.values(OAUTH_ERROR_MESSAGES)) {
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u)
      expect(text.endsWith('.')).toBe(true)
    }
  })
})
