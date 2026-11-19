import axios from 'axios'
import { ERROR_MESSAGES } from '../constants/messages'
import type { SortField, SortOrder } from '../interfaces/games'
import type {
  GetFollowersResponse,
  GetFollowingResponse,
  IsFollowingResponse,
  SearchUsersResponse,
} from '../types/follow'
import type {
  FavoriteGamesResponse,
  GameStatusEnum,
  RouletteResponse,
  UserGamesResponse,
} from '../types/games'
import type { StartImportResponse } from '../types/import'
import type {
  LibraryPlatform,
  PlatformConsole,
  UserGamePlatformPatch,
  UserGamePlatformsResponse,
} from '../types/platform'
import type {
  ConnectPsnResponse,
  PsnImportStatusResponse,
  PsnVerificationResponse,
} from '../types/psn'
import type { CreateRatingResponse } from '../types/rating'
import type {
  GetCommunityReviewsResponse,
  GetReviewResponse,
  UpsertReviewResponse,
} from '../types/review'
import type { SteamImportStatusResponse } from '../types/steam'
import type {
  AcceptSuggestionResponse,
  CompletionSuggestionsResponse,
  UndoSuggestionResponse,
} from '../types/suggestion'
import type {
  ImageUploadSignature,
  PublicUserProfileResponse,
  UpdateUserPayload,
  UserProfileResponse,
} from '../types/user'
import type { XboxImportStatusResponse } from '../types/xbox'
import { notify } from '../utils/notify'
import type { QUEUE_FILTER } from '../utils/queue'

export const SESSION_ENDED_EVENT = 'auth:session-ended'

let accountDeletionInProgress = false

export function setAccountDeletionInProgress(value: boolean) {
  accountDeletionInProgress = value
}

const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

http.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !accountDeletionInProgress) {
      const status = error.response.data?.status

      if (status === 'session_expired' || status === 'unauthorized') {
        window.dispatchEvent(new Event(SESSION_ENDED_EVENT))
      }
    }

    return Promise.reject(error)
  }
)

export class ImageRejectedError extends Error {
  constructor() {
    super('Image rejected by the upload service')
    this.name = 'ImageRejectedError'
  }
}

export type SignInProvider = 'google' | 'discord'

const PROVIDER_ORIGIN: Record<SignInProvider, string> = {
  google: 'https://accounts.google.com',
  discord: 'https://discord.com',
}

async function openPlatformSignIn(path: string, expectedOrigin: string) {
  const signInTab = window.open('', '_blank')
  if (signInTab) signInTab.opener = null

  try {
    const response = await http.post<{ url: string }>(path)
    const url = new URL(response.data.url)
    if (url.origin !== expectedOrigin) {
      throw new Error('Unexpected sign-in URL')
    }

    if (signInTab) signInTab.location.href = url.toString()
    else window.location.assign(url.toString())
  } catch (error) {
    signInTab?.close()
    throw error
  }
}

const LOGIN_ERROR_TOAST_ID = 'login-error'

