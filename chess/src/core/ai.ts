import type { Board, Move, Player, Difficulty } from './types'
import { ROWS, COLS } from './types'
import { getAllMoves, applyMove, isCheckmate } from './GameEngine'

const PIECE_VALUE: Record<string, number> = {
  king: 10000, rook: 600, cannon: 300, knight: 270, bishop: 120, advisor: 120, pawn: 30,
}

const PAWN_POS: Record<Player, number[][]> = {
  red: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,2,4,4,6,4,4,2,0],
    [1,2,3,3,5,3,3,2,1],[0,1,2,3,3,3,2,1,0],[0,0,1,2,2,2,1,0,0],[0,0,0,0,0,0,0,0,0],
  ],
  black: [
    [0,0,0,0,0,0,0,0,0],[0,0,1,2,2,2,1,0,0],[0,1,2,3,3,3,2,1,0],
    [1,2,3,3,5,3,3,2,1],[0,2,4,4,6,4,4,2,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
}

const KING_POS: Record<Player, number[][]> = {
  red: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,0,0,0],[0,0,0,2,2,2,0,0,0],[0,0,0,3,3,3,0,0,0],
  ],
  black: [
    [0,0,0,3,3,3,0,0,0],[0,0,0,2,2,2,0,0,0],[0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
}

const ROOK_POS: Record<Player, number[][]> = {
  red: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[2,3,3,4,5,4,3,3,2],
    [2,3,3,4,5,4,3,3,2],[1,2,2,3,4,3,2,2,1],[1,1,1,2,3,2,1,1,1],[0,0,0,0,0,0,0,0,0],
  ],
  black: [
    [0,0,0,0,0,0,0,0,0],[1,1,1,2,3,2,1,1,1],[1,2,2,3,4,3,2,2,1],
    [2,3,3,4,5,4,3,3,2],[2,3,3,4,5,4,3,3,2],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
}

const CANNON_POS: Record<Player, number[][]> = {
  red: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[1,2,2,4,5,4,2,2,1],
    [1,1,2,3,4,3,2,1,1],[0,1,1,2,3,2,1,1,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
  black: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,1,1,2,3,2,1,1,0],
    [1,1,2,3,4,3,2,1,1],[1,2,2,4,5,4,2,2,1],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
}

const KNIGHT_POS: Record<Player, number[][]> = {
  red: [
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[1,2,3,4,4,4,3,2,1],
    [1,2,2,3,3,3,2,2,1],[1,1,2,2,2,2,2,1,1],[0,1,1,1,1,1,1,1,0],[0,0,0,0,0,0,0,0,0],
  ],
  black: [
    [0,0,0,0,0,0,0,0,0],[0,1,1,1,1,1,1,1,0],[1,1,2,2,2,2,2,1,1],
    [1,2,2,3,3,3,2,2,1],[1,2,3,4,4,4,3,2,1],[0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
  ],
}

function evaluate(board: Board, aiColor: Player): number {
  let score = 0

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (!p) continue
      const mul = p.player === aiColor ? 1 : -1
      score += PIECE_VALUE[p.type] * mul
      const posTable = p.type === 'pawn' ? PAWN_POS : p.type === 'king' ? KING_POS : p.type === 'rook' ? ROOK_POS : p.type === 'cannon' ? CANNON_POS : p.type === 'knight' ? KNIGHT_POS : null
      if (posTable) score += posTable[p.player][r][c] * mul * 5
    }
  }

  return score
}

function minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiColor: Player): number {
  if (depth === 0) return evaluate(board, aiColor)

  const current = isMaximizing ? aiColor : (aiColor === 'red' ? 'black' : 'red')
  if (isCheckmate(board, current)) return isMaximizing ? -99999 : 99999

  const moves = getAllMoves(board, current)
  if (moves.length === 0) return isMaximizing ? -99999 : 99999

  if (isMaximizing) {
    let best = -Infinity
    for (const m of moves) {
      const nb = applyMove(board, m)
      best = Math.max(best, minimax(nb, depth - 1, alpha, beta, false, aiColor))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      const nb = applyMove(board, m)
      best = Math.min(best, minimax(nb, depth - 1, alpha, beta, true, aiColor))
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

const DEPTH_MAP: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

export function findBestMove(board: Board, aiColor: Player, difficulty: Difficulty): Move | null {
  const depth = DEPTH_MAP[difficulty]
  const moves = getAllMoves(board, aiColor)
  if (moves.length === 0) return null

  let bestMove = moves[0]
  let bestScore = -Infinity

  for (const m of moves) {
    const nb = applyMove(board, m)
    const score = minimax(nb, depth - 1, -Infinity, Infinity, false, aiColor)
    if (score > bestScore) {
      bestScore = score
      bestMove = m
    }
  }

  return bestMove
}
