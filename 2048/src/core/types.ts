export type Direction = 'up' | 'down' | 'left' | 'right'
export type Difficulty = 'easy' | 'normal' | 'hard'

export type TileData = {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

export type TileMovement = {
  id: number
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  mergedInto?: number
  newValue?: number
}

export interface GameState {
  grid: number[][]
  score: number
  difficulty: Difficulty
  eraserRemaining: number
  gameOver: boolean
  tiles: TileData[]
  isEraseMode: boolean
  idGrid: (number | null)[][]
  nextId: number
}

export interface DifficultyConfig {
  gridSize: number
  spawnDistribution: { value: number; weight: number }[]
  initialTileCount: number
  label: string
}