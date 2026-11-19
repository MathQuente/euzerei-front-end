import { describe, expect, it } from 'vitest'
import { handleLabel } from './handleLabel'

describe('handleLabel', () => {
  it('põe o @ na frente do nome', () => {
    expect(handleLabel('matheusdesousa')).toBe('@matheusdesousa')
  })

  it('usa o texto reserva sem nome', () => {
    expect(handleLabel(null)).toBe('Usuário')
    expect(handleLabel('')).toBe('Usuário')
  })
})
