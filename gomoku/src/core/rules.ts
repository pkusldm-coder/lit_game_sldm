import type { Board } from './types'
import { analyzeDirection, hasExactlyFive } from './GameEngine'

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

function countFours(board: Board, row: number, col: number): number {
  let count = 0
  for (const [dr, dc] of DIRECTIONS) {
    const a = analyzeDirection(board, row, col, 'black', dr, dc)
    if (a.total === 4 && (a.bothOpen || a.oneOpen)) {
      count++
    }
  }
  return count
}

function countOpenThrees(board: Board, row: number, col: number): number {
  let count = 0
  for (const [dr, dc] of DIRECTIONS) {
    const a = analyzeDirection(board, row, col, 'black', dr, dc)
    if (a.total === 3 && a.bothOpen) {
      count++
    }
  }
  return count
}

function hasOverline(board: Board, row: number, col: number): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    const a = analyzeDirection(board, row, col, 'black', dr, dc)
    if (a.total >= 6) return true
  }
  return false
}

export interface ForbiddenCheckResult {
  forbidden: boolean
  reason: string | null
}

export function checkForbidden(board: Board, row: number, col: number): ForbiddenCheckResult {
  const testBoard = board.map(r => [...r])
  testBoard[row][col] = 'black'

  // Five takes precedence over forbidden moves
  if (hasExactlyFive(testBoard, row, col, 'black')) {
    return { forbidden: false, reason: null }
  }

  if (hasOverline(testBoard, row, col)) {
    return { forbidden: true, reason: '长连禁手（超过五子连珠）' }
  }

  const fours = countFours(testBoard, row, col)
  if (fours >= 2) {
    return { forbidden: true, reason: '四四禁手（同时形成两个四）' }
  }

  const threes = countOpenThrees(testBoard, row, col)
  if (threes >= 2) {
    return { forbidden: true, reason: '三三禁手（同时形成两个活三）' }
  }

  return { forbidden: false, reason: null }
}

export function getForbiddenWarning(board: Board, row: number, col: number): string | null {
  if (board[row][col] !== null) return null
  const result = checkForbidden(board, row, col)
  return result.forbidden ? result.reason : null
}
