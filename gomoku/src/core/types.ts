export type Stone = 'black' | 'white'

export type Cell = Stone | null

export type Board = Cell[][]

export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameMode = 'ai' | 'pvp'

export interface MoveRecord {
  row: number
  col: number
  stone: Stone
}

export interface GameState {
  board: Board
  currentPlayer: Stone
  playerStone: Stone   // human's color (p1 in pvp)
  gameMode: GameMode
  difficulty: Difficulty
  moveHistory: MoveRecord[]
  gameOver: boolean
  winner: Stone | null
  winLine: [number, number][] | null
  forfeited: boolean
  forbiddenWarning: string | null
  boardSize: number
}

export interface MoveResult {
  board: Board
  captured?: boolean
}

export interface DirectionDeltas {
  dr: number
  dc: number
}
