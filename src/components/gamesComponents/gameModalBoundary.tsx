import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { GameCardData } from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { Button, buttonClasses } from '../button'
import { GameModal } from './gameModal'

interface GameModalBoundaryProps {
  children: ReactNode
  game: GameCardData
  onClose: () => void
}

export class GameModalBoundary extends Component<
  GameModalBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    const { game, onClose } = this.props

    return (
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <GameModal.Title asChild>
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white">
              <span
                className="h-4 w-[3px] shrink-0 rounded-sm bg-red-400"
                aria-hidden="true"
              />
              Não foi possível abrir este jogo
            </h2>
          </GameModal.Title>
          <p className="text-sm leading-relaxed text-gray-300">
            Algo deu errado ao montar os detalhes de{' '}
            <span className="font-medium text-white">{game.name}</span>. Seus
            dados não foram alterados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => this.setState({ failed: false })}
          >
            Tentar de novo
          </Button>
          <Link
            to={gamePath(game)}
            onClick={onClose}
            className={buttonClasses({ variant: 'secondary', size: 'md' })}
          >
            Abrir a página do jogo
          </Link>
          <Button variant="ghost" size="md" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    )
  }
}
