import type { FC } from 'react'
import type { TileData } from '../core/types'
import Tile from './Tile'
import './GameBoard.css'

interface GameBoardProps {
  gridSize: number
  tiles: TileData[]
  isEraseMode?: boolean
  onCellClick?: (row: number, col: number) => void
}

const GameBoard: FC<GameBoardProps> = ({ gridSize, tiles, isEraseMode, onCellClick }) => {
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => ({
    row: Math.floor(i / gridSize),
    col: i % gridSize,
  }))

  return (
    <div className="game-board" data-size={gridSize}>
      <div className="grid-bg">
        {cells.map(({ row, col }) => (
          <div
            key={`${row}-${col}`}
            className={`grid-cell${isEraseMode ? ' erase-mode' : ''}`}
            onClick={() => isEraseMode && onCellClick?.(row, col)}
          />
        ))}
      </div>
      <div className="tiles-layer">
        {tiles.map(t => (
          <Tile
            key={t.id}
            value={t.value}
            row={t.row}
            col={t.col}
            gridSize={gridSize}
            isNew={t.isNew}
            isMerged={t.isMerged}
          />
        ))}
      </div>
    </div>
  )
}

export default GameBoard