import type { Page, Request, Route } from '@playwright/test'

export const IGDB_ID = 1942
export const VIEWER_ID = '11111111-1111-4111-8111-111111111111'
export const AUTHOR_A = '22222222-2222-4222-8222-222222222222'
export const AUTHOR_B = '33333333-3333-4333-8333-333333333333'

export interface ReviewRow {
  userId: string
  userName: string | null
  profilePicture: string | null
  rating: number | null
  hoursPlayed: number
  completions: number
  status: string | null
  endless: boolean
  text: string
  createdAt: string
  reportedByMe?: boolean
}

export function reviewRow(
  userId: string,
  userName: string,
  overrides: Partial<ReviewRow> = {}
): ReviewRow {
  return {
    userId,
    userName,
    profilePicture: null,
    rating: 4,
    hoursPlayed: 12,
    completions: 1,
    status: 'PLAYED',
    endless: false,
    text: `Análise de ${userName}`,
    createdAt: '2026-01-10T12:00:00.000Z',
    reportedByMe: false,
    ...overrides,
  }
}

export interface ReportCall {
  url: string
  body: unknown
}

export interface ApiMock {
  listCalls: () => number
  reportCalls: () => ReportCall[]
}

export interface ApiMockOptions {
  signedIn?: boolean
  /** Linhas devolvidas pela listagem a cada chamada (índice = nº da chamada). */
  list?: (call: number) => ReviewRow[]
  /** Resposta da denúncia a cada chamada (índice = nº da chamada, começando em 0). */
  report?: (
    call: number,
    request: Request
  ) => Parameters<Route['fulfill']>[0] | 'abort'
}

const GAME = {
  igdbId: IGDB_ID,
  slug: 'the-witcher-3',
  name: 'The Witcher 3',
  coverUrl: null,
  releaseDate: 1431907200,
  platforms: ['PC'],
  rating: 90,
  genres: ['RPG'],
  summary: 'Resumo.',
  category: 0,
  parentGameId: null,
}

const ME = {
  id: VIEWER_ID,
  email: 'zz-viewer@example.test',
  emailVerified: true,
  hasPassword: true,
  userName: 'viewer',
  profilePicture: '',
  userBanner: '',
  gamesAmount: 0,
  totalHoursPlayed: 0,
  steamAccounts: [],
  psnAccounts: [],
  xboxAccounts: [],
  followersCount: 0,
  followingCount: 0,
}

/**
 * Intercepta TODO `/api/*`: o que não estiver aqui é abortado, então nenhum teste
 * chega ao lib real. As rotas ficam por ordem de registro (a última vence).
 */
export async function mockApi(
  page: Page,
  options: ApiMockOptions = {}
): Promise<ApiMock> {
  const { signedIn = true } = options
  const list = options.list ?? (() => [reviewRow(AUTHOR_A, 'autora')])
  let listCalls = 0
  const reports: ReportCall[] = []

  await page.route(
    url => url.pathname.startsWith('/api/'),
    route => route.abort('blockedbyclient')
  )

  await page.route('**/api/users/me', route =>
    signedIn
      ? route.fulfill({ status: 200, json: { user: ME } })
      : route.fulfill({
          status: 401,
          contentType: 'application/problem+json',
          json: { status: 'unauthorized', message: 'Unauthorized' },
        })
  )
  await page.route(`**/api/games/${IGDB_ID}`, route =>
    route.fulfill({ status: 200, json: { game: GAME, relatedGames: [] } })
  )
  await page.route(`**/api/reviews/${IGDB_ID}`, route =>
    route.fulfill({ status: 200, json: { review: null } })
  )
  await page.route(`**/api/reviews/${IGDB_ID}/community**`, route => {
    const rows = list(listCalls++)
    return route.fulfill({
      status: 200,
      json: { reviews: rows, total: rows.length },
    })
  })
  await page.route(`**/api/reviews/${IGDB_ID}/authors/*/reports`, route => {
    const request = route.request()
    const call = reports.length
    reports.push({ url: request.url(), body: request.postDataJSON() })
    const answer = options.report?.(call, request) ?? {
      status: 201,
      json: { reported: true },
    }
    if (answer === 'abort') return route.abort('failed')
    return route.fulfill(answer)
  })

  return {
    listCalls: () => listCalls,
    reportCalls: () => reports,
  }
}

export function problem(status: number, headers: Record<string, string> = {}) {
  return {
    status,
    headers,
    contentType: 'application/problem+json',
    json: { status, message: 'x' },
  }
}
