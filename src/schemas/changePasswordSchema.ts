import { z } from 'zod'
import { passwordSchema } from './passwordSchema'

export function makeChangePasswordSchema(hasPassword: boolean) {
  return z
    .object({
      currentPassword: hasPassword
        ? z.string().min(1, 'Informe a senha atual')
        : z.string().optional(),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: 'As senhas não são iguais',
      path: ['confirmPassword'],
    })
    .refine(data => !hasPassword || data.newPassword !== data.currentPassword, {
      message: 'A nova senha precisa ser diferente da atual',
      path: ['newPassword'],
    })
}

export type ChangePasswordValues = z.infer<
  ReturnType<typeof makeChangePasswordSchema>
>
