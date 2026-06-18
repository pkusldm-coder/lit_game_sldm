import type { PlayerColor, Piece, Difficulty } from './types'
import { HANGAR, GOAL_PROGRESS } from './types'
import { getValidMoves, getProgressTrackIndex } from './GameEngine'

export function chooseMove(pieces: Piece[], color: PlayerColor, dice: number, _difficulty: Difficulty): Piece | null {
  const valid = getValidMoves(pieces, color, dice)
  if (valid.length === 0) return null

  let bestPiece: Piece | null = null
  let bestScore = -Infinity

  for (const p of valid) {
    let score = 0

    if (p.progress === HANGAR && dice === 6) {
      score = 50
    } else {
      const newProg = p.progress + dice
      if (newProg === GOAL_PROGRESS) {
        score = 200
      } else if (newProg > 51) {
        score = 80 + newProg
      } else {
        score = newProg
        const trackIdx = getProgressTrackIndex(color, newProg)
        let captures = 0
        for (const other of pieces) {
          if (other.color !== color && other.progress >= 0 && other.progress <= 51) {
            if (getProgressTrackIndex(other.color, other.progress) === trackIdx) captures++
          }
        }
        score += captures * 60
        for (const other of pieces) {
          if (other.color !== color && other.progress >= 0 && other.progress <= 51) {
            if (getProgressTrackIndex(other.color, other.progress) === trackIdx) score -= 30
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestPiece = p
    }
  }

  return bestPiece
}