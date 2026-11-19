import { describe, expect, it } from 'vitest'
import { userPath } from './userPath'

describe('userPath', () => {
  it('usa o handle quando existe', () => {
    expect(userPath({ id: 'abc', userName: 'matheus-silva' })).toBe(
      '/users/matheus-silva'
    )
  })

  it('cai para o id sem handle', () => {
    expect(userPath({ id: 'abc', userName: null })).toBe('/users/abc')
    expect(userPath({ id: 'abc' })).toBe('/users/abc')
  })

  it('codifica o que não é seguro na URL', () => {
    expect(userPath({ id: 'abc', userName: 'a b' })).toBe('/users/a%20b')
  })
})
