import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ListToolbarProps, PlatformOption } from '../interfaces/games'
import { fieldFocus, focusRing } from '../styles/focus'
import { menuClass, menuItemClass, menuLabelClass } from '../styles/menu'
import { LIBRARY_PLATFORMS } from '../utils/libraryPlatforms'
import { SORT_FIELD_META, sortLabel, sortOrdersFor } from '../utils/listSort'

const SEARCH_DELAY_MS = 300

const controlClass = `inline-flex h-11 sm:h-9 min-w-0 flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-bg-darker px-3 text-sm text-gray-300 transition-colors hover:border-gray-600 data-[state=open]:border-primary-light/60 ${focusRing}`

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
      <DropdownMenu.Trigger className={controlClass}>
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
          <DropdownMenu.Label className={menuLabelClass}>
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
                className={menuItemClass}
              >
                {SORT_FIELD_META[field].label}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4 text-primary-link" aria-hidden />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className="mx-1 my-1.5 h-px bg-dark-border" />
          <DropdownMenu.Label className={menuLabelClass}>
            Ordem
          </DropdownMenu.Label>
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

const chipClass = `inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 pl-2.5 pr-1.5 text-[13px] text-purple-100 transition-colors hover:bg-primary/25 ${focusRing}`

function FiltersPanel({
  platforms,
  onPlatformsChange,
  platformOptions,
  totalGames,
}: {
  platforms: string[]
  onPlatformsChange: (platforms: string[]) => void
  platformOptions: PlatformOption[]
  totalGames: number
}) {
  function toggle(value: string) {
    onPlatformsChange(
      platforms.includes(value)
        ? platforms.filter(platform => platform !== value)
        : [...platforms, value]
    )
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        className={controlClass}
        aria-label={
          platforms.length > 0
            ? `Filtros, ${platforms.length} ${platforms.length === 1 ? 'ativo' : 'ativos'}`
            : 'Filtros'
        }
      >
        <SlidersHorizontal
          className="size-3.5 shrink-0 text-gray-400"
          aria-hidden
        />
        <span>Filtros</span>
        {platforms.length > 0 && (
          <span
            className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-display text-[11px] font-bold text-white"
            aria-hidden="true"
          >
            {platforms.length}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          aria-label="Filtros"
          className="z-[70] w-[min(18.5rem,calc(100vw-2rem))] rounded-xl border border-dark-border bg-dark-bg-light p-3 shadow-xl shadow-black/50"
        >
          <p className="mb-2 text-xs text-gray-400">Plataforma</p>
          <div className="flex flex-wrap gap-1.5">
            {platformOptions.map(({ value, label, icon: Icon }) => {
              const active = platforms.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(value)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors sm:min-h-8 ${focusRing} ${
                    active
                      ? 'border-primary/55 bg-primary/20 text-white'
                      : 'border-dark-border bg-dark-bg-darker text-gray-300 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {label}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-dark-border pt-2.5">
            <span className="text-xs text-gray-400" aria-live="polite">
              {totalGames.toLocaleString('pt-BR')}{' '}
              {totalGames === 1 ? 'jogo' : 'jogos'}
            </span>
            {platforms.length > 0 && (
              <button
                type="button"
                onClick={() => onPlatformsChange([])}
                className={`rounded-sm px-1 text-[13px] text-primary-link transition-colors hover:text-white ${focusRing}`}
              >
                Limpar
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
  platforms = [],
  onPlatformsChange,
  platformOptions = LIBRARY_PLATFORMS,
  loadingLabel,
}: ListToolbarProps) {
  const hasControls = Boolean(
    onSearchChange || onPlatformsChange || (sortFields && onSortChange)
  )
  const chipCount =
    (onPlatformsChange ? platforms.length : 0) +
    (search && onSearchChange ? 1 : 0)

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
          {onPlatformsChange && (
            <FiltersPanel
              platforms={platforms}
              onPlatformsChange={onPlatformsChange}
              platformOptions={platformOptions}
              totalGames={totalGames}
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
        {loadingLabel && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-primary-link">
            <Loader2
              className="size-3.5 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            {loadingLabel}
          </span>
        )}
        {search && onSearchChange && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label={`Remover busca ${search}`}
            className={chipClass}
          >
            <span className="truncate">
              <span className="text-purple-300/80">Busca:</span> {search}
            </span>
            <X className="size-3.5 shrink-0" aria-hidden />
          </button>
        )}
        {onPlatformsChange &&
          platforms.map(value => {
            const label =
              platformOptions.find(option => option.value === value)?.label ??
              value
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onPlatformsChange(platforms.filter(item => item !== value))
                }
                aria-label={`Remover filtro Plataforma: ${label}`}
                className={chipClass}
              >
                <span className="truncate">
                  <span className="text-purple-300/80">Plataforma:</span>{' '}
                  {label}
                </span>
                <X className="size-3.5 shrink-0" aria-hidden />
              </button>
            )
          })}
        {chipCount > 1 && (
          <button
            type="button"
            onClick={() => {
              onSearchChange?.('')
              onPlatformsChange?.([])
            }}
            className={`rounded-sm px-1.5 py-1 text-[13px] text-primary-link transition-colors hover:text-white ${focusRing}`}
          >
            Limpar tudo
          </button>
        )}
      </div>
    </div>
  )
}
