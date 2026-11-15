import { ArrowLeft, BadgeCheck, CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useBlocker } from 'react-router-dom'
import { ConfirmDialog } from '../components/confirmDialog'
import { DeleteAccountSection } from '../components/userGamesComponents/deleteAccountSection'
import { UserProfileForm } from '../components/userGamesComponents/userProfileForm'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUserProfile } from '../hooks/useUserProfile'
import { focusRing } from '../styles/focus'

export function AccountPage() {
  useDocumentTitle('Conta')
  const { user: authUser } = useAuth()
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const [dirty, setDirty] = useState(false)
  const handleDirtyChange = useCallback((value: boolean) => setDirty(value), [])

  const leavingOnPurpose = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      Boolean(authUser) &&
      !leavingOnPurpose.current &&
      currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (!dirty || leavingOnPurpose.current) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-8">
      <Link
        to="/userLibrary"
        className={`inline-flex w-fit items-center gap-1.5 rounded text-sm text-primary-light hover:underline ${focusRing}`}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Minha biblioteca
      </Link>
      <h1 className="text-2xl font-bold text-white">Conta</h1>

      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <div className="h-80 rounded-xl bg-dark-bg-light" />
          <div className="h-24 rounded-xl bg-dark-bg-light" />
        </div>
      )}
      {!isLoading && (isError || !user) && (
        <p className="text-gray-400">
          Não foi possível carregar sua conta agora. Recarregue a página para
          tentar de novo.
        </p>
      )}

      {user && (
        <>
          <UserProfileForm onDirtyChange={handleDirtyChange} />

          <section
            aria-labelledby="email-title"
            className="flex flex-col gap-3 rounded-xl border border-dark-border bg-dark-bg-darker p-5"
          >
            <h2 id="email-title" className="text-base font-semibold text-white">
              E-mail
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 break-words text-sm text-gray-200">
                {user.email}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
                  user.emailVerified
                    ? 'border-green-400/30 bg-green-400/10 text-green-200'
                    : 'border-amber-400/35 bg-amber-400/10 text-amber-200'
                }`}
              >
                {user.emailVerified ? (
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <CircleAlert className="size-3.5" aria-hidden="true" />
                )}
                {user.emailVerified ? 'Verificado' : 'Não verificado'}
              </span>
            </div>
          </section>

          <DeleteAccountSection
            onLeave={() => {
              leavingOnPurpose.current = true
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={open => !open && blocker.reset?.()}
        title="Sair sem salvar?"
        description="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
        confirmLabel="Sair mesmo"
        confirmVariant="primary"
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  )
}
