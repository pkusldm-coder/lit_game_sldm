export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue'

export type PieceState = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57

export const HANGAR: PieceState = -1
export const GOAL_PROGRESS = 57

export interface Piece {
  color: PlayerColor
  progress: PieceState
  id: number
}

export type GamePhase = 'select' | 'playing' | 'over'

export type Difficulty = 'easy' | 'medium' | 'hard'

export const PLAYER_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue']

export const COLOR_NAMES: Record<PlayerColor, string> = {
  red: '红',
  green: '绿',
  yellow: '黄',
  blue: '蓝',
}

export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#e74c3c',
  green: '#27ae60',
  yellow: '#f1c40f',
  blue: '#3498db',
}

export const COLOR_HEX_DARK: Record<PlayerColor, string> = {
  red: '#c0392b',
  green: '#1e8449',
  yellow: '#d4ac0d',
  blue: '#2471a3',
}