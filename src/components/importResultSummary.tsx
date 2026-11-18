import { ChevronRight } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { useCountUp } from '../hooks/useCountUp'
import { focusRing } from '../styles/focus'
import type { ImportSectionResult } from '../types/import'
import { type NotFoundGroupKey, groupNotFound } from '../utils/groupNotFound'
import { notify } from '../utils/notify'
import { Button } from './button'

export interface ImportResultSection {
  title: string
  result: ImportSectionResult
}

interface ImportResultSummaryProps {
  platformLabelOf: string
  sections: ImportResultSection[]
  variant: 'fresh' | 'last'
  finishedAt?: number
}

const SUPPORT_LABELS: Record<string, string> = {
  'Lista de desejos': 'na lista de desejos',
}

function plural(count: number, one: string, many: string) {
  return count === 1 ? one : many
}

export function formatWhen(timestamp: number) {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const sameDay = date.toDateString() === new Date().toDateString()
  if (sameDay) return `hoje, ${time}`
  const day = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
  return `${day}, ${time}`
}

function Count({
  children,
  className = 'text-white',
  animate = false,
}: {
  children: number
  className?: string
  animate?: boolean
}) {
  const shown = useCountUp(children, animate)
  return (
    <b className={`font-bold tabular-nums ${className}`}>
      <span aria-hidden={animate || undefined}>{shown}</span>
      {animate && <span className="sr-only">{children}</span>}
    </b>
  )
}

