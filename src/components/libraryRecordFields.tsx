import { Minus, Plus } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useCompletedAt } from '../hooks/useCompletedAt'
import { useHoursPlayed } from '../hooks/useHoursPlayed'
import { usePlayedCount } from '../hooks/usePlayedCount'
import type { GameCardData } from '../types/games'
import { Button } from './button'
import { DateField } from './dateField'
import { HoursField } from './hoursField'
import { IconButton } from './iconButton'

const MAX_HOURS = 9999.9

export function LibraryRecordFields({
  game,
  isPlayed,
  endless = false,
  minDate,
}: {
  game: GameCardData
  isPlayed: boolean
  endless?: boolean
  minDate?: string
}) {
  const igdbId = game.igdbId.toString()
  const hoursErrorId = useId()
  const dateId = useId()

  const {
    hoursPlayed,
    updateHoursPlayed,
    isLoading: hoursLoading,
  } = useHoursPlayed(igdbId)
  const {
    completedAt,
    updateCompletedAt,
    isLoading: dateLoading,
  } = useCompletedAt(igdbId)
  const { completions, updatePlayedCount } = usePlayedCount(igdbId)

  const [hours, setHours] = useState<number | null>(hoursPlayed)
  const [dateOk, setDateOk] = useState(true)
  const [date, setDate] = useState(completedAt ?? '')

  useEffect(() => {
    setHours(hoursPlayed)
  }, [hoursPlayed])

  useEffect(() => {
    setDate(completedAt ?? '')
    setDateOk(true)
  }, [completedAt])

  const hoursValid = hours !== null && hours >= 0 && hours <= MAX_HOURS
  const hoursDirty = hoursValid && hours !== hoursPlayed

  const dateValid = dateOk && date !== ''
  const dateDirty = isPlayed && dateValid && date !== completedAt

  const isDirty = hoursDirty || dateDirty
  const isBusy = hoursLoading || dateLoading
  const minimum = isPlayed ? 1 : 0
  const count = Math.max(completions ?? 0, minimum)

  async function handleSave() {
    if (hoursDirty) await updateHoursPlayed(hours as number)
    if (dateDirty) await updateCompletedAt(date)
  }

  return (
    <div className="flex flex-col gap-2.5 w-full p-3 rounded-lg bg-dark-bg-lighter">
      <div className="flex items-center justify-between gap-3 min-h-11">
        <span className="text-xs text-gray-400">Horas jogadas</span>
        <HoursField
          value={hours}
          onChange={setHours}
          disabled={isBusy}
          label="Horas jogadas"
        />
      </div>
      {!hoursValid && (
        <p id={hoursErrorId} className="text-[13px] leading-snug text-red-400">
          Informe as horas e os minutos jogados.
        </p>
      )}

      {!endless && (
        <div className="flex items-center justify-between gap-3 min-h-11">
          <span className="text-xs text-gray-400">Vezes zerado</span>
          <div className="flex items-center gap-1">
            <IconButton
              variant="bare"
              onClick={() => updatePlayedCount(-1)}
              disabled={count <= minimum}
              title="Diminuir vezes zerado"
              aria-label="Diminuir vezes zerado"
            >
              <Minus className="size-4" />
            </IconButton>
            <span className="w-6 text-center text-sm font-medium text-white tabular-nums">
              {count}
            </span>
            <IconButton
              variant="bare"
              onClick={() => updatePlayedCount(1)}
              title="Aumentar vezes zerado"
              aria-label="Aumentar vezes zerado"
            >
              <Plus className="size-4" />
            </IconButton>
          </div>
        </div>
      )}

      {isPlayed && (
        <div className="flex items-center justify-between gap-3 min-h-11">
          <label htmlFor={dateId} className="text-xs text-gray-400">
            Finalizado em
          </label>
          <DateField
            id={dateId}
            min={minDate}
            value={date}
            onChange={(iso, ok) => {
              setDate(iso)
              setDateOk(ok)
            }}
            disabled={isBusy}
          />
        </div>
      )}

      {isDirty && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isBusy}
          >
            Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
