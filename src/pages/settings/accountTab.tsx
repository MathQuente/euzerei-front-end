import { DeleteAccountSection } from '../../components/userGamesComponents/deleteAccountSection'
import { EmailSection } from '../../components/userGamesComponents/emailSection'
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
      <EmailSection
        email={user.email}
        emailVerified={user.emailVerified}
        hasPassword={user.hasPassword}
        pendingEmail={user.pendingEmail}
      />

      <DeleteAccountSection />
    </>
  )
}
