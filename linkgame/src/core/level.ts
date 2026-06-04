import type { LevelConfig } from './types'

export function getLevelConfig(level: number): LevelConfig {
  let tileTypes: number
  if (level <= 10) {
    tileTypes = 6
  } else if (level <= 20) {
    tileTypes = 8
  } else if (level <= 30) {
    tileTypes = 12
  } else {
    tileTypes = 24
  }
  return {
    level,
    rows: 6,
    cols: 8,
    tileTypes,
  }
}
