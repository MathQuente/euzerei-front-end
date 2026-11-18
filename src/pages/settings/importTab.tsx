import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  SettingsCardHeader,
  settingsCardClass,
} from '../../components/settingsCard'
import {
  ImportAllBlock,
  type ImportSource,
} from '../../components/userGamesComponents/importAllBlock'
import {
  PsnImportPanel,
  PsnImportSection,
} from '../../components/userGamesComponents/psnImportSection'
import {
  SteamImportPanel,
  SteamImportSection,
} from '../../components/userGamesComponents/steamImportSection'
import {
  XboxImportPanel,
  XboxImportSection,
} from '../../components/userGamesComponents/xboxImportSection'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { usePsnImport } from '../../hooks/usePsnImport'
import { useSteamImport } from '../../hooks/useSteamImport'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useXboxImport } from '../../hooks/useXboxImport'

export function ImportTab() {
  useDocumentTitle('Importar jogos · Configurações')
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const user = UserProfileResponse?.user
  const navigate = useNavigate()

  const viewLibrary = () => navigate('/userLibrary')

  // Mesmas consultas das linhas (a chave do cache é a mesma): aqui só leem o
  // estado e disparam a importação de todas as contas de uma vez.
  const steam = useSteamImport()
  const psn = usePsnImport()
  const xbox = useXboxImport()
  const sources: ImportSource[] = [
    {
      id: 'plataforma-steam',
      label: 'Steam',
      ofLabel: 'da Steam',
      store: 'steam',
      connected: (user?.steamAccounts?.length ?? 0) > 0,
      state: steam,
      panel: <SteamImportPanel onViewLibrary={viewLibrary} />,
    },
    {
      id: 'plataforma-playstation',
      label: 'PlayStation',
      ofLabel: 'do PlayStation',
      store: 'playstation',
      connected: (user?.psnAccounts?.length ?? 0) > 0,
      state: psn,
      panel: <PsnImportPanel onViewLibrary={viewLibrary} />,
    },
    {
      id: 'plataforma-xbox',
      label: 'Xbox',
      ofLabel: 'do Xbox',
      store: 'xbox',
      connected: (user?.xboxAccounts?.length ?? 0) > 0,
      state: xbox,
      panel: <XboxImportPanel onViewLibrary={viewLibrary} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby="plataformas-titulo"
        className={settingsCardClass}
      >
        <SettingsCardHeader
          id="plataformas-titulo"
          title="Plataformas de jogos"
          description="Conecte suas contas para trazer jogos, horas e conquistas para a biblioteca. Os que já estão nela continuam lá."
        />

        <div className="mx-4 mb-3 flex items-start gap-2.5 rounded-lg bg-amber-400/10 px-3 py-2.5 text-[13.5px] text-amber-100/90 sm:mx-5">
          <ShieldAlert
            className="mt-0.5 size-4 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <p>
            O EuZerei só lê perfis públicos. Na PlayStation e no Xbox, deixe
            perfil, jogos e troféus visíveis para todos nas configurações de
            privacidade.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-px" aria-busy="true">
            {['a', 'b', 'c'].map(key => (
              <div key={key} className="h-20 bg-dark-bg-light/60" />
            ))}
          </div>
        )}
        {!isLoading && (isError || !user) && (
          <p className="px-4 pb-4 text-gray-400 sm:px-5">
            Não foi possível carregar suas contas agora. Recarregue a página
            para tentar de novo.
          </p>
        )}
        {user && (
          <ul className="m-0 flex list-none flex-col border-t border-dark-border p-0">
            <SteamImportSection steamAccounts={user.steamAccounts ?? []} />
            <PsnImportSection psnAccounts={user.psnAccounts ?? []} />
            <XboxImportSection xboxAccounts={user.xboxAccounts ?? []} />
          </ul>
        )}
      </section>
      {user && <ImportAllBlock sources={sources} />}
    </div>
  )
}