export const api = {
  login: async (email: string, password: string) => {
    try {
      const response = await http.post('/auth/login', { email, password })
      setAccountDeletionInProgress(false)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify.failure(error, ERROR_MESSAGES.signIn, {
          id: LOGIN_ERROR_TOAST_ID,
        })
        return
      }

      notify.error(ERROR_MESSAGES.unexpected, { id: LOGIN_ERROR_TOAST_ID })
    }
  },
  signup: async (email: string, password: string, acceptedTerms: boolean) => {
    const response = await http.post<{ message: string }>('/auth/register', {
      email,
      password,
      acceptedTerms,
    })
    return response.data
  },
  confirmRegistration: async (token: string) => {
    const response = await http.post('/auth/register/confirm', { token })
    setAccountDeletionInProgress(false)
    return response.data
  },
  forgotPassword: async (email: string) => {
    try {
      const response = await http.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify.failure(error, ERROR_MESSAGES.requestPasswordReset)
        return
      }
      notify.error(ERROR_MESSAGES.unexpected)
    }
  },
  isResetTokenValid: async (token: string) => {
    const response = await http.post<{ valid: boolean }>(
      '/auth/reset-password/validate',
      { token }
    )
    return response.data.valid
  },
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await http.post('/auth/reset-password', {
        token,
        password,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify.failure(error, ERROR_MESSAGES.resetPassword)
        return
      }
      notify.error(ERROR_MESSAGES.unexpected)
    }
  },
  changePassword: async (body: {
    currentPassword?: string
    newPassword: string
  }) => {
    const response = await http.put<{ message: string }>('/auth/password', body)
    return response.data
  },
  requestEmailChange: async (body: {
    newEmail: string
    currentPassword?: string
  }) => {
    const response = await http.post<{ pendingEmail: string }>(
      '/auth/email-change',
      body
    )
    return response.data
  },
  resendEmailChange: async () => {
    const response = await http.post<{ pendingEmail: string }>(
      '/auth/email-change/resend'
    )
    return response.data
  },
  cancelEmailChange: async () => {
    await http.delete('/auth/email-change')
  },
  confirmEmailChange: async (token: string) => {
    const response = await http.post<{ message: string; email: string }>(
      '/auth/email-change/confirm',
      { token }
    )
    return response.data
  },
  startProviderLink: async (provider: SignInProvider) => {
    const response = await http.post<{ url: string }>(`/auth/${provider}/link`)
    const url = new URL(response.data.url)
    if (url.origin !== PROVIDER_ORIGIN[provider]) {
      throw new Error('Unexpected sign-in URL')
    }
    window.location.assign(url.toString())
  },
  unlinkProvider: async (
    provider: SignInProvider,
    currentPassword?: string
  ) => {
    await http.delete(`/auth/${provider}/link`, {
      data: currentPassword ? { currentPassword } : undefined,
    })
  },
  verifyEmail: async (token: string) => {
    const response = await http.post<{ message: string }>(
      '/auth/verify-email',
      { token }
    )
    return response.data
  },
  resendVerification: async () => {
    const response = await http.post<{ message: string }>(
      '/auth/resend-verification'
    )
    return response.data
  },
  logout: async () => {
    try {
      await http.post('/auth/logout')
    } catch {
    } finally {
      window.location.reload()
    }
  },
  deleteAccount: async () => {
    setAccountDeletionInProgress(true)
    try {
      await http.delete('/users')
    } catch (error) {
      setAccountDeletionInProgress(false)
      throw error
    }
  },
  getUserGames: async (
    page?: number,
    search?: string | undefined,
    filter?: GameStatusEnum | typeof QUEUE_FILTER,
    sortBy?: SortField,
    sortOrder?: SortOrder,
    platforms?: LibraryPlatform[]
  ) => {
    const USER_GAMES_SORT_BY_MAP = {
      name: 'gameName',
      releaseDate: 'dateRelease',
      rating: 'rating',
      hoursPlayed: 'hoursPlayed',
      completedAt: 'completedAt',
      droppedAt: 'droppedAt',
      lastPlayedAt: 'lastPlayedAt',
      dateAdded: 'dateAdded',
    } as const

    const response = await http.get('/users/userGames', {
      params: {
        pageIndex: page ? page - 1 : undefined,
        query: search || undefined,
        filter: filter,
        platforms: platforms?.length ? platforms.join(',') : undefined,
        sortBy: sortBy ? USER_GAMES_SORT_BY_MAP[sortBy] : undefined,
        sortOrder,
      },
    })
    return response.data
  },
  getUserProfile: async (userId: string | null) => {
    const response = await http.get<PublicUserProfileResponse>(
      `/users/${encodeURIComponent(String(userId))}`,
      {}
    )
    return response.data
  },
  getRoulette: async (count: number, exclude?: number) => {
    const response = await http.get<RouletteResponse>('/users/roulette', {
      params: { count, exclude },
    })
    return response.data
  },
  getUserFavorites: async (userId: string | null) => {
    const response = await http.get<FavoriteGamesResponse>(
      `/users/${encodeURIComponent(String(userId))}/favorites`,
      {}
    )
    return response.data
  },
  setFavorites: async (igdbIds: number[], mainIgdbId: number | null = null) => {
    const response = await http.put<FavoriteGamesResponse>(
      '/users/favorites',
      { igdbIds, mainIgdbId },
      {}
    )
    return response.data
  },
  getPublicUserGames: async (userId: string | null) => {
    const response = await http.get<UserGamesResponse>(
      `/users/${encodeURIComponent(String(userId))}/games`,
      {}
    )
    return response.data
  },
  getUserFollowers: async (userId: string | null) => {
    const response = await http.get<GetFollowersResponse>(
      `/users/${encodeURIComponent(String(userId))}/followers`,
      {}
    )
    return response.data
  },
  getUserFollowing: async (userId: string | null) => {
    const response = await http.get<GetFollowingResponse>(
      `/users/${encodeURIComponent(String(userId))}/following`,
      {}
    )
    return response.data
  },
  searchUsers: async (query: string) => {
    const response = await http.get<SearchUsersResponse>('/users', {
      params: { query },
    })
    return response.data
  },
  followUser: async (userId: string) => {
    const response = await http.post(
      `/follows/${encodeURIComponent(userId)}`,
      {},
      {}
    )
    return response.data
  },
  unfollowUser: async (userId: string) => {
    const response = await http.delete(
      `/follows/${encodeURIComponent(userId)}`,
      {}
    )
    return response
  },
  getFollowStatus: async (userId: string) => {
    const response = await http.get<IsFollowingResponse>(
      `/follows/status/${encodeURIComponent(userId)}`,
      {}
    )
    return response.data
  },
  getGames: async (
    page: number,
    search: string | undefined,
    sortBy: SortField,
    sortOrder: SortOrder,
    limit?: number
  ) => {
    const response = await http.get('/games', {
      params: {
        pageIndex: page - 1,
        query: search,
        sortBy,
        sortOrder,
        limit: limit ? limit : null,
      },
    })
    return response.data
  },
  searchGames: async (query: string, page: number, limit: number) => {
    const response = await http.get('/games', {
      params: {
        pageIndex: page - 1,
        query,
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit,
      },
    })
    return response.data
  },
  getGame: async (igdbId: string | undefined) => {
    const response = await http.get(
      `/games/${encodeURIComponent(String(igdbId))}`
    )
    return response.data
  },
  getGameBySlug: async (slug: string) => {
    const response = await http.get(`/games/slug/${encodeURIComponent(slug)}`)
    return response.data
  },
  getGameStatus: async (igdbId: string | undefined) => {
    const response = await http.get(`/users/gameStatus/${igdbId}`, {})
    return response.data
  },
  getSimilarGames: async (igdbId: string | undefined) => {
    const response = await http.get(`/games/similarGames/${igdbId}`)
    return response.data
  },
  addGame: async (igdbId: string | undefined, statusId: number) => {
    const response = await http.post(`/users/games/${igdbId}`, { statusId }, {})
    return response
  },
  updateGameStatus: async (igdbId: string | undefined, statusId: number) => {
    const response = await http.patch(
      `/users/gameStatus/${igdbId}`,
      { statusId },
      {}
    )
    return response
  },
  setEndless: async (igdbId: string | undefined, endless: boolean) => {
    const response = await http.put<{ igdbId: number; endless: boolean }>(
      `/users/endless/${igdbId}`,
      { endless },
      {}
    )
    return response.data
  },
  setHundredPercent: async (
    igdbId: string | undefined,
    hundredPercent: boolean
  ) => {
    const response = await http.put<{
      igdbId: number
      hundredPercent: boolean
    }>(`/users/hundred-percent/${igdbId}`, { hundredPercent }, {})
    return response.data
  },
  removeGame: async (igdbId: string | undefined) => {
    const response = await http.delete(`/users/games/${igdbId}`, {})
    return response
  },
  uploadFile: async (file: File) => {
    const { data: signed } = await http.post<ImageUploadSignature>(
      '/users/image-upload-signature'
    )

    // Cloudinary rejects any field that is not signed, so these are exactly
    // the signed ones plus api_key and signature.
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signed.apiKey)
    formData.append('timestamp', String(signed.timestamp))
    formData.append('folder', signed.folder)
    formData.append('public_id', signed.publicId)
    formData.append('allowed_formats', signed.allowedFormats)
    formData.append('upload_preset', signed.uploadPreset)
    formData.append('signature', signed.signature)

    try {
      const response = await axios.post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        formData
      )
      return response.data.secure_url
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new ImageRejectedError()
      }
      throw error
    }
  },
  updateUser: async (payload: UpdateUserPayload) => {
    const body: Record<string, string | null> = {}
    if (payload.userName !== undefined) body.userName = payload.userName
    if (payload.profilePicture !== undefined)
      body.profilePicture = payload.profilePicture
    if (payload.userBanner !== undefined) body.userBanner = payload.userBanner
    const response = await http.patch('/users', body, {})
    return response.data
  },
  getGameStats: async (igdbId: string | undefined) => {
    const response = await http.get(`/users/playedCount/${igdbId}`, {})
    return response.data
  },
  updateCompletionCount: async (
    igdbId: string | undefined,
    incrementValue: number
  ) => {
    const response = await http.patch(
      `/users/playedCount/${igdbId}`,
      { incrementValue },
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    )
    return response
  },
  getGamePlatforms: async (igdbId: string) => {
    const response = await http.get<UserGamePlatformsResponse>(
      `/users/platforms/${igdbId}`,
      {}
    )
    return response.data
  },
  addGamePlatform: async (
    igdbId: string,
    platform: LibraryPlatform,
    gameConsole: PlatformConsole
  ) => {
    const response = await http.put<UserGamePlatformsResponse>(
      `/users/platforms/${igdbId}/${platform}/${gameConsole}`,
      {},
      {}
    )
    return response.data
  },
  updateGamePlatform: async (
    igdbId: string,
    platform: LibraryPlatform,
    gameConsole: PlatformConsole,
    patch: UserGamePlatformPatch
  ) => {
    const response = await http.patch<UserGamePlatformsResponse>(
      `/users/platforms/${igdbId}/${platform}/${gameConsole}`,
      patch,
      {}
    )
    return response.data
  },
  removeGamePlatform: async (
    igdbId: string,
    platform: LibraryPlatform,
    gameConsole: PlatformConsole
  ) => {
    const response = await http.delete<UserGamePlatformsResponse>(
      `/users/platforms/${igdbId}/${platform}/${gameConsole}`,
      {}
    )
    return response.data
  },
  getGameHours: async (igdbId: string | undefined) => {
    const response = await http.get(`/users/hoursPlayed/${igdbId}`, {})
    return response.data
  },
  updateHoursPlayed: async (
    igdbId: string | undefined,
    hoursPlayed: number
  ) => {
    const response = await http.patch(
      `/users/hoursPlayed/${igdbId}`,
      { hoursPlayed },
      {}
    )
    return response
  },
  getGameCompletedAt: async (igdbId: string | undefined) => {
    const response = await http.get(`/users/completedAt/${igdbId}`, {})
    return response.data
  },
  updateCompletedAt: async (
    igdbId: string | undefined,
    completedAt: string
  ) => {
    const response = await http.patch(
      `/users/completedAt/${igdbId}`,
      { completedAt },
      {}
    )
    return response
  },
  addRatingForUserGame: async (
    igdbId: string | undefined,
    value: number | null
  ) => {
    const response = await http.post<CreateRatingResponse>(
      `/rating/${igdbId}`,
      { value },
      {}
    )
    return response
  },
  getUserGameRating: async (igdbId: string | undefined) => {
    const response = await http.get(`/rating/${igdbId}`, {})
    return response.data
  },
  removeRating: async (igdbId: string | undefined) => {
    const response = await http.delete(`/rating/${igdbId}`, {})
    return response
  },
  me: async () => {
    const response = await http.get<UserProfileResponse>('/users/me', {})
    return response.data
  },
  getGamesFeatured: async () => {
    const response = await http.get('/games/featured', {})
    return response.data
  },
  getAverageRating: async (igdbId: string | undefined) => {
    const response = await http.get(`/rating/${igdbId}/average`, {})
    return response.data
  },
  getRatingDistribution: async (igdbId: string | undefined) => {
    const response = await http.get(`/rating/ratingDistribution/${igdbId}`, {})
    return response.data
  },
  getGamesToDisplay: async () => {
    const response = await http.get('/users/featuredGames')
    return response.data
  },
  getOwnReview: async (igdbId: string | undefined) => {
    const response = await http.get<GetReviewResponse>(`/reviews/${igdbId}`, {})
    return response.data
  },
  upsertReview: async (igdbId: string | undefined, text: string) => {
    const response = await http.post<UpsertReviewResponse>(
      `/reviews/${igdbId}`,
      { text },
      {}
    )
    return response.data
  },
  deleteReview: async (igdbId: string | undefined) => {
    const response = await http.delete(`/reviews/${igdbId}`, {})
    return response
  },
  getCommunityReviews: async (
    igdbId: string | undefined,
    pageIndex: number,
    limit?: number
  ) => {
    const response = await http.get<GetCommunityReviewsResponse>(
      `/reviews/${igdbId}/community`,
      { params: { pageIndex, limit } }
    )
    return response.data
  },
  startSteamLink: () =>
    openPlatformSignIn('/users/steam/openid', 'https://steamcommunity.com'),
  disconnectSteam: async (accountId: string) => {
    await http.delete(`/users/steam/${accountId}`, {})
  },
  getSuggestions: async (platform: LibraryPlatform) => {
    const response = await http.get<CompletionSuggestionsResponse>(
      '/users/suggestions',
      { params: { platform } }
    )
    return response.data
  },
  acceptSuggestion: async (igdbId: number) => {
    const response = await http.post<AcceptSuggestionResponse>(
      `/users/suggestions/${igdbId}/accept`,
      {},
      {}
    )
    return response.data
  },
  dismissSuggestion: async (igdbId: number) => {
    await http.post(`/users/suggestions/${igdbId}/dismiss`, {}, {})
  },
  undoSuggestion: async (igdbId: number) => {
    const response = await http.post<UndoSuggestionResponse>(
      `/users/suggestions/${igdbId}/undo`,
      {},
      {}
    )
    return response.data
  },
  startSteamImport: async () => {
    const response = await http.post<StartImportResponse>(
      '/users/steam/import',
      {},
      {}
    )
    return response.data
  },
  getSteamImportStatus: async () => {
    const response = await http.get<SteamImportStatusResponse>(
      '/users/steam/import',
      {}
    )
    return response.data
  },
  requestPsnVerification: async (onlineId: string) => {
    const response = await http.post<PsnVerificationResponse>(
      '/users/psn/verification',
      { onlineId }
    )
    return response.data
  },
  connectPsn: async () => {
    const response = await http.patch<ConnectPsnResponse>('/users/psn', {})
    return response.data
  },
  disconnectPsn: async (accountId: string) => {
    await http.delete(`/users/psn/${accountId}`, {})
  },
  startPsnImport: async () => {
    const response = await http.post<StartImportResponse>(
      '/users/psn/import',
      {},
      {}
    )
    return response.data
  },
  getPsnImportStatus: async () => {
    const response = await http.get<PsnImportStatusResponse>(
      '/users/psn/import',
      {}
    )
    return response.data
  },
  startXboxLink: () =>
    openPlatformSignIn(
      '/users/xbox/oauth',
      'https://login.microsoftonline.com'
    ),
  disconnectXbox: async (accountId: string) => {
    await http.delete(`/users/xbox/${accountId}`, {})
  },
  startXboxImport: async () => {
    const response = await http.post<StartImportResponse>(
      '/users/xbox/import',
      {},
      {}
    )
    return response.data
  },
  getXboxImportStatus: async () => {
    const response = await http.get<XboxImportStatusResponse>(
      '/users/xbox/import',
      {}
    )
    return response.data
  },
  getComingSoon: async (
    page: number,
    search: string | undefined,
    sortOrder: SortOrder,
    sortBy: SortField,
    limit?: number
  ) => {
    const response = await http.get('/games/comingSoon', {
      params: {
        pageIndex: page - 1,
        query: search,
        sortBy,
        sortOrder,
        limit: limit ? limit : null,
      },
    })
    return response.data
  },
}
