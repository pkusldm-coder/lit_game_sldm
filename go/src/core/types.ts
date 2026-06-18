export type Stone = 'black' | 'white'
export type Board = (Stone | null)[][]

export const BOARD_SIZE = 19

export type GamePhase = 'select' | 'playing' | 'counting' | 'over'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameMode = 'ai' | 'pvp'