import type { FC } from 'react'
import type { Board, Cell } from '../core/types'
import MatchTile from './Tile'
import './GameBoard.css'

interface GameBoardProps {
  board: Board
  selected: Cell | null
  onCellClick: (row: number, col: number) => void
}

const GameBoard: FC<GameBoardProps> = ({ board, selected, onCellClick }) => {
  const rows = board.length
  const cols = board[0].length

  return (
    <div
      className="mg-board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {board.map((row, r) =>
        row.map((tile, c) => (
          <div key={`${r}-${c}`} className="mg-cell">
            {tile && (
              <MatchTile
                type={tile.type}
                selected={selected?.row === r && selected?.col === c}
                onClick={() => onCellClick(r, c)}
              />
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default GameBoard
