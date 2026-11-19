import { describe, expect, it } from 'vitest'
import { parentGameLabel } from './parentGameLabel'

describe('parentGameLabel', () => {
  it('lists the parent of an expanded game as another version', () => {
    expect(parentGameLabel(10)).toEqual({
      heading: 'Outras versões',
      caption: 'Versão anterior',
    })
  })

  it('keeps Jogo Original for remakes, ports, DLCs and unknown types', () => {
    for (const category of [0, 1, 8, 9, 11, 13, undefined]) {
      expect(parentGameLabel(category)).toEqual({
        heading: 'Jogo Original',
        caption: 'Jogo base',
      })
    }
  })
})
