import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthInput } from '../../components/authInput'
import { Button } from '../../components/button'
import {
  SettingsCardHeader,
  settingsCardClass,
} from '../../components/settingsCard'
import { ProviderSection } from '../../components/userGamesComponents/providerSection'
import {
  PROVIDER_LINK_CANCELLED_CODE,
  SUCCESS_MESSAGES,
  providerLinkErrorMessage,
} from '../../constants/messages'
import type { SignInProvider } from '../../hooks/useApi'
import { useChangePassword } from '../../hooks/useChangePassword'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PROVIDER_LABEL } from '../../hooks/useProviderLink'
import { useReauth } from '../../hooks/useReauth'
import { useUserProfile } from '../../hooks/useUserProfile'
import {
  type ChangePasswordValues,
  makeChangePasswordSchema,
} from '../../schemas/changePasswordSchema'
import { focusRing } from '../../styles/focus'
import { notify } from '../../utils/notify'

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const schema = makeChangePasswordSchema(hasPassword)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(schema) })

  const { changePassword, isChanging, needsReauth, errorMessage } =
    useChangePassword({ hadPassword: hasPassword, onSuccess: () => reset() })

  function onSubmit(values: ChangePasswordValues) {
    changePassword({
      newPassword: values.newPassword,
      ...(hasPassword ? { currentPassword: values.currentPassword } : {}),
    })
  }

  const handleReauth = useReauth('/configuracoes/seguranca')

  const description = hasPassword
    ? 'Ao trocar, os outros dispositivos saem da sua conta.'
    : 'Você entra com Google ou Discord. Defina uma senha para também entrar com e-mail e senha.'

  return (
    <section aria-labelledby="password-title" className={settingsCardClass}>
      <SettingsCardHeader
        id="password-title"
        title="Senha"
        description={description}
      />
      <div className="flex flex-col gap-3.5 px-4 pb-4 sm:px-5">
        {needsReauth ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-primary-light/30 bg-primary/10 px-3 py-2.5">
              <p className="text-sm font-semibold text-white">
                Por segurança, entre de novo para continuar.
              </p>
              <p className="mt-0.5 text-xs text-gray-300">
                Depois você volta para esta página.
              </p>
            </div>
            <div>
              <Button type="button" variant="primary" onClick={handleReauth}>
                Entrar de novo
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-1"
            noValidate
          >
            {hasPassword && (
              <AuthInput
                id="currentPassword"
                label="Senha atual"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                error={errors.currentPassword}
                {...register('currentPassword')}
              />
            )}
            {hasPassword && (
              <p className="-mt-1 mb-2 text-xs text-gray-400">
                Não sabe a senha atual?{' '}
                <Link
                  to="/forgot-password"
                  className={`rounded-sm text-primary-link underline-offset-2 hover:underline ${focusRing}`}
                >
                  Redefina por e-mail.
                </Link>
              </p>
            )}
            <AuthInput
              id="newPassword"
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.newPassword}
              {...register('newPassword')}
            />
            <p className="-mt-1 mb-2 text-xs text-gray-400">
              Mínimo de 8 caracteres.
            </p>
            <AuthInput
              id="confirmPassword"
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errorMessage && (
              <output className="mb-2 block text-sm text-red-300">
                {errorMessage}
              </output>
            )}
            <div className="flex justify-end border-t border-dark-border pt-3.5">
              <Button variant="primary" loading={isChanging}>
                {hasPassword ? 'Trocar senha' : 'Definir senha'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export function SecurityTab() {
  useDocumentTitle('Segurança · Configurações')
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  useEffect(() => {
    const hasParams = ['vinculado', 'vinculo_erro', 'provedor'].some(key =>
      searchParams.has(key)
    )
    if (!hasParams) return

    const isProvider = (value: string | null): value is SignInProvider =>
      value === 'google' || value === 'discord'
    const linked = searchParams.get('vinculado')
    const failure = searchParams.get('vinculo_erro')
    const failedProvider = searchParams.get('provedor')

    if (isProvider(linked)) {
      notify.success(SUCCESS_MESSAGES.providerLinked(PROVIDER_LABEL[linked]), {
        id: `provider-link-${linked}`,
      })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    } else if (failure) {
      const label = isProvider(failedProvider)
        ? PROVIDER_LABEL[failedProvider]
        : 'provedor'
      const message = providerLinkErrorMessage(failure, label)
      const options = { id: `provider-link-error-${failure}-${label}` }
      if (failure === PROVIDER_LINK_CANCELLED_CODE)
        notify.info(message, options)
      else notify.error(message, options)
    }

    const next = new URLSearchParams(searchParams)
    next.delete('vinculado')
    next.delete('vinculo_erro')
    next.delete('provedor')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, queryClient])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="h-72 rounded-xl bg-dark-bg-light" />
      </div>
    )
  }

  if (isError || !user || typeof user.hasPassword !== 'boolean') {
    return (
      <p className="text-gray-400">
        Não foi possível carregar a sua conta agora. Recarregue a página para
        tentar de novo.
      </p>
    )
  }

  return (
    <>
      <PasswordSection
        key={String(user.hasPassword)}
        hasPassword={user.hasPassword}
      />
      <ProviderSection
        hasPassword={user.hasPassword}
        googleLinked={Boolean(user.googleLinked)}
        discordLinked={Boolean(user.discordLinked)}
      />
    </>
  )
}
