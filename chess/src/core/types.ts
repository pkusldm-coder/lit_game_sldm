export type Player = 'red' | 'black'

export type PieceType = 'king' | 'advisor' | 'bishop' | 'knight' | 'rook' | 'cannon' | 'pawn'

export interface Piece {
  type: PieceType
  player: Player
}

export type Board = (Piece | null)[][]

export const ROWS = 10
export const COLS = 9

export const RED_PALACE = { rMin: 7, rMax: 9, cMin: 3, cMax: 5 }
export const BLACK_PALACE = { rMin: 0, rMax: 2, cMin: 3, cMax: 5 }

export const PIECE_NAMES: Record<Player, Record<PieceType, string>> = {
  red: { king: '帅', advisor: '仕', bishop: '相', knight: '马', rook: '车', cannon: '炮', pawn: '兵' },
  black: { king: '将', advisor: '士', bishop: '象', knight: '马', rook: '车', cannon: '砲', pawn: '卒' },
}

export const PIECE_ORDER: PieceType[] = ['rook', 'knight', 'bishop', 'advisor', 'king', 'advisor', 'bishop', 'knight', 'rook']

export type GamePhase = 'select' | 'playing' | 'over'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Move {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}
