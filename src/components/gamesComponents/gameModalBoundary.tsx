import { Component, type ReactNode } from 'react'
import { Button } from '../button'
import { GameModal } from './gameModal'

interface GameModalBoundaryProps {
  children: ReactNode
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

    return (
      <div className="flex flex-col items-start gap-4 p-5">
        <GameModal.Title asChild>
          <h2 className="text-lg font-semibold">
            Não foi possível mostrar este jogo
          </h2>
        </GameModal.Title>
        <p className="text-sm text-gray-300">Feche e tente de novo.</p>
        <Button variant="secondary" size="md" onClick={this.props.onClose}>
          Fechar
        </Button>
      </div>
    )
  }
}
