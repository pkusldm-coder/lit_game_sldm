import type { Board, Player, Move, GameMode, Difficulty } from './types'
import { ROWS, COLS } from './types'
import { getAllMoves, applyMove, resolveCapture } from './GameEngine'
import { isBunker } from './types'

function evaluate(board: Board, player: Player): number {
  let score = 0

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (!p) continue
      const mul = p.player === player ? 1 : -1
      score += (p.rank + 5) * mul * (p.type === 'flag' ? 100 : p.type === 'bomb' ? 8 : p.type === 'mine' ? 6 : 1)
      if (isBunker(r, c) && p.player === player) score += 10 * mul
    }
  }
  return score
}

function minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiColor: Player): number {
  if (depth === 0) return evaluate(board, aiColor)

  const current = isMaximizing ? aiColor : (aiColor === 'red' ? 'blue' : 'red')
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

const CAPTURE_VALUE: Record<string, number> = {
  commander: 100, general: 80, majorGeneral: 60, colonel: 40,
  major: 30, captain: 25, lieutenant: 20, sergeant: 15, engineer: 10,
  bomb: 50, mine: 20, flag: 999,
}

function heuristicEval(board: Board, move: Move): number {
  const atk = board[move.fromRow][move.fromCol]
  const def = board[move.toRow][move.toCol]
  let score = 0

  if (def) {
    const result = resolveCapture(atk!, def)
    if (result === 'attackerWin') score += CAPTURE_VALUE[def.type] || 0
    else if (result === 'bothDie') score += CAPTURE_VALUE[def.type] * 0.5
    else score -= CAPTURE_VALUE[atk!.type] || 0
  }

  score += Math.random() * 3

  return score
}

const DEPTH: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export function findBestMove(board: Board, player: Player, mode: GameMode, difficulty: Difficulty): Move | null {
  const moves = getAllMoves(board, player)
  if (moves.length === 0) return null

  if (mode === 'hidden') {
    moves.sort((a, b) => heuristicEval(board, b) - heuristicEval(board, a))
    return moves[Math.floor(Math.random() * Math.min(moves.length, 5))]
  }

  const depth = DEPTH[difficulty]
  if (depth === 0) {
    moves.sort((a, b) => heuristicEval(board, b) - heuristicEval(board, a))
    return moves[0]
  }

  let bestMove = moves[0]
  let bestScore = -Infinity

  for (const m of moves) {
    const nb = applyMove(board, m)
    const score = minimax(nb, depth - 1, -Infinity, Infinity, false, player)
    if (score > bestScore) { bestScore = score; bestMove = m }
  }

  return bestMove
}
