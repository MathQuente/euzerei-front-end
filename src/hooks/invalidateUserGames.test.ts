import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { invalidateUserGames } from './invalidateUserGames'

const profile = (id: string) => ({ user: { id, userName: 'ana' } })

describe('invalidateUserGames', () => {
  it('invalidates the profile cached by handle, not only the one cached by id', () => {
    const client = new QueryClient()
    client.setQueryData(['publicUserProfile', 'ana'], profile('u1'))
    client.setQueryData(['publicUserProfile', 'u1'], profile('u1'))
    client.setQueryData(['publicUserProfile', 'bia'], profile('u2'))

    invalidateUserGames(client, 'u1')

    expect(
      client.getQueryState(['publicUserProfile', 'ana'])?.isInvalidated
    ).toBe(true)
    expect(
      client.getQueryState(['publicUserProfile', 'u1'])?.isInvalidated
    ).toBe(true)
    expect(
      client.getQueryState(['publicUserProfile', 'bia'])?.isInvalidated
    ).toBe(false)
  })
})
