import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { AuthInput } from '../../components/authInput'
import { Button } from '../../components/button'
import { useChangePassword } from '../../hooks/useChangePassword'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useReauth } from '../../hooks/useReauth'
import { useUserProfile } from '../../hooks/useUserProfile'
import {
  type ChangePasswordValues,
  makeChangePasswordSchema,
} from '../../schemas/changePasswordSchema'
import { focusRing } from '../../styles/focus'

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
    <section
      aria-labelledby="password-title"
      className="flex flex-col gap-3.5 rounded-xl border border-dark-border bg-dark-bg-darker p-5"
    >
      <div>
        <h2 id="password-title" className="text-base font-semibold text-white">
          Senha
        </h2>
        <p className="mt-0.5 text-sm text-gray-400">{description}</p>
      </div>

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
    </section>
  )
}

export function SecurityTab() {
  useDocumentTitle('Segurança · Configurações')
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user

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
    <PasswordSection
      key={String(user.hasPassword)}
      hasPassword={user.hasPassword}
    />
  )
}
