import { useCallback, useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { ConfirmDialog } from '../../components/confirmDialog'
import { UserProfileForm } from '../../components/userGamesComponents/userProfileForm'
import { useAuth } from '../../hooks/useAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUserProfile } from '../../hooks/useUserProfile'

export function ProfileTab() {
  useDocumentTitle('Perfil · Configurações')
  const { user: authUser } = useAuth()
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const [dirty, setDirty] = useState(false)
  const handleDirtyChange = useCallback((value: boolean) => setDirty(value), [])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      Boolean(authUser) &&
      currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <>
      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <div className="h-80 rounded-xl bg-dark-bg-light" />
        </div>
      )}
      {!isLoading && (isError || !user) && (
        <p className="text-gray-400">
          Não foi possível carregar seu perfil agora. Recarregue a página para
          tentar de novo.
        </p>
      )}
      {user && <UserProfileForm onDirtyChange={handleDirtyChange} />}

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={open => !open && blocker.reset?.()}
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Se sair desta aba ou página, elas serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        confirmVariant="primary"
        onConfirm={() => blocker.proceed?.()}
      />
    </>
  )
}
