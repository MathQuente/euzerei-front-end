import { CircleAlert, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  getImportMessage,
  getSlowImportNotice,
} from '../../constants/importMessages'
import type { PlatformImport } from '../../hooks/usePlatformImport'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { ImportSectionResult } from '../../types/import'
import type { LibraryPlatform } from '../../types/platform'
import { Button } from '../button'
import type { ImportResultSection } from '../importResultSummary'
import { CompletionSuggestionsBlock } from './completionSuggestions'
import {
  IMPORT_FINISH_MS,
  IMPORT_LEAVE_MS,
  ImportFinishBurst,
} from './importFinishBurst'

const POLLING_STATUSES = ['waiting', 'active', 'delayed']

const MIN_IMPORTING_VISIBLE_MS = 1500

export interface AccountImportResult {
  name: string
  result?: ImportSectionResult
  error?: string
  warning?: string
}

interface PlatformImportResultProps<TResult> {
  /** "da Steam", "do Xbox": usado nas mensagens. */
  ofLabel: string
  importState: PlatformImport<TResult>
  getResultSections: (result: TResult) => ImportResultSection[]
  getAccountResults?: (result: TResult) => AccountImportResult[]
  onViewLibrary?: () => void
  suggestionsPlatform?: LibraryPlatform
}

/**
 * Progresso, resultado e sugestões da importação de uma plataforma conectada.
 * Aparece no bloco "Importar jogos"; a importação em si pode começar em
 * qualquer lugar (o estado vem da consulta de status, que faz polling).
 */
