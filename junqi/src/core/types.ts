export type Player = 'red' | 'blue'

export type PieceType =
  | 'commander' | 'general' | 'majorGeneral' | 'colonel' | 'major' | 'captain'
  | 'lieutenant' | 'sergeant' | 'engineer' | 'bomb' | 'mine' | 'flag'

export type CellType = 'normal' | 'bunker' | 'headquarters'

export interface Piece {
  type: PieceType
  player: Player
  rank: number
  revealed: boolean
}

export type Board = (Piece | null)[][]

export const ROWS = 12
export const COLS = 5

export const RANK: Record<PieceType, number> = {
  commander: 9,
  general: 8,
  majorGeneral: 7,
  colonel: 6,
  major: 5,
  captain: 4,
  lieutenant: 3,
  sergeant: 2,
  engineer: 1,
  bomb: 10,
  mine: 0,
  flag: -1,
}

export const PIECE_NAMES: Record<PieceType, string> = {
  commander: '司令',
  general: '军长',
  majorGeneral: '师长',
  colonel: '旅长',
  major: '团长',
  captain: '营长',
  lieutenant: '连长',
  sergeant: '排长',
  engineer: '工兵',
  bomb: '炸弹',
  mine: '地雷',
  flag: '军旗',
}

export const HEADQUARTERS: [number, number][] = [[0,0],[0,4],[11,0],[11,4]]

export const BUNKERS: [number, number][] = [[1,1],[1,3],[4,1],[4,3],[7,1],[7,3],[10,1],[10,3]]

export function isRailroad(r: number, c: number): boolean {
  // Horizontal railroad at rows 3 and 8
  if ((r === 3 || r === 8) && c >= 0 && c < COLS) return true
  // Vertical railroad at cols 0, 2, 4
  if ((c === 0 || c === 2 || c === 4) && r >= 0 && r < ROWS) return true
  return false
}

export function isBunker(r: number, c: number): boolean {
  return BUNKERS.some(([br, bc]) => br === r && bc === c)
}

export function isHeadquarters(r: number, c: number): boolean {
  return HEADQUARTERS.some(([hr, hc]) => hr === r && hc === c)
}

export function isOwnSide(r: number, player: Player): boolean {
  return player === 'blue' ? r <= 5 : r >= 6
}

export type GameMode = 'hidden' | 'flip'

export type GamePhase = 'setup' | 'playing' | 'over'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Move {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}
