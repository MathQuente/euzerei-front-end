import { useContext } from 'react'
import { GameModalContext } from '../contexts/gameModal/gameModalContext'

export function useGameModal() {
  const openGame = useContext(GameModalContext)
  if (!openGame) {
    throw new Error('useGameModal must be used inside GameModalProvider')
  }
  return openGame
}
