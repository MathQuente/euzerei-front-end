import { z } from 'zod'

export const MIN_USER_NAME_LENGTH = 3
export const MAX_USER_NAME_LENGTH = 30

/** Espelha o backend: minúsculas, números, `_` e `-`; borda com letra ou número. */
export const USER_NAME_REGEX = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/

export const RESERVED_USER_NAMES: ReadonlySet<string> = new Set([
  'me',
  'roulette',
  'favorites',
  'usergames',
  'featuredgames',
  'gamestatus',
  'games',
  'endless',
  'hundred-percent',
  'platforms',
  'playedcount',
  'hoursplayed',
  'completedat',
  'image-upload-signature',
  'handle-available',
  'steam',
  'psn',
  'xbox',
  'suggestions',
  'followers',
  'following',
  'admin',
  'api',
  'null',
  'undefined',
])

export const userNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'Campo vazio' })
  .min(MIN_USER_NAME_LENGTH, {
    message: `O nome precisa ter pelo menos ${MIN_USER_NAME_LENGTH} caracteres`,
  })
  .max(MAX_USER_NAME_LENGTH, {
    message: `O nome pode ter no máximo ${MAX_USER_NAME_LENGTH} caracteres`,
  })
  .regex(USER_NAME_REGEX, {
    message:
      'Use só letras, números, _ e -, começando e terminando com letra ou número',
  })
  .refine(name => !RESERVED_USER_NAMES.has(name), {
    message: 'Este nome não está disponível',
  })
