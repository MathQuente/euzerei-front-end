import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, CircleAlert, Lock, Mail } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEmailChange } from '../../hooks/useEmailChange'
import { useReauth } from '../../hooks/useReauth'
import {
  type ChangeEmailValues,
  makeChangeEmailSchema,
} from '../../schemas/changeEmailSchema'
import { AuthInput } from '../authInput'
import { Button } from '../button'
import { SettingsCardHeader, settingsCardClass } from '../settingsCard'

interface EmailSectionProps {
  email: string
  emailVerified: boolean
  hasPassword: boolean
  pendingEmail?: string | null
}

export function EmailSection({
  email,
  emailVerified,
  hasPassword,
  pendingEmail,
}: EmailSectionProps) {
  const [editing, setEditing] = useState(false)
  const changeWrapRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<HTMLOutputElement>(null)
  const restoreFocus = useRef(false)
  const focusPending = useRef(false)
  const handleReauth = useReauth('/configuracoes/conta')

  const resolver = useMemo(
    () => zodResolver(makeChangeEmailSchema(hasPassword)),
    [hasPassword]
  )
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<ChangeEmailValues>({
    resolver,
  })

  const {
    requestChange,
    isRequesting,
    needsReauth,
    errorMessage,
    resetRequest,
    resend,
    isResending,
    cancel,
    isCancelling,
  } = useEmailChange({
    onRequested: () => {
      focusPending.current = true
      setEditing(false)
      reset()
    },
  })

  useEffect(() => {
    if (editing) setFocus('newEmail')
  }, [editing, setFocus])

  useEffect(() => {
    if (pendingEmail) setEditing(false)
  }, [pendingEmail])

  useEffect(() => {
    if (focusPending.current && pendingEmail) {
      focusPending.current = false
      pendingRef.current?.focus()
    }
    if (restoreFocus.current && !editing && !pendingEmail) {
      restoreFocus.current = false
      changeWrapRef.current?.querySelector('button')?.focus()
    }
  }, [editing, pendingEmail])

  function closeForm() {
    restoreFocus.current = true
    setEditing(false)
    reset()
    resetRequest()
  }

  function onSubmit(values: ChangeEmailValues) {
    requestChange({
      newEmail: values.newEmail,
      ...(hasPassword ? { currentPassword: values.currentPassword } : {}),
    })
  }

  const verifiedPill = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        emailVerified
          ? 'border-green-400/30 bg-green-400/10 text-green-200'
          : 'border-amber-400/35 bg-amber-400/10 text-amber-200'
      }`}
    >
      {emailVerified ? (
        <BadgeCheck className="size-3.5" aria-hidden="true" />
      ) : (
        <CircleAlert className="size-3.5" aria-hidden="true" />
      )}
      {emailVerified ? 'Verificado' : 'Não verificado'}
    </span>
  )

  return (
    <section aria-labelledby="email-title" className={settingsCardClass}>
      <SettingsCardHeader
        id="email-title"
        title="E-mail"
        description="Usado para entrar e para receber avisos."
      />
      <div className="flex flex-col gap-3.5 px-4 pb-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 break-words text-sm text-gray-200">
            {email}
          </span>
          {verifiedPill}
        </div>

        {pendingEmail ? (
          <div className="flex flex-col gap-3">
            <output
              ref={pendingRef}
              tabIndex={-1}
              className="block rounded-lg border border-primary-light/30 bg-primary/10 px-3 py-2.5 outline-none"
            >
              <p className="break-words text-sm font-semibold text-white">
                Enviamos um link para {pendingEmail}.
              </p>
              <p className="mt-0.5 text-xs text-gray-300">
                O e-mail só muda depois que você clicar nele.
              </p>
            </output>
            <div className="flex flex-wrap justify-end gap-2.5 max-sm:[&>button]:flex-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  restoreFocus.current = true
                  cancel()
                }}
                loading={isCancelling}
                disabled={isResending}
              >
                Cancelar troca
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => resend()}
                loading={isResending}
                disabled={isCancelling}
              >
                Reenviar
              </Button>
            </div>
          </div>
        ) : editing ? (
          needsReauth ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-primary-light/30 bg-primary/10 px-3 py-2.5">
                <p className="text-sm font-semibold text-white">
                  Por segurança, entre de novo para continuar.
                </p>
                <p className="mt-0.5 text-xs text-gray-300">
                  Depois você volta para esta página.
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2.5 max-sm:[&>button]:flex-1">
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancelar
                </Button>
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
              <AuthInput
                id="newEmail"
                label="Novo e-mail"
                type="email"
                autoComplete="email"
                placeholder="novo@exemplo.com"
                icon={<Mail size={18} />}
                error={errors.newEmail}
                {...register('newEmail')}
              />
              {hasPassword && (
                <AuthInput
                  id="emailChangePassword"
                  label="Senha atual"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  icon={<Lock size={18} />}
                  error={errors.currentPassword}
                  {...register('currentPassword')}
                />
              )}
              {errorMessage && (
                <output className="mb-2 block text-sm text-red-300">
                  {errorMessage}
                </output>
              )}
              <div className="flex flex-wrap justify-end gap-2.5 border-t border-dark-border pt-3.5 max-sm:[&>button]:flex-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeForm}
                  disabled={isRequesting}
                >
                  Cancelar
                </Button>
                <Button variant="primary" loading={isRequesting}>
                  Enviar link de confirmação
                </Button>
              </div>
            </form>
          )
        ) : (
          <div ref={changeWrapRef}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              Alterar e-mail
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
