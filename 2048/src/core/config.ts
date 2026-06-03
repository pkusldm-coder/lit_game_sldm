import type { Difficulty, DifficultyConfig } from './types'

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridSize: 6,
    spawnDistribution: [{ value: 2, weight: 90 }, { value: 4, weight: 10 }],
    initialTileCount: 3,
    label: '简单',
  },
  normal: {
    gridSize: 4,
    spawnDistribution: [{ value: 2, weight: 90 }, { value: 4, weight: 10 }],
    initialTileCount: 2,
    label: '普通',
  },
  hard: {
    gridSize: 4,
    spawnDistribution: [{ value: 2, weight: 70 }, { value: 4, weight: 20 }, { value: 8, weight: 10 }],
    initialTileCount: 2,
    label: '困难',
  },
}

export const ERASER_MAX = 3
export const SPAWN_WEIGHT_TOTAL = 100