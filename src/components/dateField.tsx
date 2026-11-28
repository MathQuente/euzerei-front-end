import * as Popover from '@radix-ui/react-popover'
import { CalendarDays } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { focusRing } from '../styles/focus'
import {
  brToIso,
  isoToBr,
  MIN_DATE,
  maskDate,
  parseIso,
  toIsoDate,
} from '../utils/dateInput'

const wrapperClass =
  'inline-flex h-9 items-center rounded-lg border border-dark-border bg-dark-bg-darker pl-3 pr-1 text-sm transition-colors hover:border-gray-600 focus-within:border-primary-light/60 has-[:disabled]:opacity-50 has-[[aria-invalid=true]]:border-red-500/70'

const pickerStyle = {
  '--rdp-accent-color': '#9D52E8',
  '--rdp-accent-background-color': '#25262F',
  '--rdp-day-height': '2rem',
  '--rdp-day-width': '2rem',
  '--rdp-nav-height': '2rem',
  '--rdp-months-gap': '1rem',
  fontSize: '0.8125rem',
} as React.CSSProperties

const pickerClass =
  '[&_select]:rounded-md [&_select]:bg-dark-bg-light [&_select]:text-white [&_select]:[color-scheme:dark] [&_.rdp-weekday]:text-xs [&_.rdp-weekday]:text-gray-400 text-gray-300'

const contentClass =
  'z-[70] rounded-xl border border-dark-border bg-dark-bg-light p-2 shadow-xl shadow-black/50'

const START_MONTH = new Date(1980, 0)

export function DateField({
  id,
  value,
  onChange,
  disabled,
  clearable = true,
  min,
}: {
  id?: string
  value: string
  onChange: (iso: string, valid: boolean) => void
  disabled?: boolean
  clearable?: boolean
  min?: string
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(isoToBr(value))
  const lastEmitted = useRef(value)
  const selected = parseIso(value)
  const today = new Date()

  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    setText(isoToBr(value))
  }, [value])

  function emit(iso: string, valid: boolean) {
    lastEmitted.current = iso
    onChange(iso, valid)
  }

  function type(raw: string) {
    const masked = maskDate(raw)
    setText(masked)
    const iso = masked === '' ? '' : (brToIso(masked) ?? '')
    emit(
      iso,
      masked === '' ||
        (iso !== '' &&
          iso <= toIsoDate(today) &&
          iso >= MIN_DATE &&
          (!min || iso >= min))
    )
  }

  function pick(iso: string) {
    setText(isoToBr(iso))
    emit(iso, true)
    setOpen(false)
  }

  const parsed = brToIso(text)
  const complete = text.length === 10
  const message =
    text === ''
      ? null
      : parsed !== null && parsed > toIsoDate(today)
        ? 'A data não pode ser no futuro.'
        : parsed !== null && min && parsed < min
          ? 'A data não pode ser anterior ao lançamento do jogo.'
          : parsed !== null && parsed < MIN_DATE
            ? 'Use uma data a partir de 1970.'
            : complete && parsed === null
              ? 'Essa data não existe.'
              : null
  const invalid = message !== null
  const errorId = useId()

  return (
    <div className="flex flex-col items-end gap-1">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div className={wrapperClass}>
            <input
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={text}
              onChange={e => type(e.target.value)}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={invalid ? errorId : undefined}
              className="w-24 bg-transparent tabular-nums text-white outline-none placeholder:text-gray-500"
            />
            <Popover.Trigger
              disabled={disabled}
              aria-label="Abrir calendário"
              className={`grid size-7 place-items-center rounded-md text-gray-400 hover:text-gray-200 ${focusRing}`}
            >
              <CalendarDays className="size-4" aria-hidden />
            </Popover.Trigger>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            collisionPadding={12}
            className={contentClass}
          >
            <DayPicker
              mode="single"
              locale={ptBR}
              captionLayout="dropdown"
              startMonth={START_MONTH}
              endMonth={today}
              defaultMonth={selected ?? today}
              selected={selected ?? undefined}
              disabled={{
                after: today,
                before: parseIso(min ?? '') ?? undefined,
              }}
              style={pickerStyle}
              className={pickerClass}
              onSelect={date => date && pick(toIsoDate(date))}
            />
            <div className="flex justify-between px-1 pt-1">
              <button
                type="button"
                className={`rounded-md px-2 py-1 text-xs text-primary-link hover:underline ${focusRing}`}
                onClick={() => pick(toIsoDate(today))}
              >
                Hoje
              </button>
              {clearable && value && (
                <button
                  type="button"
                  className={`rounded-md px-2 py-1 text-xs text-gray-400 hover:text-gray-300 ${focusRing}`}
                  onClick={() => {
                    setText('')
                    emit('', true)
                    setOpen(false)
                  }}
                >
                  Limpar
                </button>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {message && (
        <p id={errorId} className="text-[13px] leading-snug text-red-400">
          {message}
        </p>
      )}
    </div>
  )
}
