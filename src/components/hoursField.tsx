import { useEffect, useId, useRef, useState } from 'react'
import { inlineFieldFocus } from '../styles/focus'
import { joinHours, splitHours } from '../utils/hours'

const boxClass = `w-14 text-right rounded-md bg-dark-bg px-2 py-1 text-sm text-white tabular-nums placeholder:text-gray-500 ${inlineFieldFocus} disabled:opacity-50`

function parts(value: number | null) {
  if (value === null) return { h: '', m: '' }
  const { hours, minutes } = splitHours(value)
  return { h: String(hours), m: String(minutes) }
}

function digits(raw: string, max: number) {
  return raw
    .replace(/\D/g, '')
    .slice(0, max)
    .replace(/^0+(?=\d)/, '')
}

export function HoursField({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
  label: string
}) {
  const hId = useId()
  const initial = parts(value)
  const [h, setH] = useState(initial.h)
  const [m, setM] = useState(initial.m)

  const lastEmitted = useRef(value)

  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    const next = parts(value)
    setH(next.h)
    setM(next.m)
  }, [value])

  function update(nextH: string, nextM: string) {
    setH(nextH)
    setM(nextM)
    const next =
      nextH === '' && nextM === ''
        ? null
        : joinHours(Number(nextH), Number(nextM))
    lastEmitted.current = next
    onChange(next)
  }

  return (
    <fieldset className="flex items-center gap-1.5 border-0 p-0 m-0 min-w-0">
      <legend className="sr-only">{label}</legend>
      <input
        id={hId}
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={h}
        onChange={e => update(digits(e.target.value, 4), m)}
        disabled={disabled}
        aria-label={`${label}: horas`}
        className={boxClass}
      />
      <span className="text-xs text-gray-400">h</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={m}
        onChange={e => {
          const next = digits(e.target.value, 2)
          update(h, next !== '' && Number(next) > 59 ? '59' : next)
        }}
        disabled={disabled}
        aria-label={`${label}: minutos`}
        className={boxClass}
      />
      <span className="text-xs text-gray-400">min</span>
    </fieldset>
  )
}
