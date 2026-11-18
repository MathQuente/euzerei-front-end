import { z } from 'zod'
import { userNameSchema } from './userNameSchema'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3
const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/gif',
  'image/jpeg',
  'image/webp',
]

export const updateProfileSchema = z.object({
  userName: userNameSchema,
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
