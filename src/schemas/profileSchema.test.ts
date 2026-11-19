import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createUpdateProfileSchema } from './profileSchema'

// O schema usa `instanceof FileList`, que não existe no Node dos testes.
beforeAll(() => {
  vi.stubGlobal('FileList', class FileList {})
})

const parse = (userName: string, original: string) =>
  createUpdateProfileSchema(() => original).safeParse({ userName })

describe('createUpdateProfileSchema', () => {
  it.each(['ana maria', 'joão', 'ab', 'McDonald'])(
    'accepts the legacy handle %s when it did not change',
    legacy => {
      const result = parse(legacy, legacy)
      expect(result.success).toBe(true)
      expect(result.data?.userName).toBe(legacy)
    }
  )

  it('applies the handle rules when the name changed', () => {
    expect(parse('novo nome', 'ana maria').success).toBe(false)
    expect(parse('ab', 'ana maria').success).toBe(false)
    expect(parse('admin', 'ana maria').success).toBe(false)
  })

  it('normalizes a valid new name', () => {
    expect(parse('  Novo_Nome ', 'ana maria').data?.userName).toBe('novo_nome')
  })

  it('reports the rule message for an invalid new name', () => {
    const result = parse('ab', 'ana maria')
    expect(result.error?.issues[0].message).toMatch(/pelo menos 3/)
  })
})
