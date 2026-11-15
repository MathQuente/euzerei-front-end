import { BadgeCheck, CircleAlert } from 'lucide-react'
import { DeleteAccountSection } from '../../components/userGamesComponents/deleteAccountSection'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUserProfile } from '../../hooks/useUserProfile'

export function AccountTab() {
  useDocumentTitle('Conta · Configurações')
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="h-24 rounded-xl bg-dark-bg-light" />
        <div className="h-32 rounded-xl bg-dark-bg-light" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <p className="text-gray-400">
        Não foi possível carregar sua conta agora. Recarregue a página para
        tentar de novo.
      </p>
    )
  }

  return (
    <>
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

      <DeleteAccountSection />
    </>
  )
}
