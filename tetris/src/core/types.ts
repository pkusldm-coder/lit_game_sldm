export const BOARD_W = 10
export const BOARD_H = 20
export const CELL = 30
export const NEXT_CELL = 24

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Pos {
  x: number
  y: number
}

export type Board = number[][]

export interface GameState {
  board: Board
  piece: PieceType
  pos: Pos
  rot: number
  next: PieceType
  score: number
  level: number
  lines: number
  gameOver: boolean
  paused: boolean
}
