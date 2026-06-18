import type { Stone, Board } from './types'
import { BOARD_SIZE } from './types'

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

export function cloneBoard(board: Board): Board {
  return board.map(r => [...r])
}

const DIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]]

function getGroup(board: Board, row: number, col: number): [number, number][] {
  const stone = board[row][col]
  if (!stone) return []
  const visited = new Set<string>()
  const group: [number, number][] = []
  const stack: [number, number][] = [[row, col]]
  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    visited.add(key)
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue
    if (board[r][c] !== stone) continue
    group.push([r, c])
    for (const [dr, dc] of DIRS) stack.push([r + dr, c + dc])
  }
  return group
}

function getLiberties(board: Board, group: [number, number][]): number {
  let liberties = 0
  const counted = new Set<string>()
  for (const [r, c] of group) {
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue
      if (board[nr][nc] !== null) continue
      const key = `${nr},${nc}`
      if (!counted.has(key)) {
        counted.add(key)
        liberties++
      }
    }
  }
  return liberties
}

export function placeStone(board: Board, row: number, col: number, stone: Stone): Board | null {
  const newBoard = cloneBoard(board)
  newBoard[row][col] = stone

  const opponent: Stone = stone === 'black' ? 'white' : 'black'
  let captured: [number, number][] = []

  for (const [dr, dc] of DIRS) {
    const nr = row + dr
    const nc = col + dc
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue
    if (newBoard[nr][nc] !== opponent) continue
    const group = getGroup(newBoard, nr, nc)
    if (getLiberties(newBoard, group) === 0) {
      captured = [...captured, ...group]
      for (const [gr, gc] of group) newBoard[gr][gc] = null
    }
  }

  const selfGroup = getGroup(newBoard, row, col)
  if (getLiberties(newBoard, selfGroup) === 0) return null

  return newBoard
}

export function isValidMove(board: Board, row: number, col: number, stone: Stone, lastBoard: Board | null): boolean {
  if (board[row][col] !== null) return false
  const newBoard = placeStone(board, row, col, stone)
  if (!newBoard) return false
  if (lastBoard && boardsEqual(newBoard, lastBoard)) return false
  return true
}

function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false
    }
  }
  return true
}

export function getAllValidMoves(board: Board, stone: Stone, lastBoard: Board | null): [number, number][] {
  const moves: [number, number][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, stone, lastBoard)) moves.push([r, c])
    }
  }
  return moves
}

export function countCaptures(board: Board, stone: Stone): number {
  let count = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === stone) count++
    }
  }
  return count
}

export function calculateScore(board: Board, blackTerritory: number, whiteTerritory: number, komi: number): { black: number; white: number } {
  const blackStones = countCaptures(board, 'black')
  const whiteStones = countCaptures(board, 'white')
  return {
    black: blackStones + blackTerritory,
    white: whiteStones + whiteTerritory + komi,
  }
}