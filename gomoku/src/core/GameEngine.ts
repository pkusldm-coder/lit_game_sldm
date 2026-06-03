import type { Board, Stone } from './types'
import { BOARD_SIZE } from './config'

export function createBoard(size: number = BOARD_SIZE): Board {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row])
}

export function placeStone(board: Board, row: number, col: number, stone: Stone): Board {
  const newBoard = cloneBoard(board)
  newBoard[row][col] = stone
  return newBoard
}

export function isValidMove(board: Board, row: number, col: number): boolean {
  return (
    row >= 0 && row < board.length &&
    col >= 0 && col < board[0].length &&
    board[row][col] === null
  )
}

const DIRECTIONS: [number, number][] = [
  [0, 1],  // horizontal
  [1, 0],  // vertical
  [1, 1],  // diagonal ↘
  [1, -1], // diagonal ↗
]

export interface DirectionAnalysis {
  total: number
  bothOpen: boolean
  oneOpen: boolean
}

export function analyzeDirection(board: Board, row: number, col: number, stone: Stone, dr: number, dc: number): DirectionAnalysis {
  const size = board.length

  let countPos = 0
  let r = row + dr
  let c = col + dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
    countPos++
    r += dr
    c += dc
  }
  const posOpen = r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null

  let countNeg = 0
  r = row - dr
  c = col - dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
    countNeg++
    r -= dr
    c -= dc
  }
  const negOpen = r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null

  const total = 1 + countPos + countNeg
  const bothOpen = posOpen && negOpen
  const oneOpen = posOpen !== negOpen

  return { total, bothOpen, oneOpen }
}

export function getWinLine(board: Board, row: number, col: number, stone: Stone): [number, number][] | null {
  const size = board.length

  for (const [dr, dc] of DIRECTIONS) {
    let countPos = 0
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      countPos++
      r += dr
      c += dc
    }

    let countNeg = 0
    r = row - dr
    c = col - dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      countNeg++
      r -= dr
      c -= dc
    }

    const total = 1 + countPos + countNeg
    if (total >= 5) {
      const line: [number, number][] = []
      // Start from negative end
      r = row - countNeg * dr
      c = col - countNeg * dc
      for (let i = 0; i < total; i++) {
        line.push([r, c])
        r += dr
        c += dc
      }
      return line
    }
  }

  return null
}

export function checkFiveInARow(board: Board, row: number, col: number, stone: Stone): boolean {
  const size = board.length
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      count++
      r += dr
      c += dc
    }
    r = row - dr
    c = col - dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      count++
      r -= dr
      c -= dc
    }
    if (count >= 5) return true
  }
  return false
}

export function hasExactlyFive(board: Board, row: number, col: number, stone: Stone): boolean {
  const size = board.length
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      count++
      r += dr
      c += dc
    }
    r = row - dr
    c = col - dc
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === stone) {
      count++
      r -= dr
      c -= dc
    }
    if (count === 5) return true
  }
  return false
}
