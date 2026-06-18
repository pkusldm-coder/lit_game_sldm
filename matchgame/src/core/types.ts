export interface Cell {
  row: number
  col: number
}

export interface Tile {
  id: number
  type: number
}

export type Board = (Tile | null)[][]

export type DifficultyKey = 'easy' | 'medium' | 'hard'