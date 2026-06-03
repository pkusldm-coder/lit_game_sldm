import type { RawBoard } from './types'
import { BOARD_SIZE, BOX_SIZE } from './types'

export function isValidPlacement(board: RawBoard, row: number, col: number, num: number): boolean {
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[row][i] === num || board[i][col] === num) return false
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (board[r][c] === num) return false
    }
  }
  return true
}

export function findEmptyCell(board: RawBoard): [number, number] | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return [r, c]
    }
  }
  return null
}

export function solveBoard(board: RawBoard): RawBoard | null {
  const copy = board.map(row => [...row])
  if (solveRecursive(copy)) return copy
  return null
}

function solveRecursive(board: RawBoard): boolean {
  const empty = findEmptyCell(board)
  if (!empty) return true
  const [r, c] = empty

  const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const num of nums) {
    if (isValidPlacement(board, r, c, num)) {
      board[r][c] = num
      if (solveRecursive(board)) return true
      board[r][c] = 0
    }
  }
  return false
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function countSolutions(board: RawBoard, limit: number = 2): number {
  let count = 0
  const copy = board.map(row => [...row])

  function countRecursive(): void {
    if (count >= limit) return
    const empty = findEmptyCell(copy)
    if (!empty) {
      count++
      return
    }
    const [r, c] = empty
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(copy, r, c, num)) {
        copy[r][c] = num
        countRecursive()
        copy[r][c] = 0
        if (count >= limit) return
      }
    }
  }

  countRecursive()
  return count
}
