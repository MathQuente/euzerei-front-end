import { describe, expect, it } from 'vitest'
import {
  getAvailableLibraryPlatforms,
  platformsOfferedFor,
} from './libraryPlatforms'
import {
  consoleGroupsFor,
  consoleOptionLabel,
  consolesForGame,
} from './platformConsoles'

const parent = {
  platforms: ['PlayStation 4', 'PC (Microsoft Windows)', 'Xbox One'],
}

describe('platformsOfferedFor', () => {
  it('offers Xbox on PC for a Windows port whose parent has Xbox', () => {
    const offered = platformsOfferedFor({
      platforms: ['PC (Microsoft Windows)'],
      category: 11,
      parentGame: parent,
    })
    const consoles = [...(consolesForGame(offered) ?? [])]
    expect(getAvailableLibraryPlatforms(offered).map(p => p.value)).toContain(
      'XBOX'
    )
    expect(consoles).toContain('PC')
    expect(consoles).not.toContain('XBOX_ONE')
  })

  it.each([0, 1, 5, 13])('leaves category %i untouched', category => {
    const platforms = ['PC (Microsoft Windows)']
    expect(
      platformsOfferedFor({ platforms, category, parentGame: parent })
    ).toBe(platforms)
  })

  it('leaves a port alone when the parent has no Xbox', () => {
    const platforms = ['PC (Microsoft Windows)']
    expect(
      platformsOfferedFor({
        platforms,
        category: 11,
        parentGame: { platforms: ['PlayStation 4'] },
      })
    ).toBe(platforms)
  })
})

describe('Xbox console options', () => {
  it('shows only PC for a Windows port offered on Xbox', () => {
    const offered = platformsOfferedFor({
      platforms: ['PC (Microsoft Windows)'],
      category: 11,
      parentGame: parent,
    })
    const groups = consoleGroupsFor('XBOX', consolesForGame(offered))
    expect(groups.flatMap(g => g.consoles)).toEqual(['PC'])
    expect(consoleOptionLabel('XBOX', 'PC')).toBe('PC (Xbox / Game Pass)')
    expect(consoleOptionLabel('STEAM', 'PC')).toBe('PC')
  })

  it('shows the consoles the game was released on, plus PC', () => {
    const groups = consoleGroupsFor(
      'XBOX',
      consolesForGame(['Xbox One', 'PC (Microsoft Windows)'])
    )
    expect(groups.flatMap(g => g.consoles)).toEqual([
      'XBOX_ONE',
      'XBOX_SERIES',
      'PC',
    ])
  })
})
