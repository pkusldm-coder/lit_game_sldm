export const BOARD_SIZE = 9
export const BOX_SIZE = 3

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type CellValue = number | null

export interface CellData {
  value: CellValue
  isGiven: boolean
  pencilMarks: number[]
  isError: boolean
  isHint: boolean
}

export type Board = CellData[][]

export type RawBoard = (number | 0)[][]

export type GameStatus = 'playing' | 'won'

export interface HistoryEntry {
  row: number
  col: number
  prevValue: CellValue
  prevPencilMarks: number[]
}

export interface GameState {
  board: Board
  solution: RawBoard
  difficulty: Difficulty
  selectedCell: [number, number] | null
  status: GameStatus
  mistakes: number
  hintsUsed: number
  timer: number
  history: HistoryEntry[]
  noteMode: boolean
}
