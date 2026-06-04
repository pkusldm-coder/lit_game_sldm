import type { FC } from 'react'
import type { Board, Cell, Path } from '../core/types'
import Tile from './Tile'
import './GameBoard.css'

interface GameBoardProps {
  board: Board
  selected: Cell | null
  path: Path | null
  onCellClick: (row: number, col: number) => void
}

const GameBoard: FC<GameBoardProps> = ({ board, selected, path, onCellClick }) => {
  const rows = board.length
  const cols = board[0].length

  const isPathCell = (r: number, c: number): boolean => {
    if (!path) return false
    return path.some(p => p.row === r && p.col === c)
  }

  return (
    <div
      className="lg-board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {board.map((row, r) =>
        row.map((tile, c) => {
          if (!tile) {
            return <div key={`${r}-${c}`} className="lg-cell empty" />
          }
          return (
            <div
              key={`${r}-${c}`}
              className={`lg-cell${isPathCell(r, c) ? ' path-highlight' : ''}`}
            >
              <Tile
                tile={tile}
                selected={selected?.row === r && selected?.col === c}
                onClick={() => onCellClick(r, c)}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default GameBoard
