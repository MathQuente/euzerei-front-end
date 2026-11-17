import { useState } from 'react'
import { useDeleteAccount } from '../../hooks/useDeleteAccount'
import { useReauth } from '../../hooks/useReauth'
import { useUserProfile } from '../../hooks/useUserProfile'
import { Button } from '../button'
import { DeleteAccountDialog } from './deleteAccountDialog'

export function DeleteAccountSection() {
  const { UserProfileResponse } = useUserProfile()
  const [open, setOpen] = useState(false)
  const { deleteAccount, isDeleting, needsReauth, errorMessage, resetError } =
    useDeleteAccount()

  const profile = UserProfileResponse?.user
  const confirmationText = profile?.userName || profile?.email
  const handleReauth = useReauth('/configuracoes/conta')
  if (!confirmationText) return null

  const handleOpenChange = (next: boolean) => {
    if (!next) resetError()
    setOpen(next)
  }

  return (
    <section
      aria-labelledby="delete-account-title"
      className="flex flex-col gap-3 rounded-xl border border-red-400/30 bg-dark-bg-darker p-5"
    >
      <h2
        id="delete-account-title"
        className="text-base font-semibold text-red-200"
      >
        Excluir conta
      </h2>
      <p className="text-sm text-gray-400">
        Isso apaga sua biblioteca, avaliações, resenhas, seguidores e contas
        vinculadas, e não dá para desfazer.
      </p>
      <div>
        <Button
          type="button"
          variant="secondary"
          className="border-red-400/45 text-red-300 hover:text-red-200"
          onClick={() => setOpen(true)}
        >
          Excluir minha conta
        </Button>
      </div>

      <DeleteAccountDialog
        open={open}
        onOpenChange={handleOpenChange}
        confirmationText={confirmationText}
        onConfirm={deleteAccount}
        onEdit={resetError}
        onReauth={handleReauth}
        isLoading={isDeleting}
        needsReauth={needsReauth}
        errorMessage={errorMessage}
        summary={{
          games: profile?.gamesAmount ?? 0,
          followers: profile?.followersCount ?? 0,
          following: profile?.followingCount ?? 0,
          accounts:
            (profile?.steamAccounts.length ?? 0) +
            (profile?.xboxAccounts.length ?? 0) +
            (profile?.psnAccounts.length ?? 0),
        }}
      />
    </section>
  )
}
