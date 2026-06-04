import type { FC } from 'react'
import type { CellState } from '../core/types'
import './GameBoard.css'

interface GameBoardProps {
  board: CellState[][]
  gridSize: number
  rowClues: number[][]
  colClues: number[][]
  onCellClick: (row: number, col: number) => void
  onCellContextMenu: (e: React.MouseEvent, row: number, col: number) => void
}

const GameBoard: FC<GameBoardProps> = ({ board, gridSize, rowClues, colClues, onCellClick, onCellContextMenu }) => {
  const maxColClueLen = Math.max(...colClues.map(c => c.length))
  const maxRowClueLen = Math.max(...rowClues.map(r => r.length))

  return (
    <div className="ng-board-wrapper">
      <div
        className="ng-board"
        style={{
          gridTemplateColumns: `repeat(${maxRowClueLen}, 20px) repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${maxColClueLen}, 18px) repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Top-left corner (empty) */}
        <div className="ng-corner" style={{ gridColumn: `1 / span ${maxRowClueLen}`, gridRow: `1 / span ${maxColClueLen}` }} />

        {/* Column clues */}
        {colClues.map((clues, c) =>
          clues.map((num, i) => (
            <div
              key={`col-${c}-${i}`}
              className="ng-clue ng-col-clue"
              style={{
                gridColumn: maxRowClueLen + c + 1,
                gridRow: i + 1,
              }}
            >
              {num}
            </div>
          ))
        )}

        {/* Row clues */}
        {rowClues.map((clues, r) =>
          clues.map((num, i) => (
            <div
              key={`row-${r}-${i}`}
              className="ng-clue ng-row-clue"
              style={{
                gridColumn: i + 1,
                gridRow: maxColClueLen + r + 1,
              }}
            >
              {num}
            </div>
          ))
        )}

        {/* Cells */}
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`ng-cell${cell === 'filled' ? ' filled' : ''}${cell === 'marked' ? ' marked' : ''}`}
              style={{
                gridColumn: maxRowClueLen + c + 1,
                gridRow: maxColClueLen + r + 1,
              }}
              onClick={() => onCellClick(r, c)}
              onContextMenu={(e) => onCellContextMenu(e, r, c)}
            >
              {cell === 'marked' && '×'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GameBoard
