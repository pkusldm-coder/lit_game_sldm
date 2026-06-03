import { useCallback, useState } from 'react'
import type { Difficulty } from '../core/types'
import { getHighScore, saveHighScore } from '../utils/storage'

export function usePersistence(difficulty: Difficulty) {
  const [highScore, setHighScoreState] = useState(() => getHighScore(difficulty))

  const updateHighScore = useCallback((score: number) => {
    const current = getHighScore(difficulty)
    if (score > current) {
      saveHighScore(difficulty, score)
      setHighScoreState(score)
    }
  }, [difficulty])

  return { highScore, updateHighScore }
}