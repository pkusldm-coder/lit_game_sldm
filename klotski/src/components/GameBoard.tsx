import type { FC } from 'react'
import type { Block as BlockData, Direction } from '../core/types'
import BlockEl from './Block'
import './GameBoard.css'

interface GameBoardProps {
  blocks: BlockData[]
  selectedId: number | null
  onSelect: (id: number) => void
  onMove: (id: number, dir: Direction) => void
}

const GameBoard: FC<GameBoardProps> = ({ blocks, selectedId, onSelect, onMove }) => {
  return (
    <div className="kl-board">
      <div className="kl-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }}>
        {blocks.map(b => (
          <BlockEl
            key={b.id}
            block={b}
            blocks={blocks}
            selected={selectedId === b.id}
            onSelect={() => onSelect(b.id)}
            onMove={(dir) => onMove(b.id, dir)}
          />
        ))}
      </div>
      <div className="kl-exit">
        <span className="kl-exit-label">出口</span>
        <div className="kl-exit-gap" />
      </div>
    </div>
  )
}

export default GameBoard
