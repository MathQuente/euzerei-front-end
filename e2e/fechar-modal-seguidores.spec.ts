import { type Page, expect, test } from '@playwright/test'
import { mockApi } from './support'

const OWNER = { id: 'a1111111-1111-4111-8111-111111111111', name: 'dona' }
const FOLLOWER = { id: 'b2222222-2222-4222-8222-222222222222', name: 'fa' }

const profile = (id: string, userName: string, followersCount: number) => ({
  id,
  userName,
  profilePicture: null,
  userBanner: null,
  gamesAmount: 0,
  totalHoursPlayed: 0,
  followersCount,
  followingCount: 0,
})

const EMPTY_GAMES = {
  games: {
    PLAYED: [],
    PLAYING: [],
    PAUSED: [],
    BACKLOG: [],
    WISHLIST: [],
    DROPPED: [],
  },
  totalPerStatus: [],
  total: 0,
}

async function mockProfiles(page: Page) {
  await mockApi(page, { signedIn: true })
  for (const person of [OWNER, FOLLOWER]) {
    const followers = person === OWNER ? [FOLLOWER] : []
    await page.route(`**/api/users/${person.name}`, route =>
      route.fulfill({
        status: 200,
        json: { user: profile(person.id, person.name, followers.length) },
      })
    )
    await page.route(`**/api/users/${person.id}/games`, route =>
      route.fulfill({ status: 200, json: EMPTY_GAMES })
    )
    await page.route(`**/api/users/${person.id}/favorites`, route =>
      route.fulfill({ status: 200, json: { games: [] } })
    )
    await page.route(`**/api/users/${person.id}/followers`, route =>
      route.fulfill({
        status: 200,
        json: {
          followers: followers.map(f => ({
            id: f.id,
            userName: f.name,
            profilePicture: null,
          })),
        },
      })
    )
    await page.route(`**/api/users/${person.id}/following`, route =>
      route.fulfill({ status: 200, json: { following: [] } })
    )
    await page.route(`**/api/follows/**`, route =>
      route.fulfill({ status: 200, json: { isFollowing: false } })
    )
  }
}

test('clicar num perfil da lista de seguidores fecha o modal e abre o outro perfil', async ({
  page,
}) => {
  await mockProfiles(page)
  await page.goto(`/users/${OWNER.name}`)

  await page.getByRole('button', { name: /seguidor/ }).click()
  const dialog = page.getByRole('dialog', { name: /Seguidores/ })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('link', { name: new RegExp(FOLLOWER.name) }).click()

  await expect(page).toHaveURL(new RegExp(`/users/${FOLLOWER.name}$`))
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
