export interface Cell {
  row: number
  col: number
}

export interface Tile {
  id: number
  type: number
  removed: boolean
}

export interface Point {
  row: number
  col: number
}

export type Path = Point[]

export type Board = (Tile | null)[][]

export interface Move {
  a: Cell
  b: Cell
  path: Path
}

export interface LevelConfig {
  level: number
  rows: number
  cols: number
  tileTypes: number
  timeLimit: number
}

export interface GameState {
  board: Board
  selected: Cell | null
  level: number
  pairsRemaining: number
  won: boolean
  path: Path | null
  animating: boolean
  timeLeft: number
  timeout: boolean
}
