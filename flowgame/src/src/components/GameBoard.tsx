import type { FC } from 'react'
import type { Board } from '../core/types'
import './GameBoard.css'

interface GameBoardProps {
  board: Board
  gridSize: number
  colors: { id: number; color: string }[]
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
}

const GameBoard: FC<GameBoardProps> = ({ board, gridSize, colors, onPointerDown, onPointerMove, onPointerUp }) => {
  const colorMap = new Map(colors.map(c => [c.id, c.color]))

  return (
    <div
      className="fg-board"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const bg = cell.colorId !== null ? colorMap.get(cell.colorId) || '#ccc' : '#e8e0d0'
          const isEndpoint = cell.isEndpoint
          return (
            <div
              key={`${r}-${c}`}
              className={`fg-cell${isEndpoint ? ' endpoint' : ''}`}
              data-row={r}
              data-col={c}
              style={{ background: bg }}
            >
              {isEndpoint && <div className="fg-dot" style={{ background: colorMap.get(cell.colorId!) }} />}
            </div>
          )
        })
      )}
    </div>
  )
}

export default GameBoard
