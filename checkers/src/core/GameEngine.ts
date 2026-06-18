import type { PlayerColor, CellState } from './types'
import { OPPOSITE } from './types'

export type QR = [number, number]

const HEX_DIRS: QR[] = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]

function armCells(armIdx: number): QR[] {
  const cells: QR[] = []
  if (armIdx === 0) {
    for (let q = 5; q <= 8; q++) for (let r = -4; r <= -q + 4; r++) cells.push([q, r])
  } else if (armIdx === 1) {
    for (let r = 5; r <= 8; r++) for (let q = -4; q <= -r + 4; q++) cells.push([q, r])
  } else if (armIdx === 2) {
    for (let s = 5; s <= 8; s++) for (let q = -4; q <= -s + 4; q++) cells.push([q, -q - s])
  } else if (armIdx === 3) {
    for (let q = -5; q >= -8; q--) for (let r = -q - 4; r <= 4; r++) cells.push([q, r])
  } else if (armIdx === 4) {
    for (let r = -5; r >= -8; r--) for (let q = -r - 4; q <= 4; q++) cells.push([q, r])
  } else if (armIdx === 5) {
    for (let s = -5; s >= -8; s--) for (let q = -s - 4; q <= 4; q++) cells.push([q, -q - s])
  }
  return cells
}

function hexCells(): QR[] {
  const cells: QR[] = []
  for (let q = -4; q <= 4; q++) {
    for (let r = Math.max(-4, -4 - q); r <= Math.min(4, 4 - q); r++) {
      cells.push([q, r])
    }
  }
  return cells
}

export const ALL_CELLS: QR[] = [...hexCells(), ...armCells(0), ...armCells(1), ...armCells(2), ...armCells(3), ...armCells(4), ...armCells(5)]

const ARM_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export function getStartPositions(color: PlayerColor): QR[] {
  const armIdx = ARM_COLORS.indexOf(color)
  return armCells(armIdx)
}

export function getGoalPositions(color: PlayerColor): QR[] {
  return getStartPositions(OPPOSITE[color])
}

const CELL_SET = new Set(ALL_CELLS.map(([q, r]) => `${q},${r}`))

export function isValidCell(q: number, r: number): boolean {
  return CELL_SET.has(`${q},${r}`)
}

export function qrKey(q: number, r: number): string {
  return `${q},${r}`
}

export function parseKey(key: string): QR {
  const [q, r] = key.split(',').map(Number)
  return [q, r]
}

export type BoardMap = Map<string, CellState>

export function createInitialBoard(colors: PlayerColor[]): BoardMap {
  const board: BoardMap = new Map()
  for (const [q, r] of ALL_CELLS) board.set(qrKey(q, r), null)
  for (const color of colors) {
    for (const [q, r] of getStartPositions(color)) {
      board.set(qrKey(q, r), color)
    }
  }
  return board
}

export function getStepMoves(board: BoardMap, q: number, r: number): QR[] {
  const moves: QR[] = []
  for (const [dq, dr] of HEX_DIRS) {
    const nq = q + dq
    const nr = r + dr
    if (isValidCell(nq, nr) && board.get(qrKey(nq, nr)) === null) {
      moves.push([nq, nr])
    }
  }
  return moves
}

export function getJumpMoves(board: BoardMap, q: number, r: number): QR[] {
  const moves: QR[] = []
  const visited = new Set<string>()
  visited.add(qrKey(q, r))
  jumpDFS(board, q, r, visited, moves)
  return moves
}

function jumpDFS(board: BoardMap, q: number, r: number, visited: Set<string>, moves: QR[]): void {
  for (const [dq, dr] of HEX_DIRS) {
    const mq = q + dq
    const mr = r + dr
    const nq = q + 2 * dq
    const nr = r + 2 * dr
    const key = qrKey(nq, nr)
    if (isValidCell(nq, nr) && !visited.has(key) && board.get(key) === null && board.get(qrKey(mq, mr)) !== null) {
      moves.push([nq, nr])
      visited.add(key)
      jumpDFS(board, nq, nr, visited, moves)
    }
  }
}

export function getAllMoves(board: BoardMap, q: number, r: number): QR[] {
  return [...getStepMoves(board, q, r), ...getJumpMoves(board, q, r)]
}

export function applyMove(board: BoardMap, fq: number, fr: number, tq: number, tr: number): BoardMap {
  const newBoard = new Map(board)
  newBoard.set(qrKey(tq, tr), board.get(qrKey(fq, fr)) ?? null)
  newBoard.set(qrKey(fq, fr), null)
  return newBoard
}

export function checkWin(board: BoardMap, color: PlayerColor): boolean {
  const goal = getGoalPositions(color)
  return goal.every(([q, r]) => board.get(qrKey(q, r)) === color)
}

export function hasAnyMoves(board: BoardMap, color: PlayerColor): boolean {
  for (const [q, r] of ALL_CELLS) {
    if (board.get(qrKey(q, r)) === color) {
      if (getAllMoves(board, q, r).length > 0) return true
    }
  }
  return false
}

export function nextPlayer(current: PlayerColor, players: PlayerColor[]): PlayerColor {
  const idx = players.indexOf(current)
  return players[(idx + 1) % players.length]
}

export function qrToPixel(q: number, r: number, size: number): [number, number] {
  const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r)
  const y = size * (3 / 2 * r)
  return [x, y]
}

export function countInGoal(board: BoardMap, color: PlayerColor): number {
  const goal = getGoalPositions(color)
  return goal.filter(([q, r]) => board.get(qrKey(q, r)) === color).length
}