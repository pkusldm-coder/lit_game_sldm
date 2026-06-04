import type { Board, Tile } from './types'
import { findAnyMove } from './pathfinder'

let tileIdCounter = 0

export function resetIdCounter(): void {
  tileIdCounter = 0
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateBoard(rows: number, cols: number, tileTypes: number): Board {
  const totalCells = rows * cols
  if (totalCells % 2 !== 0) throw new Error('Board must have even number of cells')

  const tiles: number[] = []
  let remainingPairs = totalCells / 2

  for (let t = 0; t < tileTypes; t++) {
    const pairs = Math.floor(remainingPairs / (tileTypes - t))
    for (let p = 0; p < pairs; p++) {
      tiles.push(t, t)
      remainingPairs--
    }
  }

  shuffleArray(tiles)

  const board: Board = []
  let idx = 0
  for (let r = 0; r < rows; r++) {
    const row: (Tile | null)[] = []
    for (let c = 0; c < cols; c++) {
      const type = tiles[idx++]
      row.push({
        id: tileIdCounter++,
        type,
        removed: false,
      })
    }
    board.push(row)
  }

  return ensureValidBoard(board, rows, cols)
}

function ensureValidBoard(board: Board, rows: number, cols: number, maxAttempts = 500): Board {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const move = findAnyMove(board)
    if (move) return board

    const tiles: Tile[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = board[r][c]
        if (t) tiles.push(t)
      }
    }
    shuffleArray(tiles)
    let idx = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] !== null) {
          board[r][c] = tiles[idx++]
        }
      }
    }
  }
  return board
}

export function removeTiles(board: Board, r1: number, c1: number, r2: number, c2: number): Board {
  const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null))
  newBoard[r1][c1] = null
  newBoard[r2][c2] = null
  return newBoard
}

export function shuffleBoard(board: Board): Board {
  const rows = board.length
  const cols = board[0].length
  const tiles: Tile[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = board[r][c]
      if (t) tiles.push(t)
    }
  }
  shuffleArray(tiles)
  const newBoard = board.map(row => row.map(() => null as Tile | null))
  let idx = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== null) {
        newBoard[r][c] = tiles[idx++]
      }
    }
  }
  return ensureValidBoard(newBoard, rows, cols)
}
