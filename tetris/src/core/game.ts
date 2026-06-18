import type { Board, GameState, PieceType } from './types'
import { BOARD_W, BOARD_H } from './types'
import { getShape, getSize, nextPiece, resetBag } from './pieces'

export function createBoard(): Board {
  return Array.from({ length: BOARD_H }, () => Array(BOARD_W).fill(0))
}

function spawnPiece(board: Board, type: PieceType, next: PieceType): GameState | null {
  const size = getSize(type)
  const shape = getShape(type, 0)
  const x = Math.floor((BOARD_W - size) / 2)
  const y = 0
  if (collides(board, shape, x, y)) return null
  return { board, piece: type, pos: { x, y }, rot: 0, next, score: 0, level: 1, lines: 0, gameOver: false, paused: false }
}

export function initGame(): GameState {
  resetBag()
  const board = createBoard()
  const first = nextPiece()
  const second = nextPiece()
  return spawnPiece(board, first, second)!
}

function collides(board: Board, shape: number[][], ox: number, oy: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = ox + c
      const y = oy + r
      if (x < 0 || x >= BOARD_W || y >= BOARD_H) return true
      if (y >= 0 && board[y][x]) return true
    }
  }
  return false
}

function lockPiece(gs: GameState): GameState {
  const shape = getShape(gs.piece, gs.rot)
  const board = gs.board.map(row => [...row])
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const y = gs.pos.y + r
      const x = gs.pos.x + c
      if (y >= 0) board[y][x] = 1
    }
  }
  return clearLines(board, gs.score, gs.lines, gs.level, gs.next)
}

function clearLines(board: Board, score: number, lines: number, level: number, nextPiecePreview: PieceType): GameState {
  let cleared = 0
  const newBoard = board.filter(row => {
    const full = row.every(c => c)
    if (full) cleared++
    return !full
  })
  while (newBoard.length < BOARD_H) newBoard.unshift(Array(BOARD_W).fill(0))
  const newLines = lines + cleared
  const newLevel = Math.floor(newLines / 10) + 1
  const points = cleared === 1 ? 100 : cleared === 2 ? 300 : cleared === 3 ? 500 : cleared === 4 ? 800 : 0
  const newScore = score + points * level
  const state = spawnPiece(newBoard, nextPiecePreview, nextPiece())
  if (!state) return { board: newBoard, piece: 'T', pos: { x: 0, y: 0 }, rot: 0, next: 'I', score: newScore, level: newLevel, lines: newLines, gameOver: true, paused: false }
  return { ...state, score: newScore, level: newLevel, lines: newLines }
}

export function moveLeft(gs: GameState): GameState {
  const shape = getShape(gs.piece, gs.rot)
  if (!collides(gs.board, shape, gs.pos.x - 1, gs.pos.y))
    return { ...gs, pos: { ...gs.pos, x: gs.pos.x - 1 } }
  return gs
}

export function moveRight(gs: GameState): GameState {
  const shape = getShape(gs.piece, gs.rot)
  if (!collides(gs.board, shape, gs.pos.x + 1, gs.pos.y))
    return { ...gs, pos: { ...gs.pos, x: gs.pos.x + 1 } }
  return gs
}

export function moveDown(gs: GameState, soft = false): GameState {
  if (gs.gameOver) return gs
  const shape = getShape(gs.piece, gs.rot)
  if (!collides(gs.board, shape, gs.pos.x, gs.pos.y + 1)) {
    return { ...gs, pos: { ...gs.pos, y: gs.pos.y + 1 }, score: soft ? gs.score + 1 : gs.score }
  }
  return lockPiece(gs)
}

export function rotate(gs: GameState): GameState {
  if (gs.piece === 'O') return gs
  const newRot = (gs.rot + 1) % 4
  const shape = getShape(gs.piece, newRot)
  if (!collides(gs.board, shape, gs.pos.x, gs.pos.y)) {
    return { ...gs, rot: newRot }
  }
  const kicks = gs.piece === 'I' ? [-2, -1, 1, 2] : [-1, 1]
  for (const kick of kicks) {
    if (!collides(gs.board, shape, gs.pos.x + kick, gs.pos.y)) {
      return { ...gs, rot: newRot, pos: { ...gs.pos, x: gs.pos.x + kick } }
    }
  }
  return gs
}

export function hardDrop(gs: GameState): GameState {
  if (gs.gameOver) return gs
  let drop = 0
  let state = { ...gs }
  const shape = getShape(state.piece, state.rot)
  while (!collides(state.board, shape, state.pos.x, state.pos.y + 1)) {
    state = { ...state, pos: { ...state.pos, y: state.pos.y + 1 } }
    drop++
  }
  state = { ...state, score: state.score + drop * 2 }
  return lockPiece(state)
}

export function getGhostY(board: Board, shape: number[][], x: number, y: number): number {
  let gy = y
  while (!collides(board, shape, x, gy + 1)) gy++
  return gy
}

export function tick(gs: GameState): GameState {
  if (gs.gameOver || gs.paused) return gs
  return moveDown(gs)
}
