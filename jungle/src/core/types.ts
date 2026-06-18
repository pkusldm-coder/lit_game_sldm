export type Player = 'red' | 'blue'

export type AnimalType = 'elephant' | 'lion' | 'tiger' | 'leopard' | 'wolf' | 'dog' | 'cat' | 'rat'

export type CellType = 'land' | 'water' | 'trap-red' | 'trap-blue' | 'den-red' | 'den-blue'

export interface Piece {
  type: AnimalType
  player: Player
}

export type Board = (Piece | null)[][]

export type GamePhase = 'select' | 'playing' | 'over'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Move {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}