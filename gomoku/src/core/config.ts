import type { Difficulty } from './types'

export interface DifficultyConfig {
  label: string
  searchDepth: number
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { label: '简单', searchDepth: 0 },
  medium: { label: '中等', searchDepth: 2 },
  hard: { label: '困难', searchDepth: 4 },
}

export const BOARD_SIZE = 15
