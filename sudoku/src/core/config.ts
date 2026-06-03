import type { Difficulty } from './types'

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; cellsToRemove: number; maxMistakes: number }> = {
  easy:   { label: '简单', cellsToRemove: 30, maxMistakes: 5 },
  medium: { label: '中等', cellsToRemove: 45, maxMistakes: 3 },
  hard:   { label: '困难', cellsToRemove: 52, maxMistakes: 2 },
  expert: { label: '专家', cellsToRemove: 58, maxMistakes: 1 },
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
