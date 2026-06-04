import type { LevelConfig } from './types'

export function getLevelConfig(level: number): LevelConfig {
  let tileTypes: number
  let targetScore: number
  let maxMoves: number

  if (level <= 5) {
    tileTypes = 5
    targetScore = 500
    maxMoves = 25
  } else if (level <= 10) {
    tileTypes = 6
    targetScore = 800
    maxMoves = 22
  } else if (level <= 15) {
    tileTypes = 7
    targetScore = 1200
    maxMoves = 20
  } else {
    tileTypes = 8
    targetScore = 1500
    maxMoves = 20
  }

  return {
    level,
    rows: 8,
    cols: 8,
    tileTypes,
    targetScore,
    maxMoves,
  }
}

export interface DifficultyOption {
  level: number
  label: string
  tileTypes: number
  targetScore: number
  maxMoves: number
}

export function getDifficultyOptions(): DifficultyOption[] {
  return [1, 6, 11, 16].map(level => {
    const cfg = getLevelConfig(level)
    return {
      level,
      label: `第${level}关`,
      tileTypes: cfg.tileTypes,
      targetScore: cfg.targetScore,
      maxMoves: cfg.maxMoves,
    }
  })
}