export function ImportResultSummary({
  platformLabelOf,
  sections,
  variant,
  finishedAt,
}: ImportResultSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<NotFoundGroupKey | 'all'>('all')
  const detailId = useId()

  const [library, ...others] = sections
  if (!library) return null

  const { imported, updated, skipped } = library.result
  const notFound = Array.from(
    new Set(sections.flatMap(section => section.result.notFound))
  )
  const groups = groupNotFound(notFound)
  const missing = notFound.length

  const support: { key: string; node: ReactNode }[] = []
  for (const section of others) {
    support.push({
      key: section.title,
      node: (
        <>
          <Count animate={variant === 'fresh'}>{section.result.imported}</Count>{' '}
          {SUPPORT_LABELS[section.title] ?? `em ${section.title.toLowerCase()}`}
        </>
      ),
    })
  }
  if (updated > 0) {
    support.push({
      key: 'updated',
      node: (
        <>
          <Count animate={variant === 'fresh'}>{updated}</Count>{' '}
          {plural(updated, 'atualizado', 'atualizados')}
        </>
      ),
    })
  }
  if (skipped > 0) {
    support.push({
      key: 'skipped',
      node: (
        <>
          <Count animate={variant === 'fresh'}>{skipped}</Count>{' '}
          {plural(
            skipped,
            'já estava na biblioteca',
            'já estavam na biblioteca'
          )}
        </>
      ),
    })
  }

  const activeGroup = groups.find(group => group.key === filter)
  const shownItems = activeGroup
    ? activeGroup.items
    : groups.flatMap(group => group.items)

  async function copyList() {
    try {
      await navigator.clipboard.writeText(
        shownItems.map(item => item.name).join('\n')
      )
      notify.success(SUCCESS_MESSAGES.listCopied)
    } catch {
      notify.error(ERROR_MESSAGES.copyList)
    }
  }

  const supportLine =
    support.length > 0 ? (
      <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-300">
        {support.map((part, index) => (
          <span key={part.key} className="flex gap-2">
            {index > 0 && <span aria-hidden="true">·</span>}
            <span>{part.node}</span>
          </span>
        ))}
      </p>
    ) : null

  const toggleLabel =
    variant === 'last'
      ? expanded
        ? 'Ocultar a lista'
        : `Ver os ${missing} sem correspondência`
      : `${missing} sem correspondência no catálogo`

  const details = (
    <div id={detailId} className="flex flex-col gap-3 pt-1">
      {skipped > 0 && (
        <p className="text-xs text-gray-400">
          Se algum jogo seu tem mais de um console da mesma plataforma, a
          importação não o atualiza e ele entra na contagem de "já na
          biblioteca". Ajuste as horas direto no jogo.
        </p>
      )}
      {missing > 0 && (
        <div className="overflow-hidden rounded-lg border border-dark-border bg-dark-bg-light">
          <div className="flex flex-wrap items-center gap-2 border-b border-dark-border px-3.5 py-3">
            <fieldset className="m-0 flex min-w-0 flex-1 flex-wrap gap-1.5 border-0 p-0">
              <legend className="sr-only">Filtrar por tipo</legend>
              {[
                { key: 'all' as const, label: 'Todos', count: missing },
                ...groups.map(group => ({
                  key: group.key,
                  label: group.label,
                  count: group.items.length,
                })),
              ].map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  aria-pressed={filter === chip.key}
                  onClick={() => setFilter(chip.key)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors [@media(max-width:639px)]:min-h-9 ${focusRing} ${
                    filter === chip.key
                      ? 'border-primary-light/50 bg-primary/20 text-white'
                      : 'border-dark-border text-gray-400 hover:text-white'
                  }`}
                >
                  {chip.label}
                  <b className="ml-1.5 font-display font-semibold tabular-nums text-white">
                    {chip.count}
                  </b>
                </button>
              ))}
            </fieldset>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={copyList}
            >
              Copiar lista
            </Button>
          </div>
          <ul className="m-0 max-h-56 list-none overflow-y-auto p-0">
            {shownItems.map(item => (
              <li
                key={item.name}
                className="flex items-baseline justify-between gap-3 border-t border-dark-border px-3.5 py-2 text-[13.5px] text-gray-200 first:border-t-0"
              >
                <span className="min-w-0 break-words">{item.name}</span>
                {item.appId !== undefined && (
                  <a
                    href={`https://store.steampowered.com/app/${item.appId}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`shrink-0 rounded-sm text-xs text-primary-link hover:underline ${focusRing}`}
                  >
                    Ver na loja ›
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="border-t border-dark-border px-3.5 py-2.5 text-xs text-gray-500">
            Betas, testes e itens removidos {platformLabelOf} costumam não ter
            ficha no catálogo de jogos.
          </p>
        </div>
      )}
    </div>
  )

  const toggle = (
    <button
      type="button"
      onClick={() => setExpanded(value => !value)}
      aria-expanded={expanded}
      aria-controls={expanded ? detailId : undefined}
      className={`flex w-full items-center justify-between gap-3 rounded-md border border-dark-border bg-dark-bg-light px-3 py-2 text-left text-sm text-white transition-colors hover:bg-dark-bg-lighter ${focusRing}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {variant === 'fresh' && (
          <span
            className="size-2 shrink-0 rounded-full bg-amber-400"
            aria-hidden="true"
          />
        )}
        {toggleLabel}
      </span>
      <ChevronRight
        className={`size-4 shrink-0 text-gray-400 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-90' : ''}`}
        aria-hidden="true"
      />
    </button>
  )

  if (variant === 'last') {
    const stats: {
      key: string
      value: number
      label: string
      tone?: string
    }[] = [
      {
        key: 'imported',
        value: imported,
        label: plural(imported, 'Novo', 'Novos'),
        tone: 'text-green-400',
      },
      {
        key: 'updated',
        value: updated,
        label: plural(updated, 'Atualizado', 'Atualizados'),
      },
      {
        key: 'skipped',
        value: skipped,
        label: 'Já na biblioteca',
      },
      ...others.map(section => ({
        key: section.title,
        value: section.result.imported,
        label: SUPPORT_LABELS[section.title]
          ? 'Na lista de desejos'
          : section.title,
      })),
      {
        key: 'missing',
        value: missing,
        label: 'Sem correspondência',
        tone: missing > 0 ? 'text-amber-400' : undefined,
      },
    ]
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-400">
          Última importação{finishedAt ? `, ${formatWhen(finishedAt)}` : ''}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-y-3 p-0">
          {stats.map(stat => (
            <li
              key={stat.key}
              className="flex flex-col gap-1 border-l border-dark-border px-4 first:border-l-0 first:pl-0"
            >
              <b
                className={`font-display text-xl font-bold leading-none tracking-tight tabular-nums ${stat.tone ?? 'text-white'}`}
              >
                {stat.value}
              </b>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
        {missing > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-dark-border pt-2.5">
            <button
              type="button"
              onClick={() => setExpanded(value => !value)}
              aria-expanded={expanded}
              aria-controls={expanded ? detailId : undefined}
              className={`ml-auto inline-flex min-h-8 items-center gap-1 rounded px-1 text-[13px] font-medium text-primary-link hover:underline [@media(max-width:639px)]:min-h-11 ${focusRing}`}
            >
              {toggleLabel}
              <ChevronRight
                className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
        {expanded && details}
      </div>
    )
  }

  const headline =
    imported > 0 ? (
      <>
        <Count className="text-green-400" animate>
          {imported}
        </Count>{' '}
        {plural(imported, 'jogo entrou', 'jogos entraram')} na sua biblioteca
      </>
    ) : (
      'Nenhum jogo novo'
    )

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-balance text-xl font-bold leading-tight text-white tabular-nums">
        {headline}
      </p>
      {supportLine}
      {missing > 0 ? (
        <>
          {toggle}
          {expanded && details}
        </>
      ) : (
        <p className="text-xs text-gray-300">Nada ficou de fora.</p>
      )}
    </div>
  )
}
