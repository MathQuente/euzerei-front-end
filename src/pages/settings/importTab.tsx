import { useNavigate } from 'react-router-dom'
import { PsnImportSection } from '../../components/userGamesComponents/psnImportSection'
import { SteamImportSection } from '../../components/userGamesComponents/steamImportSection'
import { XboxImportSection } from '../../components/userGamesComponents/xboxImportSection'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUserProfile } from '../../hooks/useUserProfile'

export function ImportTab() {
  useDocumentTitle('Importar jogos · Configurações')
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const navigate = useNavigate()

  const viewLibrary = () => navigate('/userLibrary')

  return (
    <>
      <p className="text-sm text-gray-400">
        Conecte uma conta para trazer seus jogos para a biblioteca. Os que já
        estão nela continuam lá.
      </p>
      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true">
          {['a', 'b', 'c'].map(key => (
            <div key={key} className="h-24 rounded-lg bg-dark-bg-light" />
          ))}
        </div>
      )}
      {!isLoading && (isError || !user) && (
        <p className="text-gray-400">
          Não foi possível carregar suas contas agora. Recarregue a página para
          tentar de novo.
        </p>
      )}
      {user && (
        <div className="flex flex-col gap-3">
          <SteamImportSection
            steamAccounts={user.steamAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
          <PsnImportSection
            psnAccounts={user.psnAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
          <XboxImportSection
            xboxAccounts={user.xboxAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
        </div>
      )}
    </>
  )
}
