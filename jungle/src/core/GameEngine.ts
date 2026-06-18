import type { AnimalType, CellType, Piece, Board, Player } from './types'

export const ROWS = 9
export const COLS = 7

export const ANIMAL_RANK: Record<AnimalType, number> = {
  elephant: 8,
  lion: 7,
  tiger: 6,
  leopard: 5,
  wolf: 4,
  dog: 3,
  cat: 2,
  rat: 1,
}

export const ANIMAL_EMOJI: Record<AnimalType, string> = {
  elephant: '象',
  lion: '狮',
  tiger: '虎',
  leopard: '豹',
  wolf: '狼',
  dog: '犬',
  cat: '猫',
  rat: '鼠',
}

export const DIFFICULTY_CONFIG: Record<string, { label: string }> = {
  easy: { label: '简单' },
  medium: { label: '中等' },
  hard: { label: '困难' },
}

const CELL_MAP: CellType[][] = [
  ['land', 'land', 'trap-blue', 'den-blue', 'trap-blue', 'land', 'land'],
  ['land', 'land', 'land', 'trap-blue', 'land', 'land', 'land'],
  ['land', 'land', 'land', 'land', 'land', 'land', 'land'],
  ['land', 'water', 'water', 'land', 'water', 'water', 'land'],
  ['land', 'water', 'water', 'land', 'water', 'water', 'land'],
  ['land', 'water', 'water', 'land', 'water', 'water', 'land'],
  ['land', 'land', 'land', 'land', 'land', 'land', 'land'],
  ['land', 'land', 'land', 'trap-red', 'land', 'land', 'land'],
  ['land', 'land', 'trap-red', 'den-red', 'trap-red', 'land', 'land'],
]

export function getCellType(row: number, col: number): CellType {
  return CELL_MAP[row][col]
}

export function isWater(row: number, col: number): boolean {
  return getCellType(row, col) === 'water'
}

export function isDen(row: number, col: number, player: Player): boolean {
  const ct = getCellType(row, col)
  return ct === `den-${player}`
}

function makePiece(type: AnimalType, player: Player): Piece {
  return { type, player }
}

const INITIAL_BLUE: [number, number, AnimalType][] = [
  [0, 0, 'lion'],
  [0, 6, 'tiger'],
  [1, 1, 'dog'],
  [1, 5, 'cat'],
  [2, 0, 'rat'],
  [2, 2, 'leopard'],
  [2, 4, 'wolf'],
  [2, 6, 'elephant'],
]

const INITIAL_RED: [number, number, AnimalType][] = [
  [8, 0, 'tiger'],
  [8, 6, 'lion'],
  [7, 1, 'cat'],
  [7, 5, 'dog'],
  [6, 0, 'elephant'],
  [6, 2, 'wolf'],
  [6, 4, 'leopard'],
  [6, 6, 'rat'],
]

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  for (const [r, c, t] of INITIAL_BLUE) board[r][c] = makePiece(t, 'blue')
  for (const [r, c, t] of INITIAL_RED) board[r][c] = makePiece(t, 'red')
  return board
}

export function getEffectiveRank(piece: Piece, row: number, col: number): number {
  const ct = getCellType(row, col)
  if (ct === 'trap-red' && piece.player === 'blue') return 0
  if (ct === 'trap-blue' && piece.player === 'red') return 0
  return ANIMAL_RANK[piece.type]
}

export function canCapture(attacker: Piece, defender: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  const atkRank = getEffectiveRank(attacker, fromRow, fromCol)
  const defRank = getEffectiveRank(defender, toRow, toCol)

  if (defRank === 0) return true
  if (atkRank === 0) return false

  if (attacker.type === 'rat' && defender.type === 'elephant') {
    if (isWater(fromRow, fromCol) && !isWater(toRow, toCol)) return false
    return true
  }

  if (attacker.type === 'elephant' && defender.type === 'rat') return false

  return atkRank >= defRank
}

export function getValidMoves(board: Board, row: number, col: number): [number, number][] {
  const piece = board[row][col]
  if (!piece) return []

  const moves: [number, number][] = []
  const dirs: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]]

  for (const [dr, dc] of dirs) {
    const r = row + dr
    const c = col + dc

    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue

    const ct = getCellType(r, c)

    if (piece.type === 'rat') {
      if (ct === 'water') {
        const target = board[r][c]
        if (!target) {
          moves.push([r, c])
        } else if (target.player !== piece.player && canCapture(piece, target, row, col, r, c)) {
          moves.push([r, c])
        }
      } else {
        if (isDen(r, c, piece.player)) continue
        const target = board[r][c]
        if (!target) {
          moves.push([r, c])
        } else if (target.player !== piece.player && canCapture(piece, target, row, col, r, c)) {
          moves.push([r, c])
        }
      }
    } else if (piece.type === 'lion' || piece.type === 'tiger') {
      if (isWater(r, c)) {
        let jr = r
        let jc = c
        let blocked = false
        while (jr >= 0 && jr < ROWS && jc >= 0 && jc < COLS && isWater(jr, jc)) {
          if (board[jr][jc] !== null) { blocked = true; break }
          jr += dr
          jc += dc
        }
        if (!blocked && jr >= 0 && jr < ROWS && jc >= 0 && jc < COLS && !isWater(jr, jc)) {
          if (!isDen(jr, jc, piece.player)) {
            const target = board[jr][jc]
            if (!target) {
              moves.push([jr, jc])
            } else if (target.player !== piece.player && canCapture(piece, target, row, col, jr, jc)) {
              moves.push([jr, jc])
            }
          }
        }
      } else {
        if (isDen(r, c, piece.player)) continue
        const target = board[r][c]
        if (!target) {
          moves.push([r, c])
        } else if (target.player !== piece.player && canCapture(piece, target, row, col, r, c)) {
          moves.push([r, c])
        }
      }
    } else {
      if (isWater(r, c)) continue
      if (isDen(r, c, piece.player)) continue
      const target = board[r][c]
      if (!target) {
        moves.push([r, c])
      } else if (target.player !== piece.player && canCapture(piece, target, row, col, r, c)) {
        moves.push([r, c])
      }
    }
  }

  return moves
}

export function checkWin(board: Board): Player | null {
  const blueDen = board[0][3]
  if (blueDen && blueDen.player === 'red') return 'red'

  const redDen = board[8][3]
  if (redDen && redDen.player === 'blue') return 'blue'

  let redPieces = 0
  let bluePieces = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p) {
        if (p.player === 'red') redPieces++
        else bluePieces++
      }
    }
  }
  if (redPieces === 0) return 'blue'
  if (bluePieces === 0) return 'red'

  return null
}

export function applyMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): Board {
  const newBoard = board.map(r => [...r])
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
  newBoard[fromRow][fromCol] = null
  return newBoard
}

export function hasAnyMoves(board: Board, player: Player): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.player === player) {
        if (getValidMoves(board, r, c).length > 0) return true
      }
    }
  }
  return false
}