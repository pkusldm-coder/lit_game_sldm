export interface TrickRiddle {
  id: number
  question: string
  answer: string
  options: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}