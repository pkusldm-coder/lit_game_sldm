import type { Board, Stone } from './types'
import { BOARD_SIZE } from './config'

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

function getLine(board: Board, row: number, col: number, dr: number, dc: number): (Stone | null)[] {
  const line: (Stone | null)[] = []
  for (let i = -5; i <= 5; i++) {
    const r = row + i * dr
    const c = col + i * dc
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      line.push(board[r][c])
    } else {
      line.push('white')
    }
  }
  return line
}

function countFoursInLine(line: (Stone | null)[]): number {
  let count = 0
  for (let start = 1; start <= 5; start++) {
    const w = line.slice(start, start + 5)
    if (w.some(x => x === 'white')) continue
    const blacks = w.filter(x => x === 'black').length
    if (blacks === 4) count++
  }
  return count
}

function countOpenThreesInLine(line: (Stone | null)[]): number {
  let count = 0
  for (let start = 1; start <= 5; start++) {
    const w = line.slice(start, start + 5)
    if (w.some(x => x === 'white')) continue
    const blacks = w.filter(x => x === 'black').length
    const empties = w.filter(x => x === null).length
    if (blacks === 3 && empties === 2) {
      if (w[0] === null && w[4] === null) count++
    }
  }
  return count
}

function hasOverlineInLine(line: (Stone | null)[]): boolean {
  for (let start = 0; start <= line.length - 6; start++) {
    const w = line.slice(start, start + 6)
    if (w.every(x => x === 'black')) {
      if (start <= 5 && start + 5 >= 5) return true
    }
  }
  return false
}

function hasFiveInLine(line: (Stone | null)[]): boolean {
  for (let start = 1; start <= 5; start++) {
    const w = line.slice(start, start + 5)
    if (w.every(x => x === 'black')) return true
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

  let totalFours = 0
  let totalThrees = 0
  let hasFive = false
  let hasOverline = false

  for (const [dr, dc] of DIRECTIONS) {
    const line = getLine(testBoard, row, col, dr, dc)
    if (hasFiveInLine(line)) hasFive = true
    if (hasOverlineInLine(line)) hasOverline = true
    totalFours += countFoursInLine(line)
    totalThrees += countOpenThreesInLine(line)
  }

  if (hasFive) return { forbidden: false, reason: null }
  if (hasOverline) return { forbidden: true, reason: '长连禁手（超过五子连珠）' }
  if (totalFours >= 2) return { forbidden: true, reason: '四四禁手（同时形成两个四）' }
  if (totalThrees >= 2) return { forbidden: true, reason: '三三禁手（同时形成两个活三）' }

  return { forbidden: false, reason: null }
}

export function getForbiddenWarning(board: Board, row: number, col: number): string | null {
  if (board[row][col] !== null) return null
  const result = checkForbidden(board, row, col)
  return result.forbidden ? result.reason : null
}