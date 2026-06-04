import type { Board, Tile } from './types'

let tileIdCounter = 0

export function resetIdCounter(): void {
  tileIdCounter = 0
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function generateBoard(rows: number, cols: number, tileTypes: number): Board {
  const board: Board = []
  for (let r = 0; r < rows; r++) {
    const row: (Tile | null)[] = []
    for (let c = 0; c < cols; c++) {
      let type: number
      do {
        type = randInt(tileTypes)
      } while (
        (c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
        (r >= 2 && board[r - 1][c]?.type === type && board[r - 2][c]?.type === type)
      )
      row.push({ id: tileIdCounter++, type })
    }
    board.push(row)
  }
  return board
}

export function removeMatches(board: Board, matches: [number, number][]): Board {
  const newBoard = board.map(row => row.map(t => t ? { ...t } : null))
  for (const [r, c] of matches) {
    newBoard[r][c] = null
  }
  return newBoard
}

export function dropTiles(board: Board): Board {
  const rows = board.length
  const cols = board[0].length
  const newBoard = board.map(row => row.map(t => t ? { ...t } : null))

  for (let c = 0; c < cols; c++) {
    let writeRow = rows - 1
    for (let r = rows - 1; r >= 0; r--) {
      if (newBoard[r][c] !== null) {
        if (r !== writeRow) {
          newBoard[writeRow][c] = newBoard[r][c]
          newBoard[r][c] = null
        }
        writeRow--
      }
    }
  }

  return newBoard
}

export function fillEmpty(board: Board, tileTypes: number): Board {
  const newBoard = board.map(row => row.map(t => t ? { ...t } : null))
  const cols = board[0].length

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < board.length; r++) {
      if (newBoard[r][c] === null) {
        newBoard[r][c] = { id: tileIdCounter++, type: randInt(tileTypes) }
      }
    }
  }

  return newBoard
}

export function swapTiles(board: Board, r1: number, c1: number, r2: number, c2: number): Board {
  const newBoard = board.map(row => row.map(t => t ? { ...t } : null))
  const temp = newBoard[r1][c1]
  newBoard[r1][c1] = newBoard[r2][c2]
  newBoard[r2][c2] = temp
  return newBoard
}
