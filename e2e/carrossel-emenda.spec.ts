import { expect, test } from '@playwright/test'
import { mockApi } from './support'
const game = (i: number) => ({
  igdbId: 100 + i,
  slug: `jogo-${i}`,
  name: `Jogo ${i}`,
  coverUrl: null,
  releaseDate: 1431907200,
  platforms: ['PC'],
  rating: 80,
  genres: ['RPG'],
  summary: 's',
  category: 0,
  parentGameId: null,
})
for (const count of [2, 3, 5]) {
  test(`carrossel ${count} capas: a emenda do loop mantém o espaço`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 400, height: 800 })
    await mockApi(page, { signedIn: false })
    await page.route('**/api/games/featured', r =>
      r.fulfill({
        status: 200,
        json: {
          recentGames: Array.from({ length: count }, (_, i) => game(i)),
          futureGames: [],
          trendingGames: [],
          mostRatedGames: [],
        },
      })
    )
    await page.goto('/')
    await page.waitForSelector('ul.touch-pan-y li')
    const mins: number[] = []
    for (let t = 0; t < 90; t++) {
      if (t % 6 === 0)
        await page
          .getByLabel('Próximas capas')
          .click({ force: true })
          .catch(() => {})
      const gaps = await page.evaluate(() => {
        const li = Array.from(document.querySelectorAll('ul.touch-pan-y li'))
          .map(e => e.getBoundingClientRect())
          .sort((a, b) => a.left - b.left)
        return li.slice(1).map((r, i) => Math.round(r.left - li[i].right))
      })
      mins.push(Math.min(...gaps))
      await page.waitForTimeout(120)
    }
    console.log(`count=${count} minGap=${Math.min(...mins)}`)
    expect(Math.min(...mins)).toBeGreaterThanOrEqual(11)
  })
}
