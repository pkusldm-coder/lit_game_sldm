export interface FillEntry {
  id: number
  line: string
  blank: string
  answer: string
  options: string[]
  title: string
  author: string
  dynasty: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameState {
  entries: FillEntry[]
  index: number
  score: number
  showResult: { selected: string; correct: boolean } | null
  done: boolean
}