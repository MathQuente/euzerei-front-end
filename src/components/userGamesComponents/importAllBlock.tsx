import { RefreshCw } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import type { ImportStatusResponse } from '../../types/import'
import { Button } from '../button'
import { formatWhen } from '../importResultSummary'
import { SettingsCardHeader, settingsCardClass } from '../settingsCard'
import { type BrandStore, StoreTile } from '../storeBrand'

const POLLING_STATUSES = ['waiting', 'active', 'delayed']

export interface ImportSource {
  id: string
  label: string
  /** "da Steam", "do Xbox". */
  ofLabel: string
  store: BrandStore
  connected: boolean
  /** Progresso, resultado e sugestões da plataforma. */
  panel: ReactNode
  state: {
    status?: ImportStatusResponse<unknown>
    startImport: () => Promise<unknown>
    refetchStatus: () => Promise<unknown>
  }
}

function isImporting(source: ImportSource) {
  return POLLING_STATUSES.includes(source.state.status?.status ?? '')
}

function cooldownMs(source: ImportSource, now: number) {
  const { status } = source.state
  if (status?.status !== 'completed' || !status.cooldownUntil) return 0
  return Math.max(status.cooldownUntil - now, 0)
}

function formatCooldown(ms: number) {
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}

export function ImportAllBlock({ sources }: { sources: ImportSource[] }) {
  const [starting, setStarting] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const hasCooldown = sources.some(source => cooldownMs(source, now) > 0)
  useEffect(() => {
    if (!hasCooldown) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [hasCooldown])

  const connected = sources.filter(source => source.connected)
  const eligible = connected.filter(
    source => !isImporting(source) && cooldownMs(source, now) === 0
  )
  const anyImporting = connected.some(isImporting)
  const neverImported = connected.every(
    source => (source.state.status?.status ?? 'idle') === 'idle'
  )
  const nextCooldown = connected
    .map(source => cooldownMs(source, now))
    .filter(ms => ms > 0)
    .sort((a, b) => a - b)[0]

  async function importAll() {
    setStarting(true)
    try {
      await Promise.allSettled(
        eligible.map(async source => {
          await source.state.startImport()
          await source.state.refetchStatus()
        })
      )
    } finally {
      setStarting(false)
    }
  }

  async function importOne(source: ImportSource) {
    try {
      await source.state.startImport()
      await source.state.refetchStatus()
    } catch {
      // o erro já é mostrado pelo hook
    }
  }

  const busy = starting || anyImporting
  const hint =
    connected.length === 0
      ? 'Conecte uma plataforma acima para importar.'
      : busy
        ? 'Importando. Você pode sair desta página, a importação continua.'
        : eligible.length === 0 && nextCooldown
          ? `Você pode importar de novo em ${formatCooldown(nextCooldown)}.`
          : eligible.length < connected.length
            ? 'Só as plataformas liberadas serão importadas agora.'
            : null

  return (
    <section aria-labelledby="importar-titulo" className={settingsCardClass}>
      <SettingsCardHeader
        id="importar-titulo"
        title="Importar jogos"
        description="Traz jogos, horas e conquistas de todas as contas conectadas de uma vez."
      />

      {neverImported && connected.length > 0 && (
        <p className="mx-4 mb-3 rounded-lg bg-dark-bg-light px-3 py-2.5 text-[13.5px] text-gray-300 sm:mx-5">
          Conecte todas as plataformas antes. A primeira importação pode levar
          alguns minutos, conforme o tamanho da biblioteca.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-3 sm:px-5">
        <Button
          type="button"
          variant="primary"
          size="md"
          className="gap-1.5 text-sm [@media(max-width:480px)]:w-full"
          onClick={importAll}
          loading={busy}
          disabled={busy || eligible.length === 0}
        >
          {!busy && <RefreshCw className="size-4" aria-hidden="true" />}
          {busy ? 'Importando…' : 'Importar tudo'}
        </Button>
        {hint && <p className="text-sm text-gray-400">{hint}</p>}
      </div>

      {connected.length > 0 && (
        <ul
          aria-label="Importação por plataforma"
          className="m-0 list-none border-t border-dark-border p-0"
        >
          {connected.map(source => {
            const { status } = source.state
            const finishedAt =
              status?.status === 'completed' ? status.finishedAt : undefined
            const cooling = cooldownMs(source, now)
            const importing = isImporting(source)
            const sourceBusy = importing || starting
            const subtitle = importing
              ? 'Importando agora…'
              : status?.status === 'failed'
                ? 'A última importação falhou'
                : finishedAt
                  ? `Última importação ${formatWhen(finishedAt)}`
                  : 'Ainda não importada'
            return (
              <li
                key={source.id}
                className="flex flex-col border-t border-dark-border px-4 py-2 first:border-t-0 last:pb-4 sm:px-5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StoreTile store={source.store} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold leading-tight text-white">
                      {source.label}
                    </h3>
                    <p
                      className={`text-xs ${status?.status === 'failed' && !importing ? 'text-red-300' : 'text-gray-400'}`}
                    >
                      {subtitle}
                      {cooling > 0 && !importing && (
                        <>
                          {' '}
                          <span aria-hidden="true">·</span> Disponível em{' '}
                          {formatCooldown(cooling)}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="[@media(max-width:480px)]:w-full"
                    aria-label={`Importar só ${source.ofLabel}`}
                    disabled={sourceBusy || cooling > 0}
                    loading={sourceBusy}
                    onClick={() => importOne(source)}
                  >
                    {sourceBusy ? 'Importando…' : 'Importar'}
                  </Button>
                </div>
                {source.panel}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
