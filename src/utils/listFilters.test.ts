import { describe, expect, it } from 'vitest'
import { parsePlatforms, platformsParam } from './listFilters'

describe('parsePlatforms', () => {
  it('reads known platforms without repeating them', () => {
    expect(parsePlatforms('STEAM,XBOX,STEAM')).toEqual(['STEAM', 'XBOX'])
  })

  it('drops unknown values and trims spaces', () => {
    expect(parsePlatforms('PLAYSTATION, nope ,EPIC')).toEqual([
      'PLAYSTATION',
      'EPIC',
    ])
  })

  it('is empty when there is nothing to read', () => {
    expect(parsePlatforms(null)).toEqual([])
    expect(parsePlatforms(undefined)).toEqual([])
    expect(parsePlatforms('')).toEqual([])
    expect(parsePlatforms('nope')).toEqual([])
  })
})

describe('platformsParam', () => {
  it('joins the list, or gives nothing when there is no filter', () => {
    expect(platformsParam(['STEAM', 'XBOX'])).toBe('STEAM,XBOX')
    expect(platformsParam([])).toBeUndefined()
  })
})
