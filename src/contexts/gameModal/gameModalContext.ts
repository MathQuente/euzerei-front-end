import { createContext } from 'react'
import type { GameCardData } from '../../types/games'

export type OpenGameModal = (
  game: GameCardData,
  trigger: HTMLElement | null
) => void

export const GameModalContext = createContext<OpenGameModal | null>(null)
