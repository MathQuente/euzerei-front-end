import { Check } from 'lucide-react'
import { useState } from 'react'
import { USER_GAME_STATUS_ID as STATUS } from '../constants/gameStatus'
import { useAddGame } from '../hooks/useAddGame'
import { useGameStatus } from '../hooks/useGameStatus'
import { Button } from './button'

export function StartPlayingButton({
  igdbId,
  inLibrary,
  celebrating = false,
  onStarted,
}: {
  igdbId: number
  inLibrary: boolean
  celebrating?: boolean
  onStarted: () => void
}) {
  const id = String(igdbId)
  const { updateGameStatus } = useGameStatus(inLibrary ? id : undefined)
  const { addGame } = useAddGame(id)
  const [isSaving, setIsSaving] = useState(false)

  async function startPlaying() {
    setIsSaving(true)
    try {
      if (inLibrary) {
        await updateGameStatus({ statusIds: STATUS.PLAYING })
      } else {
        await addGame({ statusIds: STATUS.PLAYING })
      }
      onStarted()
    } catch {
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      loading={isSaving}
      onClick={startPlaying}
      disabled={celebrating}
      className={`min-h-9 whitespace-nowrap px-4 transition-[background-color,transform] duration-300 disabled:opacity-100 ${
        celebrating ? 'bg-green-700 hover:bg-green-700' : ''
      }`}
    >
      {celebrating ? (
        <>
          <Check className="mr-1.5 size-4" aria-hidden="true" />
          Jogando agora
        </>
      ) : (
        'Começar a jogar'
      )}
    </Button>
  )
}
