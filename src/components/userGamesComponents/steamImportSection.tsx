import { useSteamImport } from '../../hooks/useSteamImport'
import type { SteamAccount } from '../../types/user'
import { StoreTile } from '../storeBrand'
import { PlatformImportResult } from './platformImportResult'
import { PlatformImportSection } from './platformImportSection'

const MAX_STEAM_ACCOUNTS = 2

export function SteamImportSection({
  steamAccounts,
}: {
  steamAccounts: SteamAccount[]
}) {
  const importState = useSteamImport()

  return (
    <PlatformImportSection
      icon={<StoreTile store="steam" size="lg" />}
      tagline="Jogos e horas jogadas"
      label="Steam"
      connectedId={steamAccounts[0]?.steamId ?? null}
      connectedName={steamAccounts[0]?.personaName ?? null}
      accounts={steamAccounts.map(account => ({
        id: account.id,
        name: account.personaName,
      }))}
      maxAccounts={MAX_STEAM_ACCOUNTS}
      disconnectedDescription="Entre com a sua conta Steam pra confirmar que ela é sua e importar sua biblioteca automaticamente."
      importState={importState}
    />
  )
}

export function SteamImportPanel({
  onViewLibrary,
}: {
  onViewLibrary?: () => void
}) {
  const importState = useSteamImport()

  return (
    <PlatformImportResult
      ofLabel="da Steam"
      importState={importState}
      onViewLibrary={onViewLibrary}
      suggestionsPlatform="STEAM"
      getResultSections={result => [
        { title: 'Biblioteca', result: result.library },
        { title: 'Lista de desejos', result: result.wishlist },
      ]}
      getAccountResults={result =>
        (result.accounts ?? []).map(account => ({
          name: account.displayName,
          result: account.library,
          error: account.error,
        }))
      }
    />
  )
}
