export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'

export type CellState = PlayerColor | null

export type BoardMap = Map<string, CellState>

export type GamePhase = 'select' | 'playing' | 'over'

export type Difficulty = 'easy' | 'medium' | 'hard'

export const PLAYER_ORDER: PlayerColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'orange']

export const COLOR_NAMES: Record<PlayerColor, string> = {
  red: '红',
  blue: '蓝',
  yellow: '黄',
  green: '绿',
  purple: '紫',
  orange: '橙',
}

export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  yellow: '#f1c40f',
  green: '#27ae60',
  purple: '#8e44ad',
  orange: '#e67e22',
}

export const OPPOSITE: Record<PlayerColor, PlayerColor> = {
  red: 'yellow',
  yellow: 'red',
  blue: 'green',
  green: 'blue',
  purple: 'orange',
  orange: 'purple',
}