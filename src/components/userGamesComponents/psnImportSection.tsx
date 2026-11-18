import { usePsnImport } from '../../hooks/usePsnImport'
import type { PsnAccount } from '../../types/user'
import { StoreTile } from '../storeBrand'
import { PlatformImportResult } from './platformImportResult'
import { PlatformImportSection } from './platformImportSection'

const PSN_ONLINE_ID_PATTERN = /^[A-Za-z0-9_-]{3,16}$/

const MAX_PSN_ACCOUNTS = 2

export function PsnImportSection({
  psnAccounts,
}: {
  psnAccounts: PsnAccount[]
}) {
  const importState = usePsnImport()

  return (
    <PlatformImportSection
      icon={<StoreTile store="playstation" size="lg" />}
      tagline="Jogos, troféus e tempo de jogo"
      label="PlayStation"
      masculine
      connectedId={psnAccounts[0]?.onlineId ?? null}
      accounts={psnAccounts.map(account => ({
        id: account.id,
        name: account.onlineId,
      }))}
      maxAccounts={MAX_PSN_ACCOUNTS}
      inputPlaceholder="ID online da PSN"
      inputValidation={{
        pattern: PSN_ONLINE_ID_PATTERN,
        message:
          'O ID da PSN tem de 3 a 16 caracteres: letras, números, hífen ou sublinhado.',
      }}
      verificationHint='Pra confirmar que o perfil é seu, cole este código no "Sobre mim" do seu perfil da PSN, salve e clique em Verificar. Depois de conectar você pode apagá-lo. O código vale por 15 minutos.'
      disconnectedDescription='Informe seu ID online da PSN e cole o código que vai aparecer na tela no "Sobre mim" do perfil pra confirmar que ele é seu.'
      importState={importState}
    />
  )
}

export function PsnImportPanel({
  onViewLibrary,
}: {
  onViewLibrary?: () => void
}) {
  const importState = usePsnImport()

  return (
    <PlatformImportResult
      ofLabel="do PlayStation"
      importState={importState}
      onViewLibrary={onViewLibrary}
      getResultSections={result => [
        { title: 'Biblioteca', result: result.library },
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