export function PlatformImportResult<TResult>({
  ofLabel,
  importState,
  getResultSections,
  getAccountResults,
  onViewLibrary,
  suggestionsPlatform,
}: PlatformImportResultProps<TResult>) {
  const { status, refetchStatus, startImport, isStarting, refreshAfterImport } =
    importState

  const [justFinished, setJustFinished] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout>>()
  const finishTimer = useRef<ReturnType<typeof setTimeout>>()
  const reducedMotion = usePrefersReducedMotion()
  const previousStatus = useRef<string | undefined>(undefined)
  const progressRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLOutputElement>(null)
  const isFirstStatusLoad = useRef(true)

  const [visuallyImporting, setVisuallyImporting] = useState(false)
  const importStartedAtRef = useRef<number | null>(null)
  const messageSeedRef = useRef(0)

  const rawIsImporting = POLLING_STATUSES.includes(status?.status ?? '')

  useEffect(() => {
    if (rawIsImporting && !visuallyImporting) {
      setVisuallyImporting(true)
      importStartedAtRef.current = Date.now()
      messageSeedRef.current = Math.floor(Math.random() * 2 ** 31)
    }
  }, [rawIsImporting, visuallyImporting])

  useEffect(() => {
    if (status?.status === undefined) return

    if (isFirstStatusLoad.current) {
      isFirstStatusLoad.current = false
      previousStatus.current = status.status
      return
    }

    const wasTerminal =
      previousStatus.current === 'completed' ||
      previousStatus.current === 'failed'
    const isDone = status.status === 'completed' || status.status === 'failed'

    previousStatus.current = status.status

    if (wasTerminal || !isDone) return

    const startedAt = importStartedAtRef.current ?? Date.now()
    const remaining = Math.max(
      MIN_IMPORTING_VISIBLE_MS - (Date.now() - startedAt),
      0
    )

    const timer = setTimeout(
      () => finishImport(status.status === 'completed'),
      remaining
    )

    return () => clearTimeout(timer)
  }, [status?.status])

  useEffect(
    () => () => {
      clearTimeout(celebrationTimer.current)
      clearTimeout(finishTimer.current)
    },
    []
  )

  function finishImport(completed: boolean) {
    clearTimeout(celebrationTimer.current)
    if (!completed || reducedMotion) {
      showImportResult()
      return
    }
    setCelebrating(true)
    celebrationTimer.current = setTimeout(() => {
      setLeaving(true)
      celebrationTimer.current = setTimeout(showImportResult, IMPORT_LEAVE_MS)
    }, IMPORT_FINISH_MS)
  }

  function showImportResult() {
    setCelebrating(false)
    setLeaving(false)
    setVisuallyImporting(false)
    importStartedAtRef.current = null
    setJustFinished(true)
    refreshAfterImport()
  }

  const isImporting = visuallyImporting

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  useEffect(() => {
    if (!isImporting) {
      setElapsedSeconds(0)
      return
    }
    const interval = setInterval(() => {
      const startedAt = importStartedAtRef.current ?? Date.now()
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isImporting])

  useEffect(() => {
    const focusLost =
      !document.activeElement || document.activeElement === document.body
    if (!focusLost) return
    if (isImporting) progressRef.current?.focus()
    else if (justFinished) resultRef.current?.focus()
  }, [isImporting, justFinished])

  const slowImportNotice = getSlowImportNotice(
    elapsedSeconds,
    messageSeedRef.current
  )
  const progress =
    status?.status === 'active' ? (status.progress ?? 0) : undefined

  async function handleStartImport() {
    setVisuallyImporting(true)
    setJustFinished(false)
    importStartedAtRef.current = Date.now()
    messageSeedRef.current = Math.floor(Math.random() * 2 ** 31)
    try {
      await startImport()
      const fresh = await refetchStatus()
      if (fresh?.status === 'completed' || fresh?.status === 'failed') {
        previousStatus.current = fresh.status
        clearTimeout(finishTimer.current)
        finishTimer.current = setTimeout(
          () => finishImport(fresh.status === 'completed'),
          MIN_IMPORTING_VISIBLE_MS
        )
      } else {
        previousStatus.current = fresh?.status
      }
    } catch {
      setVisuallyImporting(false)
      importStartedAtRef.current = null
    }
  }

  const cooldownUntil =
    status?.status === 'completed' ? status.cooldownUntil : undefined

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!cooldownUntil) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  const cooldownRemainingMs = cooldownUntil ? cooldownUntil - now : 0
  const isOnCooldown = cooldownRemainingMs > 0
  const cooldownLabel = isOnCooldown
    ? (() => {
        const totalMinutes = Math.ceil(cooldownRemainingMs / 60000)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
      })()
    : null

  const accountResults =
    status?.status === 'completed' && status.result && getAccountResults
      ? getAccountResults(status.result)
      : []

  const showViewLibrary =
    justFinished && status?.status === 'completed' && Boolean(onViewLibrary)

  return (
    <div className="flex flex-col">
      <output
        ref={resultRef}
        tabIndex={-1}
        className="mt-3 flex flex-col gap-2.5 outline-none empty:hidden"
      >
        {!isImporting && status?.status === 'completed' && status.result && (
          <>
            {accountResults.some(
              account => account.warning || account.error
            ) && (
              <ul className="flex flex-col">
                {accountResults
                  .filter(account => account.warning || account.error)
                  .map(account => (
                    <li
                      key={account.name}
                      className="flex flex-col gap-0.5 border-t border-dark-border py-2 text-xs"
                    >
                      <span className="text-primary-link">{account.name}</span>
                      {account.error && (
                        <span className="text-red-300">{account.error}</span>
                      )}
                      {account.warning && (
                        <span className="flex items-start gap-1.5 text-amber-400">
                          <TriangleAlert
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {account.warning}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
            {suggestionsPlatform && (
              <div className="has-[button]:mt-3">
                <CompletionSuggestionsBlock
                  platform={suggestionsPlatform}
                  variant={justFinished ? 'fresh' : 'last'}
                  expectedCount={
                    getResultSections(status.result)[0]?.result.suggestions ?? 0
                  }
                />
              </div>
            )}
          </>
        )}
        {!isImporting && status?.status === 'failed' && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5">
            <CircleAlert
              className="mt-0.5 size-[18px] shrink-0 text-red-400"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-[13.5px] font-semibold text-white">
                  Não foi possível importar {ofLabel}
                </p>
                <p className="mt-0.5 text-xs text-gray-300">
                  {status.error ??
                    'Erro desconhecido ao importar sua biblioteca.'}
                </p>
              </div>
              {!isOnCooldown && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={handleStartImport}
                  loading={isStarting}
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          </div>
        )}
      </output>

      {showViewLibrary && (
        <Button
          type="button"
          variant="primary"
          size="md"
          className="mt-3 self-start text-sm"
          onClick={onViewLibrary}
        >
          Ver na biblioteca
        </Button>
      )}

      {!isImporting && isOnCooldown && (
        <p className="mt-3 text-xs text-gray-400">
          Você pode importar de novo em {cooldownLabel}.
        </p>
      )}

      {isImporting && (
        <div
          ref={progressRef}
          tabIndex={-1}
          className={`mt-3 flex flex-col gap-2 outline-none transition-opacity duration-500 ${leaving ? 'opacity-0' : ''}`}
          aria-live="polite"
        >
          {celebrating && <ImportFinishBurst />}
          {!celebrating && progress !== undefined && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-dark-bg">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {!celebrating && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-gray-300">
                {getImportMessage(
                  progress,
                  elapsedSeconds,
                  messageSeedRef.current
                )}
              </span>
              {progress !== undefined && (
                <span className="shrink-0 text-xs tabular-nums text-gray-300">
                  {progress}%
                </span>
              )}
            </div>
          )}
          {slowImportNotice && !celebrating && (
            <span className="text-xs text-gray-500">{slowImportNotice}</span>
          )}
        </div>
      )}
    </div>
  )
}
