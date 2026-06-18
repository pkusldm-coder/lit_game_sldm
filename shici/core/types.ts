export interface Poem {
  id: number
  upper: string
  lower: string
  title: string
  author: string
  dynasty: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameState {
  poems: Poem[]
  index: number
  score: number
  showResult: { selected: string; correct: boolean } | null
  done: boolean
}