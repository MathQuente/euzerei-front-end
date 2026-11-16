import { z } from 'zod'

export function makeChangeEmailSchema(hasPassword: boolean) {
  return z.object({
    newEmail: z.string().trim().email('Digite um e-mail válido'),
    currentPassword: hasPassword
      ? z.string().min(1, 'Informe a senha atual')
      : z.string().optional(),
  })
}

export type ChangeEmailValues = z.infer<
  ReturnType<typeof makeChangeEmailSchema>
>
