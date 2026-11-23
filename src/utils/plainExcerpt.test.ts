import { describe, expect, it } from 'vitest'
import { plainExcerpt } from './plainExcerpt'

describe('plainExcerpt', () => {
  it('removes emphasis, links, headings, quotes and list markers', () => {
    expect(
      plainExcerpt(
        '# Título\n**Muito** bom, *mesmo*. Veja [aqui](http://x.y).\n> citação\n- item um\n1. item dois'
      )
    ).toBe('Título Muito bom, mesmo. Veja aqui. citação item um item dois')
  })

  it('drops code blocks and keeps inline code text', () => {
    expect(plainExcerpt('antes ```js\nfoo()\n``` depois `x` fim')).toBe(
      'antes depois x fim'
    )
  })

  it('collapses whitespace and line breaks', () => {
    expect(plainExcerpt('a\n\n\n   b\t\tc')).toBe('a b c')
  })

  it('keeps snake_case words intact', () => {
    expect(plainExcerpt('o zz_author_x joga muito')).toBe(
      'o zz_author_x joga muito'
    )
  })

  it('removes underscore emphasis but only at word edges', () => {
    expect(plainExcerpt('um _texto_ e __forte__ aqui')).toBe(
      'um texto e forte aqui'
    )
  })

  it('cuts very long text with an ellipsis', () => {
    const out = plainExcerpt('a'.repeat(500))
    expect(out.length).toBe(281)
    expect(out.endsWith('…')).toBe(true)
  })

  it('returns an empty string for blank input', () => {
    expect(plainExcerpt('  \n ')).toBe('')
  })
})
