import type { LevelConfig } from './types'

export function getLevelConfig(level: number): LevelConfig {
  let tileTypes: number
  let timeLimit: number
  if (level <= 5) {
    tileTypes = 6
    timeLimit = 120
  } else if (level <= 10) {
    tileTypes = 8
    timeLimit = 90
  } else if (level <= 15) {
    tileTypes = 12
    timeLimit = 60
  } else {
    tileTypes = 24
    timeLimit = 60
  }
  return {
    level,
    rows: 6,
    cols: 8,
    tileTypes,
    timeLimit,
  }
}

export interface DifficultyOption {
  level: number
  label: string
  tileTypes: number
  timeLimit: number
}

export function getDifficultyOptions(): DifficultyOption[] {
  return [1, 6, 11, 16].map(level => {
    const cfg = getLevelConfig(level)
    return {
      level,
      label: `第${level}关`,
      tileTypes: cfg.tileTypes,
      timeLimit: cfg.timeLimit,
    }
  })
}
