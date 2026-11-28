import { describe, expect, it } from 'vitest'
import { brToIso, isoToBr, maskDate, parseIso, toIsoDate } from './dateInput'

describe('dateInput', () => {
  it('converte ISO em dd/mm/aaaa', () => {
    expect(isoToBr('2025-03-03')).toBe('03/03/2025')
    expect(isoToBr('')).toBe('')
  })

  it('lê a data no fuso local, sem recuar um dia', () => {
    const date = parseIso('2025-03-03')
    expect(date?.getDate()).toBe(3)
    expect(date && toIsoDate(date)).toBe('2025-03-03')
  })

  it('recusa data que não existe', () => {
    expect(parseIso('2023-02-29')).toBeNull()
    expect(parseIso('2024-02-29')).not.toBeNull()
    expect(parseIso('lixo')).toBeNull()
  })
})

describe('digitação', () => {
  it('aplica a máscara enquanto digita', () => {
    expect(maskDate('1')).toBe('1')
    expect(maskDate('120')).toBe('12/0')
    expect(maskDate('12032024')).toBe('12/03/2024')
    expect(maskDate('12/03/2024999')).toBe('12/03/2024')
  })

  it('lê dd/mm/aaaa e recusa o que não existe', () => {
    expect(brToIso('05/03/2024')).toBe('2024-03-05')
    expect(brToIso('31/02/2024')).toBeNull()
    expect(brToIso('05/03')).toBeNull()
  })
})

describe('data antiga', () => {
  it('uma data real de 1212 existe, o limite é outra regra', () => {
    expect(brToIso('12/12/1212')).toBe('1212-12-12')
  })
})
