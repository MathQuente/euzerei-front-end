import { describe, expect, it } from 'vitest'
import { buildProfileUpdate } from './profileUpdate'

const photo = { name: 'foto.png' } as File
const banner = { name: 'banner.png' } as File

describe('buildProfileUpdate', () => {
  it('does not send the name when only the photo changes', () => {
    expect(
      buildProfileUpdate(
        { userName: 'miyeonstan', profilePicture: photo },
        'miyeonstan',
        false
      )
    ).toEqual({ profilePicture: photo })
  })

  it('does not send the name when only the banner changes', () => {
    expect(
      buildProfileUpdate(
        { userName: 'miyeonstan', userBanner: banner },
        'miyeonstan',
        false
      )
    ).toEqual({ userBanner: banner })
  })

  it('sends the name exactly as typed when it changed', () => {
    expect(
      buildProfileUpdate({ userName: 'novo nome' }, 'miyeonstan', false)
    ).toEqual({ userName: 'novo nome' })
  })

  it('sends a name that only changes the case', () => {
    expect(
      buildProfileUpdate({ userName: 'Miyeonstan' }, 'miyeonstan', false)
    ).toEqual({ userName: 'Miyeonstan' })
  })

  it('sends nothing for an empty name', () => {
    expect(buildProfileUpdate({ userName: '' }, 'miyeonstan', false)).toEqual(
      {}
    )
  })

  it('removes the banner only when no new one was picked', () => {
    expect(buildProfileUpdate({}, 'a', true)).toEqual({ userBanner: null })
    expect(buildProfileUpdate({ userBanner: banner }, 'a', true)).toEqual({
      userBanner: banner,
    })
  })

  it('combines every change in one update', () => {
    expect(
      buildProfileUpdate(
        { userName: 'b', profilePicture: photo, userBanner: banner },
        'a',
        false
      )
    ).toEqual({ userName: 'b', profilePicture: photo, userBanner: banner })
  })
})
