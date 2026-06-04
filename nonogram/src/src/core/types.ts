export type CellState = 'empty' | 'filled' | 'marked'

export interface LevelData {
  name: string
  gridSize: number
  solution: number[][] // 1 = filled, 0 = empty
}

export interface GameState {
  level: number
  gridSize: number
  board: CellState[][]
  solution: number[][]
  rowClues: number[][]
  colClues: number[][]
  won: boolean
  moves: number
  mode: 'fill' | 'mark'
}
