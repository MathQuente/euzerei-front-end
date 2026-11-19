import { z } from 'zod'
import { userNameSchema } from './userNameSchema'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3
const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/gif',
  'image/jpeg',
  'image/webp',
]

/**
 * O nome só passa pelas regras de handle quando mudou: quem tem um handle de
 * antes das regras (espaço, acento, maiúscula) ainda precisa trocar só a foto.
 * Sem mudança, o valor volta exatamente como está, sem virar minúscula.
 */
export const createUpdateProfileSchema = (getOriginalUserName: () => string) =>
  z.object({
    userName: z.string().transform((value, ctx) => {
      if (value === getOriginalUserName()) return value
      const result = userNameSchema.safeParse(value)
      if (result.success) return result.data
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: 'custom', message: issue.message })
      }
      return z.NEVER
    }),
    profilePicture: z
      .instanceof(FileList)
      .optional()
      .transform(list => list?.item(0))
      .refine(file => {
        return !file || file.size <= MAX_UPLOAD_SIZE
      }, 'O arquivo precisa ter menos de 3MB')
      .refine(file => {
        return !file || ACCEPTED_FILE_TYPES.includes(file.type)
      }, 'O arquivo precisa ser PNG, JPEG, GIF ou WebP'),
    userBanner: z
      .instanceof(FileList)
      .optional()
      .transform(list => list?.item(0))
      .refine(file => {
        return !file || file.size <= MAX_UPLOAD_SIZE
      }, 'O arquivo precisa ter menos de 3MB')
      .refine(file => {
        return !file || ACCEPTED_FILE_TYPES.includes(file.type)
      }, 'O arquivo precisa ser PNG, JPEG, GIF ou WebP'),
  })
