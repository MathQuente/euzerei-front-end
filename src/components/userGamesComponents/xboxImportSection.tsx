import { useXboxImport } from '../../hooks/useXboxImport'
import type { XboxAccount } from '../../types/user'
import { StoreTile } from '../storeBrand'
import { PlatformImportResult } from './platformImportResult'
import { PlatformImportSection } from './platformImportSection'

const MAX_XBOX_ACCOUNTS = 2

export function XboxImportSection({
  xboxAccounts,
}: {
  xboxAccounts: XboxAccount[]
}) {
  const importState = useXboxImport()

  return (
    <PlatformImportSection
      icon={<StoreTile store="xbox" size="lg" />}
      tagline="Gamerscore, jogos e tempo de jogo"
      label="Xbox"
      masculine
      connectedId={xboxAccounts[0]?.gamertag ?? null}
      accounts={xboxAccounts.map(account => ({
        id: account.id,
        name: account.gamertag,
      }))}
      maxAccounts={MAX_XBOX_ACCOUNTS}
      disconnectedDescription="Entre com a sua conta Microsoft pra confirmar que o perfil é seu e importar os jogos do Xbox."
      importState={importState}
    />
  )
}

export function XboxImportPanel({
  onViewLibrary,
}: {
  onViewLibrary?: () => void
}) {
  const importState = useXboxImport()

  return (
    <PlatformImportResult
      ofLabel="do Xbox"
      platform="XBOX"
      importState={importState}
      onViewLibrary={onViewLibrary}
      getResultSections={result => [
        { title: 'Biblioteca', result: result.library },
      ]}
      getAccountResults={result =>
        (result.accounts ?? []).map(account => ({
          name: account.gamertag,
          result: account.library,
          error: account.error,
          warning: account.warning,
        }))
      }
    />
  )
}
