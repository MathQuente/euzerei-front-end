import { describe, expect, it } from 'vitest'
import { CATALOG_PLATFORMS, parseCatalogPlatforms } from './catalogPlatforms'

describe('parseCatalogPlatforms', () => {
  it('reads known families, ignoring case, spaces and repeats', () => {
    expect(parseCatalogPlatforms('PC, xbox ,pc')).toEqual(['pc', 'xbox'])
  })

  it('ignores unknown values', () => {
    expect(parseCatalogPlatforms('sega,STEAM,nintendo')).toEqual(['nintendo'])
  })

  it('returns nothing without a value', () => {
    expect(parseCatalogPlatforms(null)).toEqual([])
    expect(parseCatalogPlatforms('')).toEqual([])
  })

  it('offers the same five families the API knows', () => {
    expect(CATALOG_PLATFORMS.map(option => option.value)).toEqual([
      'pc',
      'playstation',
      'xbox',
      'nintendo',
      'mobile',
    ])
  })
})
