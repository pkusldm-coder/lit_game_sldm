export interface Cell {
  row: number
  col: number
}

export interface ColorDef {
  id: number
  color: string
  start: Cell
  end: Cell
}

export interface PipeCell {
  colorId: number | null
  isEndpoint: boolean
}

export type Board = PipeCell[][]

export interface GameState {
  board: Board
  colors: ColorDef[]
  level: number
  gridSize: number
  won: boolean
  drawing: boolean
  currentColor: number | null
  path: Cell[]
  moves: number
}
