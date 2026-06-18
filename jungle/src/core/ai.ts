import type { Board, Player, Difficulty, Move } from './types'
import { ROWS, COLS, ANIMAL_RANK, getValidMoves, applyMove, checkWin, hasAnyMoves, getEffectiveRank, getCellType } from './GameEngine'

function evaluateBoard(board: Board, aiPlayer: Player): number {
  const opponent: Player = aiPlayer === 'red' ? 'blue' : 'red'
  let score = 0

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (!p) continue

      const rank = ANIMAL_RANK[p.type]
      const effRank = getEffectiveRank(p, r, c)
      const value = rank * 10 + effRank * 5

      if (p.player === aiPlayer) {
        score += value
        const targetRow = aiPlayer === 'red' ? 0 : 8
        const targetCol = 3
        const dist = Math.abs(r - targetRow) + Math.abs(c - targetCol)
        score += (14 - dist) * 3
        if (getCellType(r, c) === `trap-${opponent}`) score += 20
      } else {
        score -= value
        const targetRow = opponent === 'red' ? 8 : 0
        const targetCol = 3
        const dist = Math.abs(r - targetRow) + Math.abs(c - targetCol)
        score -= (14 - dist) * 3
      }
    }
  }

  const winner = checkWin(board)
  if (winner === aiPlayer) score += 10000
  if (winner === opponent) score -= 10000

  if (!hasAnyMoves(board, opponent)) score += 5000
  if (!hasAnyMoves(board, aiPlayer)) score -= 5000

  return score
}

function getAllMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.player === player) {
        const targets = getValidMoves(board, r, c)
        for (const [tr, tc] of targets) {
          moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc })
        }
      }
    }
  }
  return moves
}

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

function minimax(board: Board, depth: number, alpha: number, beta: number, isMax: boolean, aiPlayer: Player): number {
  const winner = checkWin(board)
  if (winner === aiPlayer) return 10000 + depth
  if (winner !== null) return -10000 - depth
  if (depth === 0) return evaluateBoard(board, aiPlayer)

  const current: Player = isMax ? aiPlayer : (aiPlayer === 'red' ? 'blue' : 'red')
  const moves = getAllMoves(board, current)

  if (moves.length === 0) return isMax ? -5000 : 5000

  if (isMax) {
    let best = -Infinity
    for (const m of moves) {
      const nb = applyMove(board, m.fromRow, m.fromCol, m.toRow, m.toCol)
      const val = minimax(nb, depth - 1, alpha, beta, false, aiPlayer)
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      const nb = applyMove(board, m.fromRow, m.fromCol, m.toRow, m.toCol)
      const val = minimax(nb, depth - 1, alpha, beta, true, aiPlayer)
      best = Math.min(best, val)
      beta = Math.min(beta, val)
      if (beta <= alpha) break
    }
    return best
  }
}

export function findBestMove(board: Board, player: Player, difficulty: Difficulty): Move | null {
  const moves = getAllMoves(board, player)
  if (moves.length === 0) return null

  const depth = DEPTH_MAP[difficulty]

  if (depth <= 1) {
    let bestMove = moves[0]
    let bestScore = -Infinity
    for (const m of moves) {
      const nb = applyMove(board, m.fromRow, m.fromCol, m.toRow, m.toCol)
      const w = checkWin(nb)
      if (w === player) return m
      const s = evaluateBoard(nb, player)
      if (s > bestScore) { bestScore = s; bestMove = m }
    }
    return bestMove
  }

  let bestMove = moves[0]
  let bestScore = -Infinity

  for (const m of moves) {
    const nb = applyMove(board, m.fromRow, m.fromCol, m.toRow, m.toCol)
    const w = checkWin(nb)
    if (w === player) return m
    const s = minimax(nb, depth - 1, -Infinity, Infinity, false, player)
    if (s > bestScore) { bestScore = s; bestMove = m }
  }

  return bestMove
}