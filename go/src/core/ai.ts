import type { Stone, Board, Difficulty } from './types'
import { BOARD_SIZE } from './types'
import { getAllValidMoves, placeStone } from './GameEngine'

const STAR_POINTS: [number, number][] = [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]]

function evaluate(board: Board, color: Stone): number {
  const opponent: Stone = color === 'black' ? 'white' : 'black'
  let score = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === color) {
        score += 5
        score += countLiberties(board, r, c) * 2
        if (isAtEdge(r, c)) score += 1
      } else if (board[r][c] === opponent) {
        score -= 5
        score -= countLiberties(board, r, c) * 2
        if (isAtEdge(r, c)) score -= 1
      } else {
        if (isNearStone(board, r, c, color)) score += 1
        if (isNearStone(board, r, c, opponent)) score -= 1
      }
    }
  }
  for (const [sr, sc] of STAR_POINTS) {
    if (board[sr][sc] === color) score += 15
    else if (board[sr][sc] === opponent) score -= 15
  }
  return score
}

function countLiberties(board: Board, row: number, col: number): number {
  let count = 0
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr = row + dr, nc = col + dc
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) count++
  }
  return count
}

function isAtEdge(r: number, c: number): boolean {
  return r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1
}

function isNearStone(board: Board, r: number, c: number, color: Stone): boolean {
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
    const nr = r + dr, nc = c + dc
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === color) return true
  }
  return false
}

const RANDOM_FACTOR: Record<Difficulty, number> = { easy: 30, medium: 15, hard: 5 }

export function findBestMove(board: Board, stone: Stone, lastBoard: Board | null, difficulty: Difficulty): [number, number] | null {
  const moves = getAllValidMoves(board, stone, lastBoard)
  if (moves.length === 0) return null

  const factor = RANDOM_FACTOR[difficulty]
  let bestMove = moves[0]
  let bestScore = -Infinity

  const sampled = moves.length > 50 ? moves.filter(() => Math.random() < 0.4) : moves

  for (const [r, c] of sampled) {
    const nb = placeStone(board, r, c, stone)
    if (!nb) continue
    const s = evaluate(nb, stone) + Math.random() * factor
    if (s > bestScore) { bestScore = s; bestMove = [r, c] }
  }

  return bestMove
}