import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PsnImportSection } from '../components/userGamesComponents/psnImportSection'
import { SteamImportSection } from '../components/userGamesComponents/steamImportSection'
import { XboxImportSection } from '../components/userGamesComponents/xboxImportSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePlatformLinkResult } from '../hooks/usePlatformLinkResult'
import { useUserProfile } from '../hooks/useUserProfile'
import { focusRing } from '../styles/focus'

export function ImportGamesPage() {
  useDocumentTitle('Importar jogos')
  usePlatformLinkResult()
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const navigate = useNavigate()

  const viewLibrary = () => navigate('/userLibrary')

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-8">
      <Link
        to="/userLibrary"
        className={`inline-flex w-fit items-center gap-1.5 rounded text-sm text-primary-light hover:underline ${focusRing}`}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Minha biblioteca
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-white">Importar jogos</h1>
        <p className="mt-1 text-sm text-gray-400">
          Conecte uma conta para trazer seus jogos para a biblioteca. Os que já
          estão nela continuam lá.
        </p>
      </div>
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
            steamAccounts={user?.steamAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
          <PsnImportSection
            psnAccounts={user?.psnAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
          <XboxImportSection
            xboxAccounts={user?.xboxAccounts ?? []}
            onViewLibrary={viewLibrary}
          />
        </div>
      )}
    </div>
  )
}
