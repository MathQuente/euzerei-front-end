import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ArrowUpDown, Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ListToolbarProps } from '../interfaces/games'
import { fieldFocus, focusRing } from '../styles/focus'
import { SORT_FIELD_META, sortLabel, sortOrdersFor } from '../utils/listSort'

const SEARCH_DELAY_MS = 300

const controlClass = `inline-flex h-11 sm:h-9 min-w-0 flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-bg-darker px-3 text-sm text-gray-300 transition-colors hover:border-gray-600 data-[state=open]:border-primary-light/60 ${focusRing}`

const menuClass =
  'z-[70] w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-dark-border bg-dark-bg-light p-1.5 shadow-xl shadow-black/50'

const labelClass = 'px-2.5 pt-2 pb-1 text-[11px] text-gray-500'

const itemClass =
  'flex w-full min-h-11 sm:min-h-9 cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 text-sm text-gray-300 outline-none transition-colors data-[highlighted]:bg-dark-bg-lighter data-[highlighted]:text-white data-[state=checked]:text-white'

function SortMenu({
  sortField,
  sortOrder,
  sortFields,
  onSortChange,
}: Pick<
  ListToolbarProps,
  'sortField' | 'sortOrder' | 'sortFields' | 'onSortChange'
>) {
  if (!sortFields || !onSortChange) return null
  const { orderLabels } = SORT_FIELD_META[sortField]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`${controlClass} sm:ml-auto`}>
        <ArrowUpDown className="size-3.5 shrink-0 text-gray-400" aria-hidden />
        <span className="hidden text-gray-400 sm:inline">Ordenar</span>
        <span className="truncate font-medium">
          {sortLabel(sortField, sortOrder)}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-gray-400" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className={menuClass}
        >
          <DropdownMenu.Label className={labelClass}>
            Ordenar por
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={sortField}
            onValueChange={value => {
              const field = value as typeof sortField
              onSortChange(field, SORT_FIELD_META[field].defaultOrder)
            }}
          >
            {sortFields.map(field => (
              <DropdownMenu.RadioItem
                key={field}
                value={field}
                onSelect={event => event.preventDefault()}
                className={itemClass}
              >
                {SORT_FIELD_META[field].label}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4 text-primary-link" aria-hidden />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className="mx-1 my-1.5 h-px bg-dark-border" />
          <DropdownMenu.Label className={labelClass}>Ordem</DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={sortOrder}
            onValueChange={value =>
              onSortChange(sortField, value as typeof sortOrder)
            }
            className="mx-1 mb-1 grid grid-cols-2 gap-0.5 rounded-lg border border-dark-border bg-dark-bg-darker p-0.5"
          >
            {sortOrdersFor(sortField).map(order => (
              <DropdownMenu.RadioItem
                key={order}
                value={order}
                onSelect={event => event.preventDefault()}
                className="flex min-h-11 sm:min-h-8 cursor-pointer items-center justify-center rounded-md px-2 text-center text-[13px] text-gray-400 outline-none transition-colors data-[highlighted]:text-white data-[state=checked]:bg-primary/25 data-[state=checked]:text-white"
              >
                {orderLabels[order]}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function SearchField({
  search,
  placeholder,
  onSearchChange,
}: {
  search: string
  placeholder: string
  onSearchChange: (value: string) => void
}) {
  const [draft, setDraft] = useState(search)
  const timer = useRef<number | undefined>(undefined)
  const sent = useRef(search)

  useEffect(() => {
    if (search === sent.current) return
    window.clearTimeout(timer.current)
    sent.current = search
    setDraft(search)
  }, [search])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function send(value: string) {
    sent.current = value
    onSearchChange(value)
  }

  function change(value: string) {
    setDraft(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const next = value.trim()
      if (next !== sent.current) send(next)
    }, SEARCH_DELAY_MS)
  }

  function clear() {
    window.clearTimeout(timer.current)
    setDraft('')
    send('')
  }

  return (
    <div className="relative flex basis-full items-center sm:basis-auto sm:w-72">
      <Search
        className="pointer-events-none absolute left-2.5 size-4 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={draft}
        onChange={event => change(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className={`h-11 w-full rounded-lg border border-dark-border bg-dark-bg-darker pl-8 pr-8 text-sm text-white placeholder-gray-500 transition-colors duration-150 sm:h-9 [@media(max-width:639px)]:text-base [&::-webkit-search-cancel-button]:hidden ${fieldFocus}`}
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpar busca"
          className={`absolute right-1 inline-flex size-9 items-center justify-center rounded-sm text-gray-400 transition-colors hover:text-gray-300 sm:size-7 ${focusRing}`}
        >
          <X size={15} aria-hidden />
        </button>
      )}
    </div>
  )
}

function StatusTabs({
  tabs,
  current,
  onSelect,
}: {
  tabs: NonNullable<ListToolbarProps['statusTabs']>
  current: ListToolbarProps['currentStatus']
  onSelect: NonNullable<ListToolbarProps['onStatusChange']>
}) {
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  return (
    <nav
      aria-label="Status da biblioteca"
      className="-mx-1 flex gap-0.5 overflow-x-auto border-b border-dark-border px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map(tab => {
        const active = tab.value === current
        return (
          <a
            key={tab.value}
            ref={active ? activeRef : undefined}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            onClick={event => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey
              ) {
                return
              }
              event.preventDefault()
              onSelect(tab.value)
            }}
            className={`-mb-px inline-flex min-h-11 sm:min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm transition-colors ${focusRing} ${
              active
                ? 'border-primary-light font-semibold text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`font-display text-[11px] tabular-nums ${tab.countClass ?? 'text-gray-500'}`}
              >
                {tab.count}
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}

export function ListToolbar({
  totalGames,
  sortField,
  sortOrder,
  sortFields,
  onSortChange,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Buscar',
  statusTabs,
  currentStatus,
  onStatusChange,
}: ListToolbarProps) {
  const hasControls = Boolean(onSearchChange || (sortFields && onSortChange))

  return (
    <div className="flex flex-col gap-2.5">
      {statusTabs && onStatusChange && (
        <StatusTabs
          tabs={statusTabs}
          current={currentStatus}
          onSelect={onStatusChange}
        />
      )}

      {hasControls && (
        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange && (
            <SearchField
              search={search}
              placeholder={searchPlaceholder}
              onSearchChange={onSearchChange}
            />
          )}
          <SortMenu
            sortField={sortField}
            sortOrder={sortOrder}
            sortFields={sortFields}
            onSortChange={onSortChange}
          />
        </div>
      )}

      <div
        className="flex min-h-7 flex-wrap items-center gap-2"
        aria-live="polite"
      >
        <p className="mr-1 text-sm text-gray-400">
          {totalGames.toLocaleString('pt-BR')}{' '}
          {totalGames === 1 ? 'jogo' : 'jogos'}
        </p>
        {search && onSearchChange && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label={`Remover busca ${search}`}
            className={`inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 pl-2.5 pr-1.5 text-[13px] text-purple-100 transition-colors hover:bg-primary/25 ${focusRing}`}
          >
            <span className="truncate">
              <span className="text-purple-300/80">Busca:</span> {search}
            </span>
            <X className="size-3.5 shrink-0" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
