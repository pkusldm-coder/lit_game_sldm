export interface Cell {
  row: number
  col: number
}

export interface Tile {
  id: number
  type: number
}

export type Board = (Tile | null)[][]

export interface LevelConfig {
  level: number
  rows: number
  cols: number
  tileTypes: number
  targetScore: number
  maxMoves: number
}

export interface GameState {
  board: Board
  selected: Cell | null
  level: number
  score: number
  targetScore: number
  movesLeft: number
  maxMoves: number
  won: boolean
  lost: boolean
  animating: boolean
}
