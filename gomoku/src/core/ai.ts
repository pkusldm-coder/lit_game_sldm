import type { Board, Stone } from './types'
import { DIFFICULTY_CONFIG } from './config'
import type { Difficulty } from './types'
import { checkFiveInARow, analyzeDirection, cloneBoard } from './GameEngine'
import { checkForbidden } from './rules'

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

function getCandidateMoves(board: Board, range: number = 2): [number, number][] {
  const size = board.length
  const candidates = new Set<string>()
  let hasStone = false

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        hasStone = true
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }

  if (!hasStone) {
    const center = Math.floor(size / 2)
    return [[center, center]]
  }

  return Array.from(candidates).map(s => {
    const [r, c] = s.split(',').map(Number)
    return [r!, c!] as [number, number]
  })
}

function evaluatePosition(board: Board, row: number, col: number, stone: Stone): number {
  let score = 0
  for (const [dr, dc] of DIRECTIONS) {
    const a = analyzeDirection(board, row, col, stone, dr, dc)
    const { total, bothOpen, oneOpen } = a

    if (total >= 5) score += 100_000_000
    else if (total === 4 && bothOpen) score += 100_000
    else if (total === 4 && oneOpen) score += 10_000
    else if (total === 3 && bothOpen) score += 1_000
    else if (total === 3 && oneOpen) score += 100
    else if (total === 2 && bothOpen) score += 10
    else if (total === 2 && oneOpen) score += 5
  }
  return score
}

function evaluateBoard(board: Board, aiStone: Stone): number {
  const oppStone: Stone = aiStone === 'black' ? 'white' : 'black'
  let score = 0

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c] === aiStone) {
        score += evaluatePosition(board, r, c, aiStone)
      } else if (board[r][c] === oppStone) {
        score -= evaluatePosition(board, r, c, oppStone) * 1.1
      }
    }
  }

  return score
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiStone: Stone,
): number {
  const oppStone: Stone = aiStone === 'black' ? 'white' : 'black'
  const currentStone = isMaximizing ? aiStone : oppStone

  if (depth === 0) {
    return evaluateBoard(board, aiStone)
  }

  const candidates = getCandidateMoves(board, 1)

  if (candidates.length === 0) {
    return 0
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const [r, c] of candidates) {
      const newBoard = cloneBoard(board)
      newBoard[r][c] = currentStone

      if (checkFiveInARow(newBoard, r, c, currentStone)) {
        return 100_000_000 + depth * 1_000_000
      }

      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiStone)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const [r, c] of candidates) {
      const newBoard = cloneBoard(board)
      newBoard[r][c] = currentStone

      if (checkFiveInARow(newBoard, r, c, currentStone)) {
        return -100_000_000 - depth * 1_000_000
      }

      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiStone)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function findBestMove(board: Board, stone: Stone, difficulty: Difficulty): [number, number] | null {
  const config = DIFFICULTY_CONFIG[difficulty]
  const oppStone: Stone = stone === 'black' ? 'white' : 'black'
  const candidates = getCandidateMoves(board, 2)

  if (candidates.length === 0) return null

  // Filter out forbidden moves for black AI
  const validCandidates = stone === 'black'
    ? candidates.filter(([r, c]) => !checkForbidden(board, r, c).forbidden)
    : candidates

  if (validCandidates.length === 0) return null

  // Evaluate each candidate
  const scored = validCandidates.map(([r, c]) => {
    const newBoard = cloneBoard(board)
    newBoard[r][c] = stone

    // Immediate win check
    if (checkFiveInARow(newBoard, r, c, stone)) {
      return { move: [r, c] as [number, number], score: Infinity }
    }

    // Block opponent's immediate win
    const oppBoard = cloneBoard(board)
    oppBoard[r][c] = oppStone
    if (checkFiveInARow(oppBoard, r, c, oppStone)) {
      return { move: [r, c] as [number, number], score: Infinity / 2 }
    }

    // Positional score
    const posScore = evaluatePosition(newBoard, r, c, stone)
    const oppPosScore = evaluatePosition(oppBoard, r, c, oppStone)
    const combinedScore = posScore + oppPosScore * 0.9

    // Center preference
    const center = Math.floor(board.length / 2)
    const distanceWeight = 1 + (board.length - Math.abs(r - center) - Math.abs(c - center)) / board.length * 0.05

    return {
      move: [r, c] as [number, number],
      score: combinedScore * distanceWeight,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  if (config.searchDepth === 0) {
    return scored[0]!.move
  }

  // Search only the top N candidates for performance
  const searchCandidates = scored.slice(0, Math.min(15, scored.length))

  let bestMove = searchCandidates[0]!.move
  let bestScore = -Infinity

  for (const { move: [r, c] } of searchCandidates) {
    const newBoard = cloneBoard(board)
    newBoard[r][c] = stone

    const score = minimax(newBoard, config.searchDepth - 1, -Infinity, Infinity, false, stone)

    if (score > bestScore) {
      bestScore = score
      bestMove = [r, c]
    }
  }

  return bestMove
}
