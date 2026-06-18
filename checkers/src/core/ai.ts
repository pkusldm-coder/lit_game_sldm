import type { PlayerColor, Difficulty, BoardMap } from './types'
import { getAllMoves, getGoalPositions, qrKey, ALL_CELLS } from './GameEngine'

function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  const dq = q1 - q2, dr = r1 - r2, ds = (q1 + r1) - (q2 + r2)
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2
}

function goalCenter(color: PlayerColor): [number, number] {
  const goal = getGoalPositions(color)
  const gq = goal.reduce((s, [q]) => s + q, 0) / goal.length
  const gr = goal.reduce((s, [, r]) => s + r, 0) / goal.length
  return [gq, gr]
}

export function findBestMove(board: BoardMap, color: PlayerColor, _difficulty: Difficulty): [number, number, number, number] | null {
  const [gq, gr] = goalCenter(color)
  const goalSet = new Set(getGoalPositions(color).map(([q, r]) => `${q},${r}`))
  const inGoal = (q: number, r: number) => goalSet.has(`${q},${r}`)

  let bestFrom: [number, number] | null = null
  let bestTo: [number, number] | null = null
  let bestScore = -Infinity

  for (const [q, r] of ALL_CELLS) {
    if (board.get(qrKey(q, r)) !== color) continue

    const dist = hexDistance(q, r, gq, gr)
    if (inGoal(q, r)) continue

    const moves = getAllMoves(board, q, r)
    for (const [mq, mr] of moves) {
      const newDist = hexDistance(mq, mr, gq, gr)
      const improvement = dist - newDist
      const reachesGoal = inGoal(mq, mr)

      let score = improvement * 3 + dist * 0.15 + Math.random() * 0.5
      if (reachesGoal) score += 15

      if (score > bestScore) {
        bestScore = score
        bestFrom = [q, r]
        bestTo = [mq, mr]
      }
    }
  }

  if (!bestFrom || !bestTo) return null
  return [bestFrom[0], bestFrom[1], bestTo[0], bestTo[1]]
}
