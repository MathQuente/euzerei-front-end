import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { useContext, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { z } from 'zod'
import { AuthContext } from '../contexts/auth/authContext'
import { signUpSchema } from '../schemas/signUpSchema'

import { focusRing } from '../styles/focus'
import { AuthInput } from './authInput'
import { Button } from './button'
import { DiscordAuthButton } from './discordAuthButton'
import { GoogleAuthButton } from './googleAuthButton'

type SignUpForm = z.infer<typeof signUpSchema>

export function FormSignUp() {
  const auth = useContext(AuthContext)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { acceptedTerms: false },
  })
  const termsMessageId = useId()
  const acceptedTerms = watch('acceptedTerms')

  async function onSubmit(data: SignUpForm) {
    const signupError = await auth.signup(
      data.email,
      data.password,
      data.acceptedTerms
    )
    if (!signupError) {
      setSentTo(data.email)
      return
    }

    setError(signupError.field, { message: signupError.message })
  }

  if (sentTo) {
    return (
      <div aria-live="polite" className="flex flex-col gap-3 py-6 text-center">
        <h2 className="font-display text-xl font-extrabold text-white">
          Confira seu e-mail
        </h2>
        <p className="text-sm text-gray-300">
          Se{' '}
          <span className="break-words font-medium text-white">{sentTo}</span>{' '}
          puder ser usado, enviamos um link para concluir o cadastro. Ele vale
          por 24 horas.
        </p>
        <p className="text-xs text-gray-400">
          Não chegou? Veja a pasta de spam. Se você já tem conta, o e-mail avisa
          isso e mostra como entrar.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className={`mx-auto mt-2 rounded-sm text-sm text-primary-link hover:underline ${focusRing}`}
        >
          Usar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <AuthInput
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        icon={<Mail size={18} />}
        error={errors.email}
        {...register('email')}
      />

      <AuthInput
        id="password"
        label="Senha"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={18} />}
        error={errors.password}
        {...register('password')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start max-sm:items-center gap-2.5 text-[13px] leading-normal text-gray-300 cursor-pointer max-sm:min-h-11">
          <input
            type="checkbox"
            aria-invalid={errors.acceptedTerms ? true : undefined}
            aria-describedby={termsMessageId}
            className={`mt-0.5 max-sm:mt-0 size-4 shrink-0 cursor-pointer accent-primary rounded-sm ${focusRing}`}
            {...register('acceptedTerms')}
          />
          <span>
            Li e aceito os{' '}
            <Link
              to="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-primary-link underline underline-offset-2 rounded-sm ${focusRing}`}
            >
              Termos de uso
              <span className="sr-only"> (abre em nova aba)</span>
            </Link>{' '}
            e a{' '}
            <Link
              to="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-primary-link underline underline-offset-2 rounded-sm ${focusRing}`}
            >
              Política de privacidade
              <span className="sr-only"> (abre em nova aba)</span>
            </Link>
            .
          </span>
        </label>
        <span
          id={termsMessageId}
          className={`pl-[1.625rem] text-xs min-h-[1rem] ${
            errors.acceptedTerms ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {errors.acceptedTerms?.message ??
            (acceptedTerms ? ' ' : 'Marque a caixa para continuar.')}
        </span>
      </div>

      <Button variant="primary" size="md" fullWidth loading={isSubmitting}>
        Criar conta
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-dark-border" />
        <span className="text-[11px] text-gray-400 uppercase tracking-wider">
          ou
        </span>
        <div className="h-px flex-1 bg-dark-border" />
      </div>

      <div className="flex flex-col gap-2">
        <GoogleAuthButton
          acceptedTerms={acceptedTerms}
          disabled={!acceptedTerms}
          describedBy={termsMessageId}
        />
        <DiscordAuthButton
          acceptedTerms={acceptedTerms}
          disabled={!acceptedTerms}
          describedBy={termsMessageId}
        />
      </div>
    </form>
  )
}
