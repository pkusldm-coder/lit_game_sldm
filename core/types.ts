export type GameMode = 'cainizi' | 'dengmi' | 'shici' | 'shicitian' | 'naojin' | 'xiehouyu'

export interface Riddle {
  id: number
  hint: string
  answer: string
  options: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
}

export interface GameState {
  riddles: Riddle[]
  index: number
  score: number
  showResult: { selected: string; correct: boolean } | null
  done: boolean
}
