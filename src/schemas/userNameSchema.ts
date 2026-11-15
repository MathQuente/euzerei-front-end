import { z } from 'zod'

export const MAX_USER_NAME_LENGTH = 30

export const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Campo vazio' })
  .max(MAX_USER_NAME_LENGTH, {
    message: `O nome pode ter no máximo ${MAX_USER_NAME_LENGTH} caracteres`,
  })
